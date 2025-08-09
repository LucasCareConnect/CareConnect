import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Caregiver } from './entities/caregiver.entity';
import { QueryCaregiversDto } from './dto/query-caregivers.dto';
import { PaginatedCaregivers } from './interfaces/paginated-caregivers.interface';
import { CaregiverResponseDto } from './dto/caregiver-response.dto';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { CaregiverStatus, ExperienceLevel } from './entities/caregiver.entity';

interface CaregiverFilters {
  search?: string;
  status?: CaregiverStatus;
  experienceLevel?: ExperienceLevel;
  isAvailable?: boolean;
  minHourlyRate?: number;
  maxHourlyRate?: number;
  minRating?: number;
  backgroundCheck?: boolean;
  specialty?: string;
}

@Injectable()
export class CaregiverRepository {
  constructor(
    @InjectRepository(Caregiver)
    private readonly caregiverRepository: Repository<Caregiver>,
  ) {}

  /**
   * Cria um novo cuidador
   */
  async create(caregiverData: Partial<Caregiver>): Promise<Caregiver> {
    const caregiver = this.caregiverRepository.create(caregiverData);
    return this.caregiverRepository.save(caregiver);
  }

  /**
   * Busca um cuidador por ID
   */
  async findById(id: number): Promise<Caregiver | null> {
    return this.caregiverRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  /**
   * Busca um cuidador por ID do usuário
   */
  async findByUserId(userId: number): Promise<Caregiver | null> {
    return this.caregiverRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
  }

  /**
   * Lista todos os cuidadores com filtros e paginação
   */
  async findAll(query: QueryCaregiversDto): Promise<PaginatedCaregivers> {
    const {
      search,
      status,
      experienceLevel,
      isAvailable,
      minHourlyRate,
      maxHourlyRate,
      minRating,
      backgroundCheck,
      specialty,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 10,
    } = query;

    const queryBuilder = this.caregiverRepository
      .createQueryBuilder('caregiver')
      .leftJoinAndSelect('caregiver.user', 'user');

    // Aplicar filtros
    this.applyFilters(queryBuilder, {
      search,
      status,
      experienceLevel,
      isAvailable,
      minHourlyRate,
      maxHourlyRate,
      minRating,
      backgroundCheck,
      specialty,
    });

    // Aplicar ordenação
    this.applySorting(queryBuilder, sortBy, sortOrder);

    // Aplicar paginação
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [caregivers, total] = await queryBuilder.getManyAndCount();

    return {
      data: caregivers.map((caregiver) => this.toResponseDto(caregiver)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Atualiza um cuidador
   */
  async update(
    id: number,
    updateData: Partial<Caregiver>,
  ): Promise<Caregiver | null> {
    await this.caregiverRepository.update(id, updateData);
    return this.findById(id);
  }

  /**
   * Remove um cuidador
   */
  async delete(id: number): Promise<void> {
    await this.caregiverRepository.delete(id);
  }

  /**
   * Atualiza a avaliação média do cuidador
   */
  async updateRating(
    id: number,
    rating: number,
    totalReviews: number,
  ): Promise<void> {
    await this.caregiverRepository.update(id, { rating, totalReviews });
  }

  /**
   * Incrementa o contador de agendamentos
   */
  async incrementAppointments(id: number): Promise<void> {
    await this.caregiverRepository.increment({ id }, 'totalAppointments', 1);
  }

  /**
   * Atualiza a última atividade do cuidador
   */
  async updateLastActive(id: number): Promise<void> {
    await this.caregiverRepository.update(id, { lastActive: new Date() });
  }

  /**
   * Busca cuidadores por especialidade
   */
  async findBySpecialty(specialty: string): Promise<Caregiver[]> {
    return this.caregiverRepository
      .createQueryBuilder('caregiver')
      .leftJoinAndSelect('caregiver.user', 'user')
      .where('JSON_CONTAINS(caregiver.specialties, :specialty)', {
        specialty: JSON.stringify([specialty]),
      })
      .getMany();
  }

  /**
   * Aplica filtros na query
   */
  private applyFilters(
    queryBuilder: SelectQueryBuilder<Caregiver>,
    filters: CaregiverFilters,
  ): void {
    const {
      search,
      status,
      experienceLevel,
      isAvailable,
      minHourlyRate,
      maxHourlyRate,
      minRating,
      backgroundCheck,
      specialty,
    } = filters;

    if (search) {
      queryBuilder.andWhere(
        '(user.name LIKE :search OR caregiver.bio LIKE :search OR JSON_SEARCH(caregiver.specialties, "one", :search) IS NOT NULL)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('caregiver.status = :status', { status });
    }

    if (experienceLevel) {
      queryBuilder.andWhere('caregiver.experienceLevel = :experienceLevel', {
        experienceLevel,
      });
    }

    if (isAvailable !== undefined) {
      queryBuilder.andWhere('caregiver.isAvailable = :isAvailable', {
        isAvailable,
      });
    }

    if (minHourlyRate !== undefined) {
      queryBuilder.andWhere('caregiver.hourlyRate >= :minHourlyRate', {
        minHourlyRate,
      });
    }

    if (maxHourlyRate !== undefined) {
      queryBuilder.andWhere('caregiver.hourlyRate <= :maxHourlyRate', {
        maxHourlyRate,
      });
    }

    if (minRating !== undefined) {
      queryBuilder.andWhere('caregiver.rating >= :minRating', { minRating });
    }

    if (backgroundCheck !== undefined) {
      queryBuilder.andWhere('caregiver.backgroundCheck = :backgroundCheck', {
        backgroundCheck,
      });
    }

    if (specialty) {
      queryBuilder.andWhere(
        'JSON_CONTAINS(caregiver.specialties, :specialty)',
        { specialty: JSON.stringify([specialty]) },
      );
    }
  }

  /**
   * Aplica ordenação na query
   */
  private applySorting(
    queryBuilder: SelectQueryBuilder<Caregiver>,
    sortBy: string,
    sortOrder: 'ASC' | 'DESC',
  ): void {
    switch (sortBy) {
      case 'rating':
        queryBuilder.orderBy('caregiver.rating', sortOrder);
        break;
      case 'experience':
        queryBuilder.orderBy('caregiver.experience', sortOrder);
        break;
      case 'hourlyRate':
        queryBuilder.orderBy('caregiver.hourlyRate', sortOrder);
        break;
      case 'totalReviews':
        queryBuilder.orderBy('caregiver.totalReviews', sortOrder);
        break;
      default:
        queryBuilder.orderBy('caregiver.createdAt', sortOrder);
    }
  }

  /**
   * Converte entidade para DTO de resposta
   */
  private toResponseDto(caregiver: Caregiver): CaregiverResponseDto {
    const userDto: UserResponseDto = {
      id: caregiver.user.id,
      name: caregiver.user.name,
      email: caregiver.user.email,
      phone: caregiver.user.phone,
      userType: caregiver.user.userType,
      createdAt: caregiver.user.createdAt,
    };

    return {
      id: caregiver.id,
      userId: caregiver.userId,
      user: userDto,
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
