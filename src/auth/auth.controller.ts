import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalStrategy)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: AuthenticatedRequest): AuthenticatedUser {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin')
  getAdminProfile(): { message: string } {
    return { message: 'Acesso permitido para usuários autenticados' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.userId, changePasswordDto);
  }

  @ApiOperation({
    summary: 'Solicitar redefinição de senha',
    description: 'Envia instruções para redefinição de senha por email/SMS',
  })
  @ApiResponse({
    status: 200,
    description: 'Instruções enviadas com sucesso',
    schema: {
      example: {
        message:
          'Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha',
      },
    },
  })
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @ApiOperation({
    summary: 'Redefinir senha',
    description: 'Redefine a senha usando o token recebido',
  })
  @ApiResponse({
    status: 200,
    description: 'Senha redefinida com sucesso',
    schema: {
      example: {
        message: 'Senha redefinida com sucesso',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido ou expirado',
  })
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  refreshToken(@Req() req: AuthenticatedRequest) {
    return this.authService.refreshToken(req.user);
  }
}
