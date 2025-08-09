import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  Availability,
  AvailabilityType,
  DayOfWeek,
  ServiceType,
} from './entities/availability.entity';
import { QueryAvailabilityDto } from './dto/query-availability.dto';
import { SearchCaregiversDto } from './dto/search-caregivers.dto';

@Injectable()
export class AvailabilityRepository {
  constructor(
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
  ) {}

  async create(availabilityData: Partial<Availability>): Promise<Availability> {
    const availability = this.availabilityRepository.create(availabilityData);
    return await this.availabilityRepository.save(availability);
  }

  async findById(id: number): Promise<Availability | null> {
    return await this.availabilityRepository.findOne({
      where: { id },
      relations: ['caregiver', 'caregiver.user'],
    });
  }

  async findByCaregiver(
    caregiverId: number,
    query: QueryAvailabilityDto,
  ): Promise<{ availabilities: Availability[]; total: number }> {
    const queryBuilder = this.createQueryBuilder();

    queryBuilder.where('availability.caregiverId = :caregiverId', {
      caregiverId,
    });

    this.applyFilters(queryBuilder, query);

    const total = await queryBuilder.getCount();

    const availabilities = await queryBuilder
      .skip(((query.page || 1) - 1) * (query.limit || 10))
      .take(query.limit || 10)
      .orderBy('availability.createdAt', 'DESC')
      .getMany();

    return { availabilities, total };
  }

  async findWithFilters(
    query: QueryAvailabilityDto,
  ): Promise<{ availabilities: Availability[]; total: number }> {
    const queryBuilder = this.createQueryBuilder();

    this.applyFilters(queryBuilder, query);

    const total = await queryBuilder.getCount();

    const availabilities = await queryBuilder
      .skip(((query.page || 1) - 1) * (query.limit || 10))
      .take(query.limit || 10)
      .orderBy('availability.createdAt', 'DESC')
      .getMany();

    return { availabilities, total };
  }

  async findAvailableCaregivers(searchDto: SearchCaregiversDto): Promise<{
    caregivers: any[];
    total: number;
  }> {
    const searchDate = new Date(searchDto.date);
    const dayOfWeek = searchDate.getDay();

    // Query complexa para encontrar cuidadores disponíveis
    const queryBuilder = this.availabilityRepository
      .createQueryBuilder('availability')
      .leftJoinAndSelect('availability.caregiver', 'caregiver')
      .leftJoinAndSelect('caregiver.user', 'user')
      .where('availability.isActive = :isActive', { isActive: true })
      .andWhere('availability.isAvailable = :isAvailable', {
        isAvailable: true,
      })
      .andWhere(':serviceType = ANY(availability.serviceTypes)', {
        serviceType: searchDto.serviceType,
      })
      .andWhere('availability.startTime <= :startTime', {
        startTime: searchDto.startTime,
      })
      .andWhere('availability.endTime >= :endTime', {
        endTime: searchDto.endTime,
      })
      .andWhere('caregiver.isAvailable = :caregiverAvailable', {
        caregiverAvailable: true,
      })
      .andWhere('caregiver.status = :status', { status: 'approved' });

    // Adicionar condições de data
    queryBuilder.andWhere(
      `(
        (availability.type = :recurringType AND availability.dayOfWeek = :dayOfWeek) OR
        (availability.type = :exceptionType AND availability.specificDate = :specificDate)
      )`,
      {
        recurringType: AvailabilityType.RECURRING,
        dayOfWeek,
        exceptionType: AvailabilityType.EXCEPTION,
        specificDate: searchDate,
      },
    );

    // Verificar se está dentro do período de validade
    queryBuilder.andWhere(
      `(
        availability.effectiveFrom IS NULL OR availability.effectiveFrom <= :searchDate
      ) AND (
        availability.effectiveUntil IS NULL OR availability.effectiveUntil >= :searchDate
      )`,
      { searchDate },
    );

    // Aplicar filtros opcionais
    if (searchDto.maxHourlyRate) {
      queryBuilder.andWhere('caregiver.hourlyRate <= :maxRate', {
        maxRate: searchDto.maxHourlyRate,
      });
    }

    if (searchDto.specialty) {
      queryBuilder.andWhere(':specialty = ANY(caregiver.specialties)', {
        specialty: searchDto.specialty,
      });
    }

    if (searchDto.minRating) {
      queryBuilder.andWhere('caregiver.rating >= :minRating', {
        minRating: searchDto.minRating,
      });
    }

    // Excluir cuidadores que têm bloqueios na data específica
    queryBuilder.andWhere(
      `
      NOT EXISTS (
        SELECT 1 FROM availabilities block 
        WHERE block.caregiverId = caregiver.id 
        AND block.type = :blockType 
        AND block.specificDate = :specificDate 
        AND block.isAvailable = false 
        AND block.isActive = true
        AND block.startTime <= :endTime 
        AND block.endTime >= :startTime
      )
    `,
      {
        blockType: AvailabilityType.BLOCK,
        specificDate: searchDate,
        startTime: searchDto.startTime,
        endTime: searchDto.endTime,
      },
    );

    const total = await queryBuilder.getCount();

    const results = await queryBuilder
      .skip(((searchDto.page || 1) - 1) * (searchDto.limit || 10))
      .take(searchDto.limit || 10)
      .orderBy('caregiver.rating', 'DESC')
      .addOrderBy('caregiver.totalReviews', 'DESC')
      .getMany();

    return { caregivers: results, total };
  }

