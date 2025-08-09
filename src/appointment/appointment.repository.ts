import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { QueryAppointmentsDto } from './dto/query-appointments.dto';

@Injectable()
export class AppointmentRepository {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async create(appointmentData: Partial<Appointment>): Promise<Appointment> {
    const appointment = this.appointmentRepository.create(appointmentData);
    return await this.appointmentRepository.save(appointment);
  }

  async findById(id: number): Promise<Appointment | null> {
    return await this.appointmentRepository.findOne({
      where: { id },
      relations: ['familyUser', 'caregiver', 'caregiver.user'],
    });
  }

  async findByIdAndFamilyUser(
    id: number,
    familyUserId: number,
  ): Promise<Appointment | null> {
    return await this.appointmentRepository.findOne({
      where: { id, familyUserId },
      relations: ['familyUser', 'caregiver', 'caregiver.user'],
    });
  }

  async findByIdAndCaregiver(
    id: number,
    caregiverId: number,
  ): Promise<Appointment | null> {
    return await this.appointmentRepository.findOne({
      where: { id, caregiverId },
      relations: ['familyUser', 'caregiver', 'caregiver.user'],
    });
  }

  async findWithFilters(
    query: QueryAppointmentsDto,
  ): Promise<{ appointments: Appointment[]; total: number }> {
    const queryBuilder = this.createQueryBuilder();

    this.applyFilters(queryBuilder, query);

    const total = await queryBuilder.getCount();

    const appointments = await queryBuilder
      .skip(((query.page || 1) - 1) * (query.limit || 10))
      .take(query.limit || 10)
      .orderBy('appointment.createdAt', 'DESC')
      .getMany();

    return { appointments, total };
  }

  async findByFamilyUser(
    familyUserId: number,
    query: QueryAppointmentsDto,
  ): Promise<{ appointments: Appointment[]; total: number }> {
    const queryBuilder = this.createQueryBuilder();

    queryBuilder.where('appointment.familyUserId = :familyUserId', {
      familyUserId,
    });

    this.applyFilters(queryBuilder, query);

    const total = await queryBuilder.getCount();

    const appointments = await queryBuilder
      .skip(((query.page || 1) - 1) * (query.limit || 10))
      .take(query.limit || 10)
      .orderBy('appointment.createdAt', 'DESC')
      .getMany();

    return { appointments, total };
  }

  async findByCaregiver(
    caregiverId: number,
    query: QueryAppointmentsDto,
  ): Promise<{ appointments: Appointment[]; total: number }> {
    const queryBuilder = this.createQueryBuilder();

    queryBuilder.where('appointment.caregiverId = :caregiverId', {
      caregiverId,
    });

    this.applyFilters(queryBuilder, query);

    const total = await queryBuilder.getCount();

    const appointments = await queryBuilder
      .skip(((query.page || 1) - 1) * (query.limit || 10))
      .take(query.limit || 10)
      .orderBy('appointment.createdAt', 'DESC')
      .getMany();

    return { appointments, total };
  }

  async update(
    id: number,
    updateData: Partial<Appointment>,
  ): Promise<Appointment | null> {
    await this.appointmentRepository.update(id, updateData);
    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.appointmentRepository.delete(id);
  }

  async checkConflicts(
    caregiverId: number,
    startDate: Date,
    endDate: Date,
    excludeId?: number,
  ): Promise<Appointment[]> {
    const queryBuilder = this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.caregiverId = :caregiverId', { caregiverId })
      .andWhere('appointment.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: [
          AppointmentStatus.CANCELLED,
          AppointmentStatus.CANCELLED_BY_FAMILY,
          AppointmentStatus.CANCELLED_BY_CAREGIVER,
        ],
      })
      .andWhere(
        '(appointment.startDate < :endDate AND appointment.endDate > :startDate)',
        { startDate, endDate },
      );

    if (excludeId) {
      queryBuilder.andWhere('appointment.id != :excludeId', { excludeId });
    }

    return await queryBuilder.getMany();
  }

  private createQueryBuilder(): SelectQueryBuilder<Appointment> {
    return this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.familyUser', 'familyUser')
      .leftJoinAndSelect('appointment.caregiver', 'caregiver')
      .leftJoinAndSelect('caregiver.user', 'caregiverUser');
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<Appointment>,
    query: QueryAppointmentsDto,
  ): void {
    if (query.status) {
      queryBuilder.andWhere('appointment.status = :status', {
        status: query.status,
      });
    }

    if (query.type) {
      queryBuilder.andWhere('appointment.type = :type', { type: query.type });
    }

    if (query.caregiverId) {
      queryBuilder.andWhere('appointment.caregiverId = :caregiverId', {
        caregiverId: query.caregiverId,
      });
    }

    if (query.familyUserId) {
      queryBuilder.andWhere('appointment.familyUserId = :familyUserId', {
        familyUserId: query.familyUserId,
      });
    }

    if (query.startDate) {
      queryBuilder.andWhere('appointment.startDate >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      queryBuilder.andWhere('appointment.endDate <= :endDate', {
        endDate: query.endDate,
      });
    }
  }
}
