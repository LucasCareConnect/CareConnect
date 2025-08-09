import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, IsNull } from 'typeorm';
import { PasswordResetToken } from '../entities/password-reset-token.entity';

@Injectable()
export class PasswordResetTokenRepository {
  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly tokenRepository: Repository<PasswordResetToken>,
  ) {}

  /**
   * Cria um novo token de reset de senha
   */
  async create(
    tokenData: Partial<PasswordResetToken>,
  ): Promise<PasswordResetToken> {
    const token = this.tokenRepository.create(tokenData);
    return this.tokenRepository.save(token);
  }

  /**
   * Busca um token válido pelo valor do token
   */
  async findValidToken(token: string): Promise<PasswordResetToken | null> {
    const now = new Date();
    return this.tokenRepository.findOne({
      where: {
        token,
        expiresAt: MoreThan(now), // Token ainda não expirou
        usedAt: IsNull(), // Token ainda não foi usado
      },
      relations: ['user'],
    });
  }

  /**
   * Busca um token pelo valor (independente de validade)
   */
  async findByToken(token: string): Promise<PasswordResetToken | null> {
    return this.tokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });
  }

  /**
   * Remove todos os tokens expirados ou usados de um usuário
   */
  async removeUserTokens(userId: number): Promise<void> {
    await this.tokenRepository.delete({ userId });
  }

  /**
   * Remove tokens expirados do sistema (limpeza automática)
   */
  async removeExpiredTokens(): Promise<void> {
    const now = new Date();
    await this.tokenRepository.delete({
      expiresAt: LessThan(now),
    });
  }

  /**
   * Salva alterações em um token
   */
  async save(token: PasswordResetToken): Promise<PasswordResetToken> {
    return this.tokenRepository.save(token);
  }

  /**
   * Conta quantos tokens válidos um usuário possui
   */
  async countValidTokensForUser(userId: number): Promise<number> {
    const now = new Date();
    return this.tokenRepository.count({
      where: {
        userId,
        expiresAt: MoreThan(now),
        usedAt: IsNull(),
      },
    });
  }
}
