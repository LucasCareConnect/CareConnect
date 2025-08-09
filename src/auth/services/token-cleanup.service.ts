import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PasswordResetTokenRepository } from '../repositories/password-reset-token.repository';

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
  ) {}

  /**
   * Executa limpeza automática de tokens expirados
   * Roda a cada hora para manter o banco limpo
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredTokens(): Promise<void> {
    try {
      this.logger.log('Iniciando limpeza de tokens expirados...');

      await this.passwordResetTokenRepository.removeExpiredTokens();

      this.logger.log('Limpeza de tokens expirados concluída com sucesso');
    } catch (error) {
      this.logger.error(
        `Erro na limpeza de tokens expirados: ${error.message}`,
      );
    }
  }

  /**
   * Limpeza manual de tokens expirados
   */
  async manualCleanup(): Promise<{ message: string }> {
    try {
      await this.passwordResetTokenRepository.removeExpiredTokens();
      return { message: 'Limpeza manual executada com sucesso' };
    } catch (error) {
      this.logger.error(`Erro na limpeza manual: ${error.message}`);
      throw error;
    }
  }
}
