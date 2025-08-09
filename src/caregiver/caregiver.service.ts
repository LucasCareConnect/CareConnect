import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CaregiverRepository } from './caregiver.repository';
import { UserService } from '../user/user.service';
import { CreateCaregiverDto } from './dto/create-caregiver.dto';
import { UpdateCaregiverDto } from './dto/update-caregiver.dto';
import { QueryCaregiversDto } from './dto/query-caregivers.dto';
import { CaregiverResponseDto } from './dto/caregiver-response.dto';
import { PaginatedCaregivers } from './interfaces/paginated-caregivers.interface';
import { UserRole } from '../user/enum/user-role.enum';
import { CaregiverStatus, Caregiver } from './entities/caregiver.entity';

@Injectable()
export class CaregiverService {
  constructor(
    private readonly caregiverRepository: CaregiverRepository,
    private readonly userService: UserService,
  ) {}

  /**
   * Cria um novo perfil de cuidador
   */
  async create(
    createCaregiverDto: CreateCaregiverDto,
  ): Promise<CaregiverResponseDto> {
    // Verificar se o usuário existe e é do tipo CAREGIVER
    const user = await this.userService.findOne(createCaregiverDto.userId);
    if (user.userType !== UserRole.CAREGIVER) {
      throw new BadRequestException('Usuário deve ser do tipo CAREGIVER');
    }

    // Verificar se já existe um perfil de cuidador para este usuário
    const existingCaregiver = await this.caregiverRepository.findByUserId(
      createCaregiverDto.userId,
    );
    if (existingCaregiver) {
      throw new ConflictException(
        'Já existe um perfil de cuidador para este usuário',
      );
    }

    const caregiver = await this.caregiverRepository.create({
      ...createCaregiverDto,
      status: CaregiverStatus.PENDING,
      rating: 0,
      totalReviews: 0,
      totalAppointments: 0,
    });

    return this.caregiverRepository.findById(caregiver.id).then((result) => {
      if (!result) {
        throw new NotFoundException('Erro ao criar cuidador');
      }
      return this.toResponseDto(result);
    });
  }

  /**
   * Lista todos os cuidadores com filtros
   */
  async findAll(query: QueryCaregiversDto): Promise<PaginatedCaregivers> {
    return this.caregiverRepository.findAll(query);
  }

  /**
   * Busca um cuidador por ID
   */
  async findOne(id: number): Promise<CaregiverResponseDto> {
    const caregiver = await this.caregiverRepository.findById(id);
    if (!caregiver) {
      throw new NotFoundException('Cuidador não encontrado');
    }
    return this.toResponseDto(caregiver);
  }

  /**
   * Busca um cuidador por ID do usuário
   */
  async findByUserId(userId: number): Promise<CaregiverResponseDto> {
    const caregiver = await this.caregiverRepository.findByUserId(userId);
    if (!caregiver) {
      throw new NotFoundException(
        'Perfil de cuidador não encontrado para este usuário',
      );
    }
    return this.toResponseDto(caregiver);
  }

  /**
   * Atualiza um cuidador
   */
  async update(
    id: number,
    updateCaregiverDto: UpdateCaregiverDto,
  ): Promise<CaregiverResponseDto> {
    const existingCaregiver = await this.caregiverRepository.findById(id);
    if (!existingCaregiver) {
      throw new NotFoundException('Cuidador não encontrado');
    }

    const updatedCaregiver = await this.caregiverRepository.update(
      id,
      updateCaregiverDto,
    );
    if (!updatedCaregiver) {
      throw new NotFoundException('Erro ao atualizar cuidador');
    }

    return this.toResponseDto(updatedCaregiver);
  }

  /**
   * Remove um cuidador
   */
  async remove(id: number): Promise<void> {
    const caregiver = await this.caregiverRepository.findById(id);
    if (!caregiver) {
      throw new NotFoundException('Cuidador não encontrado');
    }

    await this.caregiverRepository.delete(id);
  }

  /**
   * Aprova um cuidador
   */
  async approve(id: number): Promise<CaregiverResponseDto> {
    return this.updateStatus(id, CaregiverStatus.APPROVED);
  }

  /**
   * Suspende um cuidador
   */
  async suspend(id: number): Promise<CaregiverResponseDto> {
    return this.updateStatus(id, CaregiverStatus.SUSPENDED);
  }

  /**
   * Reativa um cuidador
   */
  async reactivate(id: number): Promise<CaregiverResponseDto> {
    return this.updateStatus(id, CaregiverStatus.APPROVED);
  }

  /**
   * Atualiza o status de um cuidador
   */
  private async updateStatus(
    id: number,
    status: CaregiverStatus,
  ): Promise<CaregiverResponseDto> {
    const caregiver = await this.caregiverRepository.findById(id);
    if (!caregiver) {
      throw new NotFoundException('Cuidador não encontrado');
    }

    const updatedCaregiver = await this.caregiverRepository.update(id, {
      status,
    });
    if (!updatedCaregiver) {
      throw new NotFoundException('Erro ao atualizar status do cuidador');
    }

    return this.toResponseDto(updatedCaregiver);
  }

  /**
   * Atualiza a avaliação de um cuidador
   */
  async updateRating(id: number, newRating: number): Promise<void> {
    const caregiver = await this.caregiverRepository.findById(id);
    if (!caregiver) {
      throw new NotFoundException('Cuidador não encontrado');
    }

    // Calcular nova média
    const totalReviews = caregiver.totalReviews + 1;
    const currentTotal = caregiver.rating * caregiver.totalReviews;
    const newAverage = (currentTotal + newRating) / totalReviews;

    await this.caregiverRepository.updateRating(id, newAverage, totalReviews);
  }

  /**
   * Registra um novo agendamento para o cuidador
   */
  async recordAppointment(id: number): Promise<void> {
    const caregiver = await this.caregiverRepository.findById(id);
    if (!caregiver) {
      throw new NotFoundException('Cuidador não encontrado');
    }

    await this.caregiverRepository.incrementAppointments(id);
    await this.caregiverRepository.updateLastActive(id);
  }

  /**
   * Busca cuidadores por especialidade
   */
  async findBySpecialty(specialty: string): Promise<CaregiverResponseDto[]> {
    const caregivers =
      await this.caregiverRepository.findBySpecialty(specialty);
    return caregivers.map((caregiver) => this.toResponseDto(caregiver));
  }

  /**
   * Converte entidade para DTO de resposta
   */
  private toResponseDto(caregiver: Caregiver): CaregiverResponseDto {
    return {
      id: caregiver.id,
      userId: caregiver.userId,
      user: {
        id: caregiver.user.id,
        name: caregiver.user.name,
        email: caregiver.user.email,
        phone: caregiver.user.phone,
        userType: caregiver.user.userType,
        createdAt: caregiver.user.createdAt,
      },
      bio: caregiver.bio,
      experience: caregiver.experience,
      experienceLevel: caregiver.experienceLevel,
      hourlyRate: caregiver.hourlyRate,
      specialties: caregiver.specialties,
      certifications: caregiver.certifications,
      languages: caregiver.languages,
      isAvailable: caregiver.isAvailable,
      status: caregiver.status,
      rating: caregiver.rating,
      totalReviews: caregiver.totalReviews,
      totalAppointments: caregiver.totalAppointments,
      profilePicture: caregiver.profilePicture,
      backgroundCheck: caregiver.backgroundCheck,
      backgroundCheckDate: caregiver.backgroundCheckDate,
      lastActive: caregiver.lastActive,
      createdAt: caregiver.createdAt,
      updatedAt: caregiver.updatedAt,
    };
  }
}
