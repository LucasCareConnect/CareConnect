import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { FamilyMember } from './entities/family-member.entity';
import { QueryFamilyMembersDto } from './dto/query-family-members.dto';

@Injectable()
export class FamilyMemberRepository {
  constructor(
    @InjectRepository(FamilyMember)
    private readonly familyMemberRepository: Repository<FamilyMember>,
  ) {}

  async create(familyMemberData: Partial<FamilyMember>): Promise<FamilyMember> {
    const familyMember = this.familyMemberRepository.create(familyMemberData);
    return await this.familyMemberRepository.save(familyMember);
  }

  async findById(id: number): Promise<FamilyMember | null> {
    return await this.familyMemberRepository.findOne({
      where: { id },
      relations: ['familyUser'],
    });
  }

  async findByFamily(
    familyUserId: number,
    query: QueryFamilyMembersDto,
  ): Promise<{ familyMembers: FamilyMember[]; total: number }> {
    const queryBuilder = this.createQueryBuilder();

    queryBuilder.where('familyMember.familyUserId = :familyUserId', {
      familyUserId,
    });

    this.applyFilters(queryBuilder, query);

    const total = await queryBuilder.getCount();

    const familyMembers = await queryBuilder
      .skip(((query.page || 1) - 1) * (query.limit || 10))
      .take(query.limit || 10)
      .orderBy('familyMember.createdAt', 'DESC')
      .getMany();

    return { familyMembers, total };
  }

  async findWithFilters(
    query: QueryFamilyMembersDto,
  ): Promise<{ familyMembers: FamilyMember[]; total: number }> {
    const queryBuilder = this.createQueryBuilder();

    this.applyFilters(queryBuilder, query);

    const total = await queryBuilder.getCount();

    const familyMembers = await queryBuilder
      .skip(((query.page || 1) - 1) * (query.limit || 10))
      .take(query.limit || 10)
      .orderBy('familyMember.createdAt', 'DESC')
      .getMany();

    return { familyMembers, total };
  }

  async findActiveByFamily(familyUserId: number): Promise<FamilyMember[]> {
    return await this.familyMemberRepository.find({
      where: { familyUserId, isActive: true },
      relations: ['familyUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: number,
    updateData: Partial<FamilyMember>,
  ): Promise<FamilyMember | null> {
    await this.familyMemberRepository.update(id, updateData);
    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.familyMemberRepository.delete(id);
  }

  async countByFamily(familyUserId: number): Promise<number> {
    return await this.familyMemberRepository.count({
      where: { familyUserId, isActive: true },
    });
  }

  async findByMedicalCondition(condition: string): Promise<FamilyMember[]> {
    return await this.familyMemberRepository
      .createQueryBuilder('familyMember')
      .leftJoinAndSelect('familyMember.familyUser', 'familyUser')
      .where('JSON_CONTAINS(familyMember.medicalConditions, :condition)', {
        condition: JSON.stringify(condition),
      })
      .andWhere('familyMember.isActive = :isActive', { isActive: true })
      .orderBy('familyMember.createdAt', 'DESC')
      .getMany();
  }

  async findByAllergy(allergy: string): Promise<FamilyMember[]> {
    return await this.familyMemberRepository
      .createQueryBuilder('familyMember')
      .leftJoinAndSelect('familyMember.familyUser', 'familyUser')
      .where('JSON_CONTAINS(familyMember.allergies, :allergy)', {
        allergy: JSON.stringify(allergy),
      })
      .andWhere('familyMember.isActive = :isActive', { isActive: true })
      .orderBy('familyMember.createdAt', 'DESC')
      .getMany();
  }

  async findByCareLevel(careLevel: string): Promise<FamilyMember[]> {
    return await this.familyMemberRepository.find({
      where: { careLevel: careLevel as any, isActive: true },
      relations: ['familyUser'],
      order: { createdAt: 'DESC' },
    });
  }

  private createQueryBuilder(): SelectQueryBuilder<FamilyMember> {
    return this.familyMemberRepository
      .createQueryBuilder('familyMember')
      .leftJoinAndSelect('familyMember.familyUser', 'familyUser');
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<FamilyMember>,
    query: QueryFamilyMembersDto,
  ): void {
    if (query.gender) {
      queryBuilder.andWhere('familyMember.gender = :gender', {
        gender: query.gender,
      });
    }

    if (query.relationship) {
      queryBuilder.andWhere('familyMember.relationship = :relationship', {
        relationship: query.relationship,
      });
    }

    if (query.careLevel) {
      queryBuilder.andWhere('familyMember.careLevel = :careLevel', {
        careLevel: query.careLevel,
      });
    }

    if (query.mobilityLevel) {
      queryBuilder.andWhere('familyMember.mobilityLevel = :mobilityLevel', {
        mobilityLevel: query.mobilityLevel,
      });
    }

    if (query.isActive !== undefined) {
      queryBuilder.andWhere('familyMember.isActive = :isActive', {
        isActive: query.isActive,
      });
    }

    if (query.search) {
      queryBuilder.andWhere('LOWER(familyMember.name) LIKE LOWER(:search)', {
        search: `%${query.search}%`,
      });
    }

    if (query.medicalCondition) {
      queryBuilder.andWhere(
        'JSON_CONTAINS(familyMember.medicalConditions, :condition)',
        {
          condition: JSON.stringify(query.medicalCondition),
        },
      );
    }

    if (query.allergy) {
      queryBuilder.andWhere('JSON_CONTAINS(familyMember.allergies, :allergy)', {
        allergy: JSON.stringify(query.allergy),
      });
    }

    // Filtros de idade (calculados com base na data de nascimento)
    if (query.minAge !== undefined) {
      const maxBirthDate = new Date();
      maxBirthDate.setFullYear(maxBirthDate.getFullYear() - query.minAge);
      queryBuilder.andWhere('familyMember.birthDate <= :maxBirthDate', {
        maxBirthDate: maxBirthDate.toISOString().split('T')[0],
      });
    }

    if (query.maxAge !== undefined) {
      const minBirthDate = new Date();
      minBirthDate.setFullYear(minBirthDate.getFullYear() - query.maxAge - 1);
      queryBuilder.andWhere('familyMember.birthDate > :minBirthDate', {
        minBirthDate: minBirthDate.toISOString().split('T')[0],
      });
    }
  }
}