  async update(
    id: number,
    updateData: Partial<Availability>,
  ): Promise<Availability | null> {
    await this.availabilityRepository.update(id, updateData);
    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.availabilityRepository.delete(id);
  }

  async checkConflicts(
    caregiverId: number,
    type: AvailabilityType,
    dayOfWeek: DayOfWeek | null,
    specificDate: Date | null,
    startTime: string,
    endTime: string,
    excludeId?: number,
  ): Promise<Availability[]> {
    const queryBuilder = this.availabilityRepository
      .createQueryBuilder('availability')
      .where('availability.caregiverId = :caregiverId', { caregiverId })
      .andWhere('availability.isActive = :isActive', { isActive: true })
      .andWhere('availability.type = :type', { type })
      .andWhere(
        '(availability.startTime < :endTime AND availability.endTime > :startTime)',
        { startTime, endTime },
      );

    if (type === AvailabilityType.RECURRING && dayOfWeek !== null) {
      queryBuilder.andWhere('availability.dayOfWeek = :dayOfWeek', {
        dayOfWeek,
      });
    }

    if (
      (type === AvailabilityType.EXCEPTION ||
        type === AvailabilityType.BLOCK) &&
      specificDate
    ) {
      queryBuilder.andWhere('availability.specificDate = :specificDate', {
        specificDate,
      });
    }

    if (excludeId) {
      queryBuilder.andWhere('availability.id != :excludeId', { excludeId });
    }

    return await queryBuilder.getMany();
  }

  private createQueryBuilder(): SelectQueryBuilder<Availability> {
    return this.availabilityRepository
      .createQueryBuilder('availability')
      .leftJoinAndSelect('availability.caregiver', 'caregiver')
      .leftJoinAndSelect('caregiver.user', 'user');
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<Availability>,
    query: QueryAvailabilityDto,
  ): void {
    if (query.type) {
      queryBuilder.andWhere('availability.type = :type', { type: query.type });
    }

    if (query.dayOfWeek !== undefined) {
      queryBuilder.andWhere('availability.dayOfWeek = :dayOfWeek', {
        dayOfWeek: query.dayOfWeek,
      });
    }

    if (query.specificDate) {
      queryBuilder.andWhere('availability.specificDate = :specificDate', {
        specificDate: query.specificDate,
      });
    }

    if (query.serviceType) {
      queryBuilder.andWhere(':serviceType = ANY(availability.serviceTypes)', {
        serviceType: query.serviceType,
      });
    }

    if (query.isAvailable !== undefined) {
      queryBuilder.andWhere('availability.isAvailable = :isAvailable', {
        isAvailable: query.isAvailable,
      });
    }

    if (query.isActive !== undefined) {
      queryBuilder.andWhere('availability.isActive = :isActive', {
        isActive: query.isActive,
      });
    }

    if (query.startTime) {
      queryBuilder.andWhere('availability.startTime >= :startTime', {
        startTime: query.startTime,
      });
    }

    if (query.endTime) {
      queryBuilder.andWhere('availability.endTime <= :endTime', {
        endTime: query.endTime,
      });
    }
  }
}
