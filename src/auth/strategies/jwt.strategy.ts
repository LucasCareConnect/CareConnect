import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { UserRole } from '../../user/enum/user-role.enum';
import { JWT_CONFIG } from '../constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_CONFIG.secret || 'fallback-secret',
    });
  }

  validate(payload: TokenPayload): AuthenticatedUser {
    return {
      userId: payload.sub,
      email: payload.email,
      userType: payload.userType as UserRole,
    };
  }
}
