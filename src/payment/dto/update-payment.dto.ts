import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { CreatePaymentDto } from './create-payment.dto';
import { PaymentStatus } from '../entities/payment.entity';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  @ApiProperty({
    description: 'Status do pagamento',
    enum: PaymentStatus,
    example: PaymentStatus.COMPLETED,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiProperty({
    description: 'ID externo do gateway',
    example: 'pay_123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  externalId?: string;

  @ApiProperty({
    description: 'Motivo da falha',
    example: 'Cartão recusado',
    required: false,
  })
  @IsOptional()
  @IsString()
  failureReason?: string;

  @ApiProperty({
    description: 'Data de processamento',
    example: '2024-01-15T14:30:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  processedAt?: string;
}
