import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { AppointmentRepository } from './appointment.repository';
import { CaregiverService } from '../caregiver/caregiver.service';
import { UserService } from '../user/user.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { QueryAppointmentsDto } from './dto/query-appointments.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { PaginatedAppointments } from './interfaces/paginated-appointments.interface';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { UserRole } from '../user/enum/user-role.enum';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly caregiverService: CaregiverService,
    private readonly userService: UserService,
  ) {}

  /**
   * Cria um novo agendamento
   */
  async create(
    familyUserId: number,
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    // Verificar se o usuário é da família
    const familyUser = await this.userService.findById(familyUserId);
    if (!familyUser || familyUser.userType !== UserRole.FAMILY) {
      throw new ForbiddenException(
        'Apenas usuários do tipo família podem criar agendamentos',
      );
    }

    // Verificar se o cuidador existe e está aprovado
    const caregiver = await this.caregiverService.findOne(
      createAppointmentDto.caregiverId,
    );

    // Validar datas
    const startDate = new Date(createAppointmentDto.startDate);
    const endDate = new Date(createAppointmentDto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException(
        'Data de início deve ser anterior à data de término',
      );
    }

    if (startDate < new Date()) {
      throw new BadRequestException('Data de início não pode ser no passado');
    }

    // Verificar conflitos de agenda do cuidador
    const conflicts = await this.appointmentRepository.checkConflicts(
      createAppointmentDto.caregiverId,
      startDate,
      endDate,
    );

    if (conflicts.length > 0) {
      throw new ConflictException(
        'Cuidador já possui agendamento neste horário',
      );
    }

    // Calcular horas e valor total
    const totalHours = this.calculateHours(startDate, endDate);
    const totalAmount = totalHours * createAppointmentDto.hourlyRate;

    const appointmentData = {
      familyUserId,
      caregiverId: createAppointmentDto.caregiverId,
      type: createAppointmentDto.type,
      startDate,
      endDate,
      hourlyRate: createAppointmentDto.hourlyRate,
      totalHours,
      totalAmount,
      notes: createAppointmentDto.notes,
      specialRequirements: createAppointmentDto.specialRequirements,
      address: createAppointmentDto.address,
      emergencyContact: createAppointmentDto.emergencyContact,
      emergencyPhone: createAppointmentDto.emergencyPhone,
      status: AppointmentStatus.PENDING,
    };

    const appointment =
      await this.appointmentRepository.create(appointmentData);
    return this.toResponseDto(appointment);
  }

  /**
   * Busca agendamento por ID
   */
  async findById(id: number): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }
    return this.toResponseDto(appointment);
  }

  /**
   * Busca agendamentos com filtros e paginação
   */
  async findAll(query: QueryAppointmentsDto): Promise<PaginatedAppointments> {
    const { appointments, total } =
      await this.appointmentRepository.findWithFilters(query);

    return {
      data: appointments.map((appointment) => this.toResponseDto(appointment)),
      total,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil(total / (query.limit || 10)),
    };
  }

  /**
   * Busca agendamentos de uma família
   */
  async findByFamilyUser(
    familyUserId: number,
    query: QueryAppointmentsDto,
  ): Promise<PaginatedAppointments> {
    const { appointments, total } =
      await this.appointmentRepository.findByFamilyUser(familyUserId, query);

    return {
      data: appointments.map((appointment) => this.toResponseDto(appointment)),
      total,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil(total / (query.limit || 10)),
    };
  }

  /**
   * Busca agendamentos de um cuidador
   */
  async findByCaregiver(
    caregiverId: number,
    query: QueryAppointmentsDto,
  ): Promise<PaginatedAppointments> {
    const { appointments, total } =
      await this.appointmentRepository.findByCaregiver(caregiverId, query);

    return {
      data: appointments.map((appointment) => this.toResponseDto(appointment)),
      total,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil(total / (query.limit || 10)),
    };
  }

  /**
   * Atualiza um agendamento
   */
  async update(
    id: number,
    userId: number,
    userRole: UserRole,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    // Verificar permissões
    if (userRole === UserRole.FAMILY && appointment.familyUserId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar este agendamento',
      );
    }

    if (userRole === UserRole.CAREGIVER) {
      const caregiver = await this.caregiverService.findByUserId(userId);
      if (!caregiver || appointment.caregiverId !== caregiver.id) {
        throw new ForbiddenException(
          'Você não tem permissão para atualizar este agendamento',
        );
      }
    }

    // Validar mudanças de status
    this.validateStatusChange(appointment.status, updateAppointmentDto.status);

    const updateData: Partial<Appointment> = {
      status: updateAppointmentDto.status,
      cancellationReason: updateAppointmentDto.cancellationReason,
      caregiverId: updateAppointmentDto.caregiverId,
      type: updateAppointmentDto.type,
      hourlyRate: updateAppointmentDto.hourlyRate,
      notes: updateAppointmentDto.notes,
      specialRequirements: updateAppointmentDto.specialRequirements,
      address: updateAppointmentDto.address,
      emergencyContact: updateAppointmentDto.emergencyContact,
      emergencyPhone: updateAppointmentDto.emergencyPhone,
    };

    // Se está alterando datas, validar e recalcular
    if (updateAppointmentDto.startDate || updateAppointmentDto.endDate) {
      const startDate = updateAppointmentDto.startDate
        ? new Date(updateAppointmentDto.startDate)
        : appointment.startDate;
      const endDate = updateAppointmentDto.endDate
        ? new Date(updateAppointmentDto.endDate)
        : appointment.endDate;

      if (startDate >= endDate) {
        throw new BadRequestException(
          'Data de início deve ser anterior à data de término',
        );
      }

      // Verificar conflitos se mudou as datas
      if (updateAppointmentDto.startDate || updateAppointmentDto.endDate) {
        const conflicts = await this.appointmentRepository.checkConflicts(
          appointment.caregiverId,
          startDate,
          endDate,
          id,
        );

        if (conflicts.length > 0) {
          throw new ConflictException(
            'Cuidador já possui agendamento neste horário',
          );
        }
      }

      updateData.startDate = startDate;
      updateData.endDate = endDate;
      updateData.totalHours = this.calculateHours(startDate, endDate);
      updateData.totalAmount =
        updateData.totalHours *
        (updateAppointmentDto.hourlyRate || appointment.hourlyRate);
    }

    // Atualizar timestamps baseado no status
    if (updateAppointmentDto.status) {
      switch (updateAppointmentDto.status) {
        case AppointmentStatus.CONFIRMED:
          updateData.confirmedAt = new Date();
          break;
        case AppointmentStatus.IN_PROGRESS:
          updateData.startedAt = new Date();
          break;
        case AppointmentStatus.COMPLETED:
          updateData.completedAt = new Date();
          break;
        case AppointmentStatus.CANCELLED:
        case AppointmentStatus.CANCELLED_BY_FAMILY:
        case AppointmentStatus.CANCELLED_BY_CAREGIVER:
          updateData.cancelledAt = new Date();
          updateData.cancelledBy =
            userRole === UserRole.FAMILY ? 'family' : 'caregiver';
          break;
      }
    }

    const updatedAppointment = await this.appointmentRepository.update(
      id,
      updateData,
    );
    if (!updatedAppointment) {
      throw new NotFoundException('Erro ao atualizar agendamento');
    }
    return this.toResponseDto(updatedAppointment);
  }

  /**
   * Remove um agendamento
   */
  async remove(id: number, userId: number, userRole: UserRole): Promise<void> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    // Verificar permissões
    if (userRole === UserRole.FAMILY && appointment.familyUserId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para remover este agendamento',
      );
    }

    if (userRole === UserRole.CAREGIVER) {
      const caregiver = await this.caregiverService.findByUserId(userId);
      if (!caregiver || appointment.caregiverId !== caregiver.id) {
        throw new ForbiddenException(
          'Você não tem permissão para remover este agendamento',
        );
      }
    }

    // Só permite remover agendamentos pendentes ou cancelados
    if (
      ![
        AppointmentStatus.PENDING,
        AppointmentStatus.CANCELLED,
        AppointmentStatus.CANCELLED_BY_FAMILY,
        AppointmentStatus.CANCELLED_BY_CAREGIVER,
      ].includes(appointment.status)
    ) {
      throw new BadRequestException(
        'Só é possível remover agendamentos pendentes ou cancelados',
      );
    }

    await this.appointmentRepository.delete(id);
  }

  /**
   * Confirma um agendamento (apenas cuidador)
   */
  async confirm(
    id: number,
    caregiverUserId: number,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    const caregiver = await this.caregiverService.findByUserId(caregiverUserId);
    if (!caregiver || appointment.caregiverId !== caregiver.id) {
      throw new ForbiddenException(
        'Você não tem permissão para confirmar este agendamento',
      );
    }

    if (appointment.status !== AppointmentStatus.PENDING) {
      throw new BadRequestException(
        'Apenas agendamentos pendentes podem ser confirmados',
      );
    }

    const updateData = {
      status: AppointmentStatus.CONFIRMED,
      confirmedAt: new Date(),
    };

    const updatedAppointment = await this.appointmentRepository.update(
      id,
      updateData,
    );
    if (!updatedAppointment) {
      throw new NotFoundException('Erro ao confirmar agendamento');
    }
    return this.toResponseDto(updatedAppointment);
  }

  /**
   * Cancela um agendamento
   */
  async cancel(
    id: number,
    userId: number,
    userRole: UserRole,
    reason?: string,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    // Verificar permissões
    if (userRole === UserRole.FAMILY && appointment.familyUserId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para cancelar este agendamento',
      );
    }

    if (userRole === UserRole.CAREGIVER) {
      const caregiver = await this.caregiverService.findByUserId(userId);
      if (!caregiver || appointment.caregiverId !== caregiver.id) {
        throw new ForbiddenException(
          'Você não tem permissão para cancelar este agendamento',
        );
      }
    }

    if (
      [
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELLED,
        AppointmentStatus.CANCELLED_BY_FAMILY,
        AppointmentStatus.CANCELLED_BY_CAREGIVER,
      ].includes(appointment.status)
    ) {
      throw new BadRequestException('Este agendamento não pode ser cancelado');
    }

    const status =
      userRole === UserRole.FAMILY
        ? AppointmentStatus.CANCELLED_BY_FAMILY
        : AppointmentStatus.CANCELLED_BY_CAREGIVER;

    const updateData = {
      status,
      cancelledAt: new Date(),
      cancelledBy:
        userRole === UserRole.FAMILY
          ? ('family' as const)
          : ('caregiver' as const),
      cancellationReason: reason,
    };

    const updatedAppointment = await this.appointmentRepository.update(
      id,
      updateData,
    );
    if (!updatedAppointment) {
      throw new NotFoundException('Erro ao cancelar agendamento');
    }
    return this.toResponseDto(updatedAppointment);
  }

  /**
   * Métodos auxiliares privados
   */
  private calculateHours(startDate: Date, endDate: Date): number {
    const diffInMs = endDate.getTime() - startDate.getTime();
    return Math.round((diffInMs / (1000 * 60 * 60)) * 100) / 100; // Arredondar para 2 casas decimais
  }

  private validateStatusChange(
    currentStatus: AppointmentStatus,
    newStatus?: AppointmentStatus,
  ): void {
    if (!newStatus) return;

    const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      [AppointmentStatus.PENDING]: [
        AppointmentStatus.CONFIRMED,
        AppointmentStatus.CANCELLED,
        AppointmentStatus.CANCELLED_BY_FAMILY,
        AppointmentStatus.CANCELLED_BY_CAREGIVER,
      ],
      [AppointmentStatus.CONFIRMED]: [
        AppointmentStatus.IN_PROGRESS,
        AppointmentStatus.CANCELLED,
        AppointmentStatus.CANCELLED_BY_FAMILY,
        AppointmentStatus.CANCELLED_BY_CAREGIVER,
      ],
      [AppointmentStatus.IN_PROGRESS]: [
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELLED,
        AppointmentStatus.CANCELLED_BY_FAMILY,
        AppointmentStatus.CANCELLED_BY_CAREGIVER,
      ],
      [AppointmentStatus.COMPLETED]: [],
      [AppointmentStatus.CANCELLED]: [],
      [AppointmentStatus.CANCELLED_BY_FAMILY]: [],
      [AppointmentStatus.CANCELLED_BY_CAREGIVER]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Não é possível alterar status de ${currentStatus} para ${newStatus}`,
      );
    }
  }

  private toResponseDto(appointment: Appointment): AppointmentResponseDto {
    return {
      id: appointment.id,
      familyUserId: appointment.familyUserId,
      familyUser: {
        id: appointment.familyUser.id,
        name: appointment.familyUser.name,
        email: appointment.familyUser.email,
        phone: appointment.familyUser.phone,
        userType: appointment.familyUser.userType,
        createdAt: appointment.familyUser.createdAt,
      },
      caregiverId: appointment.caregiverId,
      caregiver: {
        id: appointment.caregiver.id,
        userId: appointment.caregiver.userId,
        user: {
          id: appointment.caregiver.user.id,
          name: appointment.caregiver.user.name,
          email: appointment.caregiver.user.email,
          phone: appointment.caregiver.user.phone,
          userType: appointment.caregiver.user.userType,
          createdAt: appointment.caregiver.user.createdAt,
        },
        bio: appointment.caregiver.bio,
        experience: appointment.caregiver.experience,
        experienceLevel: appointment.caregiver.experienceLevel,
        hourlyRate: appointment.caregiver.hourlyRate,
        specialties: appointment.caregiver.specialties,
        certifications: appointment.caregiver.certifications,
        languages: appointment.caregiver.languages,
        isAvailable: appointment.caregiver.isAvailable,
        status: appointment.caregiver.status,
        rating: appointment.caregiver.rating,
        totalReviews: appointment.caregiver.totalReviews,
        totalAppointments: appointment.caregiver.totalAppointments,
        profilePicture: appointment.caregiver.profilePicture,
        backgroundCheck: appointment.caregiver.backgroundCheck,
        backgroundCheckDate: appointment.caregiver.backgroundCheckDate,
        lastActive: appointment.caregiver.lastActive,
        createdAt: appointment.caregiver.createdAt,
        updatedAt: appointment.caregiver.updatedAt,
      },
      status: appointment.status,
      type: appointment.type,
      startDate: appointment.startDate,
      endDate: appointment.endDate,
      hourlyRate: appointment.hourlyRate,
      totalHours: appointment.totalHours,
      totalAmount: appointment.totalAmount,
      notes: appointment.notes,
      specialRequirements: appointment.specialRequirements,
      address: appointment.address,
      emergencyContact: appointment.emergencyContact,
      emergencyPhone: appointment.emergencyPhone,
      confirmedAt: appointment.confirmedAt,
      startedAt: appointment.startedAt,
      completedAt: appointment.completedAt,
      cancelledAt: appointment.cancelledAt,
      cancellationReason: appointment.cancellationReason,
      cancelledBy: appointment.cancelledBy,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };
  }
}
