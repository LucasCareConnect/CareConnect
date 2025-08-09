import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WebSocketGateway } from './websocket.gateway';
import { WebSocketService } from './websocket.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [
    WebSocketGateway,
    WebSocketService,
    {
      provide: 'WebSocketService',
      useExisting: WebSocketService,
    },
  ],
  exports: [WebSocketService, 'WebSocketService'],
})
export class WebSocketModule {}
