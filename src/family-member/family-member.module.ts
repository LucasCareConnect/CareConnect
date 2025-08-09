import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyMember } from './entities/family-member.entity';
import { FamilyMemberController } from './family-member.controller';
import { FamilyMemberService } from './family-member.service';
import { FamilyMemberRepository } from './family-member.repository';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([FamilyMember]), UserModule],
  controllers: [FamilyMemberController],
  providers: [FamilyMemberService, FamilyMemberRepository],
  exports: [FamilyMemberService],
})
export class FamilyMemberModule {}
