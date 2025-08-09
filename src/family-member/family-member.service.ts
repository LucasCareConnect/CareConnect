import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { FamilyMemberRepository } from './family-member.repository';
import { UserService } from '../user/user.service';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
import { UpdateFamilyMemberDto } from './dto/update-family-member.dto';
import { QueryFamilyMembersDto } from './dto/query-family-members.dto';
import { FamilyMemberResponseDto } from './dto/family-member-response.dto';
import { PaginatedFamilyMembers } from './interfaces/paginated-family-members.interface';
import { FamilyMember } from './entities/family-member.entity';
import { UserRole } from '../user/enum/user-role.enum';

@Injectable()
export class FamilyMemberService {
  constructor(
    private readonly familyMemberRepository: FamilyMemberRepository,
    private readonly userService: UserService,
  ) {}

  /**
   * Cria um novo membro da família
   */
  async create(
    familyUserId: number,
    createFamilyMemberDto: CreateFamilyMemberDto,
  ): Promise<FamilyMemberResponseDto> {
    // Verificar se o usuário existe
    const user = await this.userService.findById(familyUserId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Validar data de nascimento
    const birthDate = new Date(createFamilyMemberDto.birthDate);
    const today = new Date();
    if (birthDate > today) {
      throw new BadRequestException(
        'Data de nascimento não pode ser no futuro',
      );
    }

    // Calcular idade para validações
    const age = this.calculateAge(birthDate);
    if (age > 150) {
      throw new BadRequestException('Idade não pode ser superior a 150 anos');
    }

    const familyMemberData = {
      familyUserId,
      name: createFamilyMemberDto.name,
      birthDate,
      gender: createFamilyMemberDto.gender,
      relationship: createFamilyMemberDto.relationship,
      photo: createFamilyMemberDto.photo,
      biography: createFamilyMemberDto.biography,
      careLevel: createFamilyMemberDto.careLevel,
      mobilityLevel: createFamilyMemberDto.mobilityLevel,
      medicalConditions: createFamilyMemberDto.medicalConditions,
      medications: createFamilyMemberDto.medications,
      allergies: createFamilyMemberDto.allergies,
      dietaryRestrictions: createFamilyMemberDto.dietaryRestrictions,
      emergencyContact: createFamilyMemberDto.emergencyContact,
      emergencyPhone: createFamilyMemberDto.emergencyPhone,
      doctorName: createFamilyMemberDto.doctorName,
      doctorPhone: createFamilyMemberDto.doctorPhone,
      insuranceInfo: createFamilyMemberDto.insuranceInfo,
      specialNeeds: createFamilyMemberDto.specialNeeds,
      careInstructions: createFamilyMemberDto.careInstructions,
      preferredActivities: createFamilyMemberDto.preferredActivities,
      behavioralNotes: createFamilyMemberDto.behavioralNotes,
      communicationNeeds: createFamilyMemberDto.communicationNeeds,
      notes: createFamilyMemberDto.notes,
      isActive: true,
    };

    const familyMember =
      await this.familyMemberRepository.create(familyMemberData);
    return this.toResponseDto(familyMember);
  }

  /**
   * Busca membro da família por ID
   */
  async findById(id: number): Promise<FamilyMemberResponseDto> {
    const familyMember = await this.familyMemberRepository.findById(id);
    if (!familyMember) {
      throw new NotFoundException('Membro da família não encontrado');
    }
    return this.toResponseDto(familyMember);
  }

  /**
   * Busca membros da família de um usuário
   */
  async findByFamily(
    familyUserId: number,
    query: QueryFamilyMembersDto,
  ): Promise<PaginatedFamilyMembers> {
    const { familyMembers, total } =
      await this.familyMemberRepository.findByFamily(familyUserId, query);

    return {
      data: familyMembers.map((member) => this.toResponseDto(member)),
      total,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil(total / (query.limit || 10)),
    };
  }

  /**
   * Busca membros da família do usuário logado
   */
  async findMyFamilyMembers(
    userId: number,
    query: QueryFamilyMembersDto,
  ): Promise<PaginatedFamilyMembers> {
    return await this.findByFamily(userId, query);
  }

  /**
   * Busca todos os membros de família (admin)
   */
  async findAll(query: QueryFamilyMembersDto): Promise<PaginatedFamilyMembers> {
    const { familyMembers, total } =
      await this.familyMemberRepository.findWithFilters(query);

    return {
      data: familyMembers.map((member) => this.toResponseDto(member)),
      total,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil(total / (query.limit || 10)),
    };
  }

  /**
   * Busca membros ativos da família
   */
  async findActiveFamilyMembers(
    familyUserId: number,
  ): Promise<FamilyMemberResponseDto[]> {
    const familyMembers =
      await this.familyMemberRepository.findActiveByFamily(familyUserId);
    return familyMembers.map((member) => this.toResponseDto(member));
  }

  /**
   * Busca membros por condição médica
   */
  async findByMedicalCondition(
    condition: string,
  ): Promise<FamilyMemberResponseDto[]> {
    const familyMembers =
      await this.familyMemberRepository.findByMedicalCondition(condition);
    return familyMembers.map((member) => this.toResponseDto(member));
  }

  /**
   * Busca membros por alergia
   */
  async findByAllergy(allergy: string): Promise<FamilyMemberResponseDto[]> {
    const familyMembers =
      await this.familyMemberRepository.findByAllergy(allergy);
    return familyMembers.map((member) => this.toResponseDto(member));
  }

  /**
   * Atualiza um membro da família
   */
  async update(
    id: number,
    userId: number,
    userRole: UserRole,
    updateFamilyMemberDto: UpdateFamilyMemberDto,
  ): Promise<FamilyMemberResponseDto> {
    const familyMember = await this.familyMemberRepository.findById(id);
    if (!familyMember) {
      throw new NotFoundException('Membro da família não encontrado');
    }

    // Verificar permissões
    if (userRole !== UserRole.ADMIN && familyMember.familyUserId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar este membro da família',
      );
    }

    // Validar data de nascimento se fornecida
    if (updateFamilyMemberDto.birthDate) {
      const birthDate = new Date(updateFamilyMemberDto.birthDate);
      const today = new Date();
      if (birthDate > today) {
        throw new BadRequestException(
          'Data de nascimento não pode ser no futuro',
        );
      }

      const age = this.calculateAge(birthDate);
      if (age > 150) {
        throw new BadRequestException('Idade não pode ser superior a 150 anos');
      }
    }

    const updateData: Partial<FamilyMember> = {
      ...updateFamilyMemberDto,
      birthDate: updateFamilyMemberDto.birthDate
        ? new Date(updateFamilyMemberDto.birthDate)
        : undefined,
    };

    const updatedFamilyMember = await this.familyMemberRepository.update(
      id,
      updateData,
    );
    if (!updatedFamilyMember) {
      throw new NotFoundException('Erro ao atualizar membro da família');
    }

    return this.toResponseDto(updatedFamilyMember);
  }

