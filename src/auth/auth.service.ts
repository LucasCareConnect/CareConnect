import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TokenPayload } from './interfaces/token-payload.interface';
import { JWT_CONFIG } from './constants';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { PasswordResetTokenRepository } from './repositories/password-reset-token.repository';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private passwordResetTokenRepository: PasswordResetTokenRepository,
    private notificationService: NotificationService,
  ) {}

  async validateUser(email: string, pass: string): Promise<UserResponseDto> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result as UserResponseDto;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    return this.generateTokens(user);
  }

  async register(registerDto: RegisterDto) {
    const user = await this.userService.create(registerDto);
    return this.generateTokens(user);
  }

  private generateTokens(user: UserResponseDto) {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      userType: user.userType,
    };

    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: JWT_CONFIG.expiresIn,
      }),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: JWT_CONFIG.refreshExpiresIn,
      }),
    };
  }

  refreshToken(user: AuthenticatedUser) {
    const userForToken = {
      id: user.userId,
      email: user.email,
      userType: user.userType,
    } as UserResponseDto;
    return this.generateTokens(userForToken);
  }

  /**
   * Gera um token seguro para reset de senha
   * Combina timestamp + random bytes para garantir unicidade
   */
  private generateSecureToken(): string {
    const timestamp = Date.now().toString();
    const randomBytes = crypto.randomBytes(32).toString('hex');
    return `${timestamp}-${randomBytes}`;
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const isOldPasswordValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );

    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    await this.userService.updatePassword(
      userId,
      changePasswordDto.newPassword,
    );
    return { message: 'Senha alterada com sucesso' };
  }

  async forgotPassword(email: string) {
    try {
      // Busca o usuário pelo email
      const user = await this.userService.findByEmail(email);

      if (user) {
        // Remove tokens antigos do usuário para evitar acúmulo
        await this.passwordResetTokenRepository.removeUserTokens(user.id);

        // Gera um token seguro
        const token = this.generateSecureToken();

        // Define expiração (15 minutos para mobile é adequado)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);

        // Salva o token no banco
        await this.passwordResetTokenRepository.create({
          token,
          userId: user.id,
          expiresAt,
        });

        // Envia notificação (email/SMS/push)
        await this.notificationService.sendPasswordResetNotification(
          email,
          token,
          user.name,
        );
      }

      // Sempre retorna a mesma mensagem para evitar vazamento de informações
      // (não revela se o email existe ou não)
      return {
        message:
          'Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha',
      };
    } catch (error) {
      return {
        message: `Se o e-mail '${error instanceof Error ? error.message : 'fornecido'}' estiver cadastrado, você receberá instruções para redefinir sua senha`,
      };
    }
  }

  async resetPassword(token: string, newPassword: string) {
    // Busca o token no banco de dados
    const resetToken =
      await this.passwordResetTokenRepository.findByToken(token);

    if (!resetToken) {
      throw new BadRequestException('Token de redefinição inválido');
    }

    // Verifica se o token ainda é válido (não expirou e não foi usado)
    if (!resetToken.isValid()) {
      throw new BadRequestException(
        'Token de redefinição expirado ou já utilizado',
      );
    }

    // Atualiza a senha do usuário
    await this.userService.updatePassword(resetToken.userId, newPassword);

    // Marca o token como usado
    resetToken.markAsUsed();
    await this.passwordResetTokenRepository.save(resetToken);

    // Remove todos os outros tokens do usuário por segurança
    await this.passwordResetTokenRepository.removeUserTokens(resetToken.userId);

    return {
      message: 'Senha redefinida com sucesso',
    };
  }
}
