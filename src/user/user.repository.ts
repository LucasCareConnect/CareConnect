import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { User } from './entities/user.entity';
import { QueryUsersDto } from './dto/query-users.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { PaginatedUsers } from './interfaces/paginated-users.interface';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findAll(query: QueryUsersDto): Promise<PaginatedUsers> {
    const { search, userType, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: FindManyOptions<User>['where'] = {};
    if (search) {
      where.name = Like(`%${search}%`);
    }
    if (userType) {
      where.userType = userType;
    }

    const [users, count] = await this.userRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const userDtos = users.map((user) => this.toResponseDto(user));

    return {
      data: userDtos,
      count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  async update(id: number, updateData: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, updateData);
    return this.findById(id);
  }

  async updatePassword(id: number, newPassword: string): Promise<void> {
    await this.userRepository.update(id, { password: newPassword });
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  private toResponseDto(user: User): UserResponseDto {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userData } = user;
    return userData;
  }
}
