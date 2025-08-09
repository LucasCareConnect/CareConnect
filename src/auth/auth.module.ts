import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { UserModule } from '../user/user.module';
import { JWT_CONFIG } from './constants';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { PasswordResetTokenRepository } from './repositories/password-reset-token.repository';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    UserModule,
    NotificationModule,
    PassportModule,
    TypeOrmModule.forFeature([PasswordResetToken]),
    JwtModule.register({
      secret: JWT_CONFIG.secret,
      signOptions: { expiresIn: JWT_CONFIG.expiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    PasswordResetTokenRepository,
  ],
  exports: [AuthService],
})
export class AuthModule {}
