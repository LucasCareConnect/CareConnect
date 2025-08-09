import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Caregiver } from './entities/caregiver.entity';
import { CaregiverService } from './caregiver.service';
import { CaregiverController } from './caregiver.controller';
import { CaregiverRepository } from './caregiver.repository';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Caregiver]), UserModule],
  controllers: [CaregiverController],
  providers: [CaregiverService, CaregiverRepository],
  exports: [CaregiverService],
})
export class CaregiverModule {}