  /**
   * Remove um membro da família
   */
  async remove(id: number, userId: number, userRole: UserRole): Promise<void> {
    const familyMember = await this.familyMemberRepository.findById(id);
    if (!familyMember) {
      throw new NotFoundException('Membro da família não encontrado');
    }

    // Verificar permissões
    if (userRole !== UserRole.ADMIN && familyMember.familyUserId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para remover este membro da família',
      );
    }

    await this.familyMemberRepository.delete(id);
  }

  /**
   * Desativa um membro da família (soft delete)
   */
  async deactivate(
    id: number,
    userId: number,
    userRole: UserRole,
  ): Promise<FamilyMemberResponseDto> {
    const familyMember = await this.familyMemberRepository.findById(id);
    if (!familyMember) {
      throw new NotFoundException('Membro da família não encontrado');
    }

    // Verificar permissões
    if (userRole !== UserRole.ADMIN && familyMember.familyUserId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para desativar este membro da família',
      );
    }

    const updatedFamilyMember = await this.familyMemberRepository.update(id, {
      isActive: false,
    });
    if (!updatedFamilyMember) {
      throw new NotFoundException('Erro ao desativar membro da família');
    }

    return this.toResponseDto(updatedFamilyMember);
  }

  /**
   * Reativa um membro da família
   */
  async reactivate(
    id: number,
    userId: number,
    userRole: UserRole,
  ): Promise<FamilyMemberResponseDto> {
    const familyMember = await this.familyMemberRepository.findById(id);
    if (!familyMember) {
      throw new NotFoundException('Membro da família não encontrado');
    }

    // Verificar permissões
    if (userRole !== UserRole.ADMIN && familyMember.familyUserId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para reativar este membro da família',
      );
    }

    const updatedFamilyMember = await this.familyMemberRepository.update(id, {
      isActive: true,
    });
    if (!updatedFamilyMember) {
      throw new NotFoundException('Erro ao reativar membro da família');
    }

    return this.toResponseDto(updatedFamilyMember);
  }

  /**
   * Conta membros da família
   */
  async countByFamily(familyUserId: number): Promise<number> {
    return await this.familyMemberRepository.countByFamily(familyUserId);
  }

  /**
   * Métodos auxiliares privados
   */
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  private toResponseDto(familyMember: FamilyMember): FamilyMemberResponseDto {
    return {
      id: familyMember.id,
      familyUserId: familyMember.familyUserId,
      familyUser: {
        id: familyMember.familyUser.id,
        name: familyMember.familyUser.name,
        email: familyMember.familyUser.email,
        phone: familyMember.familyUser.phone,
        userType: familyMember.familyUser.userType,
        createdAt: familyMember.familyUser.createdAt,
      },
      name: familyMember.name,
      birthDate: familyMember.birthDate,
      age: this.calculateAge(familyMember.birthDate),
      gender: familyMember.gender,
      relationship: familyMember.relationship,
      photo: familyMember.photo,
      biography: familyMember.biography,
      careLevel: familyMember.careLevel,
      mobilityLevel: familyMember.mobilityLevel,
      medicalConditions: familyMember.medicalConditions,
      medications: familyMember.medications,
      allergies: familyMember.allergies,
      dietaryRestrictions: familyMember.dietaryRestrictions,
      emergencyContact: familyMember.emergencyContact,
      emergencyPhone: familyMember.emergencyPhone,
      doctorName: familyMember.doctorName,
      doctorPhone: familyMember.doctorPhone,
      insuranceInfo: familyMember.insuranceInfo,
      specialNeeds: familyMember.specialNeeds,
      careInstructions: familyMember.careInstructions,
      preferredActivities: familyMember.preferredActivities,
      behavioralNotes: familyMember.behavioralNotes,
      communicationNeeds: familyMember.communicationNeeds,
      isActive: familyMember.isActive,
      notes: familyMember.notes,
      createdAt: familyMember.createdAt,
      updatedAt: familyMember.updatedAt,
    };
  }
}
