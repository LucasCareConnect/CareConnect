import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { AvailabilityRepository } from './availability.repository';
import { UserService } from '../user/user.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { QueryAvailabilityDto } from './dto/query-availability.dto';
import { SearchCaregiversDto } from './dto/search-caregivers.dto';
import { AvailabilityResponseDto } from './dto/availability-response.dto';
import { PaginatedAvailabilities } from './interfaces/paginated-availabilities.interface';
import { Availability } from './entities/availability.entity';
import { UserRole } from '../user/enum/user-role.enum';

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly userService: UserService,
  ) {}

  async create(
    caregiverId: number,
    createAvailabilityDto: CreateAvailabilityDto,
  ): Promise<AvailabilityResponseDto> {
    const caregiver = await this.userService.findById(caregiverId);
    if (!caregiver) {
      throw new NotFoundException('Cuidador não encontrado');
    }

    if (caregiver.userType !== UserRole.CAREGIVER) {
      throw new BadRequestException('Usuário não é um cuidador');
    }

    // Converter string para Date se necessário
    const availabilityData: any = {
      ...createAvailabilityDto,
      caregiverId,
    };

    if (createAvailabilityDto.specificDate) {
      availabilityData.specificDate = new Date(
        createAvailabilityDto.specificDate,
      );
    }

    if (createAvailabilityDto.effectiveFrom) {
      availabilityData.effectiveFrom = new Date(
        createAvailabilityDto.effectiveFrom,
      );
    }

    if (createAvailabilityDto.effectiveUntil) {
      availabilityData.effectiveUntil = new Date(
        createAvailabilityDto.effectiveUntil,
      );
    }

    const availability =
      await this.availabilityRepository.create(availabilityData);

    return this.toAvailabilityResponseDto(availability);
  }

  async findMyAvailabilities(
    caregiverId: number,
    query?: QueryAvailabilityDto,
  ): Promise<PaginatedAvailabilities> {
    const result = await this.availabilityRepository.findByCaregiver(
      caregiverId,
      query || {},
    );
    return {
      data: result.availabilities,
      total: result.total,
      page: query?.page || 1,
      limit: query?.limit || 10,
      totalPages: Math.ceil(result.total / (query?.limit || 10)),
    };
  }

  async findActiveAvailabilities(
    caregiverId: number,
  ): Promise<AvailabilityResponseDto[]> {
    const result = await this.availabilityRepository.findByCaregiver(
      caregiverId,
      { isActive: true },
    );
    return result.availabilities.map((availability) =>
      this.toAvailabilityResponseDto(availability),
    );
  }

  async searchAvailableCaregivers(
    searchDto: SearchCaregiversDto,
  ): Promise<any> {
    return await this.availabilityRepository.findAvailableCaregivers(searchDto);
  }

  async findByCaregiverId(
    caregiverId: number,
    query?: QueryAvailabilityDto,
  ): Promise<PaginatedAvailabilities> {
    const caregiver = await this.userService.findById(caregiverId);
    if (!caregiver) {
      throw new NotFoundException('Cuidador não encontrado');
    }

    const result = await this.availabilityRepository.findByCaregiver(
      caregiverId,
      query || {},
    );
    return {
      data: result.availabilities,
      total: result.total,
      page: query?.page || 1,
      limit: query?.limit || 10,
      totalPages: Math.ceil(result.total / (query?.limit || 10)),
    };
  }

  async findByDate(
    date: Date,
    query?: QueryAvailabilityDto,
  ): Promise<AvailabilityResponseDto[]> {
    const dateString = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();

    const queryWithDate = {
      ...query,
      specificDate: dateString,
      dayOfWeek: dayOfWeek,
    };

    const result =
      await this.availabilityRepository.findWithFilters(queryWithDate);
    return result.availabilities.map((availability) =>
      this.toAvailabilityResponseDto(availability),
    );
  }

  async findByPeriod(
    startDate: Date,
    endDate: Date,
    query?: QueryAvailabilityDto,
  ): Promise<AvailabilityResponseDto[]> {
    const queryWithPeriod = {
      ...query,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };

    const result =
      await this.availabilityRepository.findWithFilters(queryWithPeriod);
    return result.availabilities.map((availability) =>
      this.toAvailabilityResponseDto(availability),
    );
  }

  async findAll(
    query?: QueryAvailabilityDto,
  ): Promise<PaginatedAvailabilities> {
    const result = await this.availabilityRepository.findWithFilters(
      query || {},
    );
    return {
      data: result.availabilities,
      total: result.total,
      page: query?.page || 1,
      limit: query?.limit || 10,
      totalPages: Math.ceil(result.total / (query?.limit || 10)),
    };
  }

  async findById(id: number): Promise<AvailabilityResponseDto> {
    const availability = await this.availabilityRepository.findById(id);
    if (!availability) {
      throw new NotFoundException('Disponibilidade não encontrada');
    }
    return this.toAvailabilityResponseDto(availability);
  }

  async update(
    id: number,
    caregiverId: number,
    userType: string,
    updateAvailabilityDto: UpdateAvailabilityDto,
  ): Promise<AvailabilityResponseDto> {
    const availability = await this.availabilityRepository.findById(id);
    if (!availability) {
      throw new NotFoundException('Disponibilidade não encontrada');
    }

    // Verificar permissões
    if (
      userType !== UserRole.ADMIN &&
      availability.caregiverId !== caregiverId
    ) {
      throw new ForbiddenException(
        'Sem permissão para atualizar esta disponibilidade',
      );
    }

    // Converter strings para Date se necessário
    const updateData: any = { ...updateAvailabilityDto };

    if (updateAvailabilityDto.specificDate) {
      updateData.specificDate = new Date(updateAvailabilityDto.specificDate);
    }

    if (updateAvailabilityDto.effectiveFrom) {
      updateData.effectiveFrom = new Date(updateAvailabilityDto.effectiveFrom);
    }

    if (updateAvailabilityDto.effectiveUntil) {
      updateData.effectiveUntil = new Date(
        updateAvailabilityDto.effectiveUntil,
      );
    }

    const updatedAvailability = await this.availabilityRepository.update(
      id,
      updateData,
    );
    if (!updatedAvailability) {
      throw new NotFoundException(
        'Disponibilidade não encontrada após atualização',
      );
    }
    return this.toAvailabilityResponseDto(updatedAvailability);
  }

  async remove(
    id: number,
    caregiverId: number,
    userType: string,
  ): Promise<void> {
    const availability = await this.availabilityRepository.findById(id);
    if (!availability) {
      throw new NotFoundException('Disponibilidade não encontrada');
    }

    // Verificar permissões
    if (
      userType !== UserRole.ADMIN &&
      availability.caregiverId !== caregiverId
    ) {
      throw new ForbiddenException(
        'Sem permissão para remover esta disponibilidade',
      );
    }

    // TODO: Verificar se não há agendamentos vinculados quando implementar o módulo de agendamentos

    await this.availabilityRepository.delete(id);
  }

  async createBulk(
    caregiverId: number,
    createAvailabilityDtos: CreateAvailabilityDto[],
  ): Promise<AvailabilityResponseDto[]> {
    const caregiver = await this.userService.findById(caregiverId);
    if (!caregiver) {
      throw new NotFoundException('Cuidador não encontrado');
    }

    if (caregiver.userType !== UserRole.CAREGIVER) {
      throw new BadRequestException('Usuário não é um cuidador');
    }

    const results: AvailabilityResponseDto[] = [];

    for (const dto of createAvailabilityDtos) {
      try {
        const availabilityData: any = {
          ...dto,
          caregiverId,
        };

        if (dto.specificDate) {
          availabilityData.specificDate = new Date(dto.specificDate);
        }

        if (dto.effectiveFrom) {
          availabilityData.effectiveFrom = new Date(dto.effectiveFrom);
        }

        if (dto.effectiveUntil) {
          availabilityData.effectiveUntil = new Date(dto.effectiveUntil);
        }

        const availability =
          await this.availabilityRepository.create(availabilityData);
        results.push(this.toAvailabilityResponseDto(availability));
      } catch (error) {
        // Continuar com as próximas disponibilidades em caso de erro
        continue;
      }
    }

    return results;
  }

  async toggleActive(
    id: number,
    caregiverId: number,
    userType: string,
  ): Promise<AvailabilityResponseDto> {
    const availability = await this.availabilityRepository.findById(id);
    if (!availability) {
      throw new NotFoundException('Disponibilidade não encontrada');
    }

    // Verificar permissões
    if (
      userType !== UserRole.ADMIN &&
      availability.caregiverId !== caregiverId
    ) {
      throw new ForbiddenException(
        'Sem permissão para modificar esta disponibilidade',
      );
    }

    const updatedAvailability = await this.availabilityRepository.update(id, {
      isActive: !availability.isActive,
    });

    if (!updatedAvailability) {
      throw new NotFoundException(
        'Disponibilidade não encontrada após atualização',
      );
    }

    return this.toAvailabilityResponseDto(updatedAvailability);
  }

  // Métodos auxiliares
  async validateAvailabilityOwnership(
    availabilityId: number,
    caregiverId: number,
  ): Promise<boolean> {
    const availability =
      await this.availabilityRepository.findById(availabilityId);
    return availability?.caregiverId === caregiverId;
  }

  async findAvailableSlots(
    caregiverId: number,
    date: Date,
    duration: number, // em minutos
  ): Promise<Array<{ startTime: string; endTime: string }>> {
    // TODO: Implementar busca de slots disponíveis
    return [];
  }

  async checkAvailability(
    caregiverId: number,
    date: Date,
    startTime: string,
    endTime: string,
  ): Promise<boolean> {
    // TODO: Implementar verificação de conflitos
    return true;
  }

  // DTO conversion
  private toAvailabilityResponseDto(
    availability: Availability,
  ): AvailabilityResponseDto {
    return {
      id: availability.id,
      caregiverId: availability.caregiverId,
      type: availability.type,
      dayOfWeek: availability.dayOfWeek,
      specificDate: availability.specificDate,
      startTime: availability.startTime,
      endTime: availability.endTime,
      serviceTypes: availability.serviceTypes,
      isAvailable: availability.isAvailable,
      notes: availability.notes,
      effectiveFrom: availability.effectiveFrom,
      effectiveUntil: availability.effectiveUntil,
      isActive: availability.isActive,
      createdAt: availability.createdAt,
      updatedAt: availability.updatedAt,
      caregiver: availability.caregiver
        ? {
            id: availability.caregiver.id,
            userId: availability.caregiver.userId,
            bio: availability.caregiver.bio,
            experience: availability.caregiver.experience,
            experienceLevel: availability.caregiver.experienceLevel,
            hourlyRate: availability.caregiver.hourlyRate,
            specialties: availability.caregiver.specialties,
            certifications: availability.caregiver.certifications,
            languages: availability.caregiver.languages,
            isAvailable: availability.caregiver.isAvailable,
            status: availability.caregiver.status,
            rating: availability.caregiver.rating,
            totalReviews: availability.caregiver.totalReviews,
            totalAppointments: availability.caregiver.totalAppointments,
            profilePicture: availability.caregiver.profilePicture,
            backgroundCheck: availability.caregiver.backgroundCheck,
            backgroundCheckDate: availability.caregiver.backgroundCheckDate,
            lastActive: availability.caregiver.lastActive,
            createdAt: availability.caregiver.createdAt,
            updatedAt: availability.caregiver.updatedAt,
            user: availability.caregiver.user
              ? {
                  id: availability.caregiver.user.id,
                  name: availability.caregiver.user.name,
                  email: availability.caregiver.user.email,
                  phone: availability.caregiver.user.phone,
                  userType: availability.caregiver.user.userType,
                  createdAt: availability.caregiver.user.createdAt,
                }
              : undefined,
          }
        : undefined,
    };
  }
}
