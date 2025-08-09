import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { AddressRepository } from './address.repository';
import { UserService } from '../user/user.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { QueryAddressesDto } from './dto/query-addresses.dto';
import { AddressResponseDto } from './dto/address-response.dto';
import { PaginatedAddresses } from './interfaces/paginated-addresses.interface';
import { Address } from './entities/address.entity';
import { UserRole } from '../user/enum/user-role.enum';

@Injectable()
export class AddressService {
  constructor(
    private readonly addressRepository: AddressRepository,
    private readonly userService: UserService,
  ) {}

  async create(
    userId: number,
    createAddressDto: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Se for o primeiro endereço, definir como principal
    const result = await this.addressRepository.findByUser(userId, {});
    const existingAddresses = result.addresses;
    const isPrimary =
      existingAddresses.length === 0 || createAddressDto.isPrimary;

    // Se definindo como principal, remover flag de outros endereços
    if (isPrimary) {
      await this.addressRepository.setPrimaryAddress(userId, 0); // Primeiro remove todos
    }

    const address = await this.addressRepository.create({
      ...createAddressDto,
      userId,
      isPrimary,
    });

    return this.toAddressResponseDto(address);
  }

  async findMyAddresses(
    userId: number,
    query?: QueryAddressesDto,
  ): Promise<PaginatedAddresses> {
    const result = await this.addressRepository.findByUser(userId, query || {});
    return {
      data: result.addresses,
      total: result.total,
      page: query?.page || 1,
      limit: query?.limit || 10,
      totalPages: Math.ceil(result.total / (query?.limit || 10)),
    };
  }

  async findPrimaryAddress(userId: number): Promise<AddressResponseDto | null> {
    const address = await this.addressRepository.findPrimaryByUser(userId);
    return address ? this.toAddressResponseDto(address) : null;
  }

  async findActiveAddresses(userId: number): Promise<AddressResponseDto[]> {
    const addresses = await this.addressRepository.findActiveByUser(userId);
    return addresses.map((address) => this.toAddressResponseDto(address));
  }

  async findByPostalCode(postalCode: string): Promise<AddressResponseDto[]> {
    const addresses = await this.addressRepository.findByPostalCode(postalCode);
    return addresses.map((address) => this.toAddressResponseDto(address));
  }

  async findByCity(
    city: string,
    state?: string,
  ): Promise<AddressResponseDto[]> {
    const addresses = await this.addressRepository.findByCity(city, state);
    return addresses.map((address) => this.toAddressResponseDto(address));
  }

  async findByUser(
    userId: number,
    query?: QueryAddressesDto,
  ): Promise<PaginatedAddresses> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    const result = await this.addressRepository.findByUser(userId, query || {});
    return {
      data: result.addresses,
      total: result.total,
      page: query?.page || 1,
      limit: query?.limit || 10,
      totalPages: Math.ceil(result.total / (query?.limit || 10)),
    };
  }

  async findAll(query?: QueryAddressesDto): Promise<PaginatedAddresses> {
    const result = await this.addressRepository.findWithFilters(query || {});
    return {
      data: result.addresses,
      total: result.total,
      page: query?.page || 1,
      limit: query?.limit || 10,
      totalPages: Math.ceil(result.total / (query?.limit || 10)),
    };
  }

  async findById(id: number): Promise<AddressResponseDto> {
    const address = await this.addressRepository.findById(id);
    if (!address) {
      throw new NotFoundException('Endereço não encontrado');
    }
    return this.toAddressResponseDto(address);
  }

  async update(
    id: number,
    userId: number,
    userType: string,
    updateAddressDto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    const address = await this.addressRepository.findById(id);
    if (!address) {
      throw new NotFoundException('Endereço não encontrado');
    }

    // Verificar permissões
    if (userType !== UserRole.ADMIN && address.userId !== userId) {
      throw new ForbiddenException(
        'Sem permissão para atualizar este endereço',
      );
    }

    // Se definindo como principal, remover flag de outros endereços
    if (updateAddressDto.isPrimary) {
      await this.addressRepository.setPrimaryAddress(address.userId, id);
      const updatedAddress = await this.addressRepository.findById(id);
      if (!updatedAddress) {
        throw new NotFoundException('Endereço não encontrado após atualização');
      }
      return this.toAddressResponseDto(updatedAddress);
    }

    const updatedAddress = await this.addressRepository.update(
      id,
      updateAddressDto,
    );
    if (!updatedAddress) {
      throw new NotFoundException('Endereço não encontrado após atualização');
    }
    return this.toAddressResponseDto(updatedAddress);
  }

  async setPrimary(
    id: number,
    userId: number,
    userType: string,
  ): Promise<AddressResponseDto> {
    const address = await this.addressRepository.findById(id);
    if (!address) {
      throw new NotFoundException('Endereço não encontrado');
    }

    // Verificar permissões
    if (userType !== UserRole.ADMIN && address.userId !== userId) {
      throw new ForbiddenException(
        'Sem permissão para modificar este endereço',
      );
    }

    // Definir como principal (o método já remove dos outros)
    await this.addressRepository.setPrimaryAddress(address.userId, id);
    const updatedAddress = await this.addressRepository.findById(id);
    if (!updatedAddress) {
      throw new NotFoundException('Endereço não encontrado após atualização');
    }
    return this.toAddressResponseDto(updatedAddress);
  }

  async remove(id: number, userId: number, userType: string): Promise<void> {
    const address = await this.addressRepository.findById(id);
    if (!address) {
      throw new NotFoundException('Endereço não encontrado');
    }

    // Verificar permissões
    if (userType !== UserRole.ADMIN && address.userId !== userId) {
      throw new ForbiddenException('Sem permissão para remover este endereço');
    }

    // Verificar se não é o único endereço ativo
    const activeAddresses = await this.addressRepository.findActiveByUser(
      address.userId,
    );
    if (activeAddresses.length === 1 && activeAddresses[0].id === id) {
      throw new BadRequestException(
        'Não é possível remover o único endereço ativo',
      );
    }

    await this.addressRepository.delete(id);

    // Se era o endereço principal, definir outro como principal
    if (address.isPrimary) {
      const remainingAddresses = await this.addressRepository.findActiveByUser(
        address.userId,
      );
      if (remainingAddresses.length > 0) {
        await this.addressRepository.setPrimaryAddress(
          address.userId,
          remainingAddresses[0].id,
        );
      }
    }
  }

  // Métodos auxiliares
  async validateAddressOwnership(
    addressId: number,
    userId: number,
  ): Promise<boolean> {
    const address = await this.addressRepository.findById(addressId);
    return address?.userId === userId;
  }

  async updateCoordinates(
    id: number,
    latitude: number,
    longitude: number,
  ): Promise<void> {
    await this.addressRepository.update(id, { latitude, longitude });
  }

  // DTO conversion
  private toAddressResponseDto(address: Address): AddressResponseDto {
    return {
      id: address.id,
      userId: address.userId,
      type: address.type,
      label: address.label,
      streetAddress: address.streetAddress,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      complement: address.complement,
      latitude: address.latitude,
      longitude: address.longitude,
      isPrimary: address.isPrimary,
      isActive: address.isActive,
      notes: address.notes,
      emergencyContact: address.emergencyContact,
      emergencyPhone: address.emergencyPhone,
      accessInstructions: address.accessInstructions,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
      user: address.user
        ? {
            id: address.user.id,
            name: address.user.name,
            email: address.user.email,
            phone: address.user.phone,
            userType: address.user.userType,
            createdAt: address.user.createdAt,
          }
        : undefined,
    };
  }
}
