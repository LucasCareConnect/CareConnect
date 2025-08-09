import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Address } from './entities/address.entity';
import { QueryAddressesDto } from './dto/query-addresses.dto';

@Injectable()
export class AddressRepository {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async create(addressData: Partial<Address>): Promise<Address> {
    const address = this.addressRepository.create(addressData);
    return await this.addressRepository.save(address);
  }

  async findById(id: number): Promise<Address | null> {
    return await this.addressRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findByUser(
    userId: number,
    query: QueryAddressesDto,
  ): Promise<{ addresses: Address[]; total: number }> {
    const queryBuilder = this.createQueryBuilder();

    queryBuilder.where('address.userId = :userId', { userId });

    this.applyFilters(queryBuilder, query);

    const total = await queryBuilder.getCount();

    const addresses = await queryBuilder
      .skip(((query.page || 1) - 1) * (query.limit || 10))
      .take(query.limit || 10)
      .orderBy('address.isPrimary', 'DESC')
      .addOrderBy('address.createdAt', 'DESC')
      .getMany();

    return { addresses, total };
  }

  async findWithFilters(
    query: QueryAddressesDto,
  ): Promise<{ addresses: Address[]; total: number }> {
    const queryBuilder = this.createQueryBuilder();

    this.applyFilters(queryBuilder, query);

    const total = await queryBuilder.getCount();

    const addresses = await queryBuilder
      .skip(((query.page || 1) - 1) * (query.limit || 10))
      .take(query.limit || 10)
      .orderBy('address.createdAt', 'DESC')
      .getMany();

    return { addresses, total };
  }

  async findPrimaryByUser(userId: number): Promise<Address | null> {
    return await this.addressRepository.findOne({
      where: { userId, isPrimary: true, isActive: true },
      relations: ['user'],
    });
  }

  async findActiveByUser(userId: number): Promise<Address[]> {
    return await this.addressRepository.find({
      where: { userId, isActive: true },
      relations: ['user'],
      order: { isPrimary: 'DESC', createdAt: 'DESC' },
    });
  }

  async update(
    id: number,
    updateData: Partial<Address>,
  ): Promise<Address | null> {
    await this.addressRepository.update(id, updateData);
    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.addressRepository.delete(id);
  }

  async setPrimaryAddress(userId: number, addressId: number): Promise<void> {
    // Primeiro, remove o status primary de todos os endereços do usuário
    await this.addressRepository.update({ userId }, { isPrimary: false });

    // Depois, define o endereço especificado como primary
    await this.addressRepository.update(
      { id: addressId, userId },
      { isPrimary: true },
    );
  }

  async countByUser(userId: number): Promise<number> {
    return await this.addressRepository.count({
      where: { userId, isActive: true },
    });
  }

  async findByPostalCode(postalCode: string): Promise<Address[]> {
    return await this.addressRepository.find({
      where: { postalCode, isActive: true },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCity(city: string, state?: string): Promise<Address[]> {
    const where: any = { city, isActive: true };
    if (state) {
      where.state = state;
    }

    return await this.addressRepository.find({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  private createQueryBuilder(): SelectQueryBuilder<Address> {
    return this.addressRepository
      .createQueryBuilder('address')
      .leftJoinAndSelect('address.user', 'user');
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<Address>,
    query: QueryAddressesDto,
  ): void {
    if (query.type) {
      queryBuilder.andWhere('address.type = :type', { type: query.type });
    }

    if (query.city) {
      queryBuilder.andWhere('LOWER(address.city) LIKE LOWER(:city)', {
        city: `%${query.city}%`,
      });
    }

    if (query.state) {
      queryBuilder.andWhere('LOWER(address.state) LIKE LOWER(:state)', {
        state: `%${query.state}%`,
      });
    }

    if (query.postalCode) {
      queryBuilder.andWhere('address.postalCode = :postalCode', {
        postalCode: query.postalCode.replace('-', ''),
      });
    }

    if (query.isPrimary !== undefined) {
      queryBuilder.andWhere('address.isPrimary = :isPrimary', {
        isPrimary: query.isPrimary,
      });
    }

    if (query.isActive !== undefined) {
      queryBuilder.andWhere('address.isActive = :isActive', {
        isActive: query.isActive,
      });
    }

    if (query.search) {
      queryBuilder.andWhere(
        '(LOWER(address.label) LIKE LOWER(:search) OR ' +
          'LOWER(address.streetAddress) LIKE LOWER(:search) OR ' +
          'LOWER(address.neighborhood) LIKE LOWER(:search))',
        { search: `%${query.search}%` },
      );
    }
  }
}
