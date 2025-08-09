import { ApiProperty } from '@nestjs/swagger';
import { CaregiverResponseDto } from '../../caregiver/dto/caregiver-response.dto';
import {
  AvailabilityType,
  DayOfWeek,
  ServiceType,
} from '../entities/availability.entity';

export class AvailabilityResponseDto {
  @ApiProperty({ description: 'ID único da disponibilidade', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID do cuidador', example: 1 })
  caregiverId: number;

  @ApiProperty({
    description: 'Dados do cuidador',
    type: CaregiverResponseDto,
    required: false,
  })
  caregiver?: CaregiverResponseDto;

  @ApiProperty({
    description: 'Tipo de disponibilidade',
    enum: AvailabilityType,
    example: AvailabilityType.RECURRING,
  })
  type: AvailabilityType;

  @ApiProperty({
    description: 'Dia da semana (para horários recorrentes)',
    enum: DayOfWeek,
    example: DayOfWeek.MONDAY,
    required: false,
  })
  dayOfWeek?: DayOfWeek;

  @ApiProperty({
    description: 'Data específica (para exceções ou bloqueios)',
    example: '2024-01-15',
    required: false,
  })
  specificDate?: Date;

  @ApiProperty({
    description: 'Horário de início',
    example: '08:00',
  })
  startTime: string;

  @ApiProperty({
    description: 'Horário de término',
    example: '18:00',
  })
  endTime: string;

  @ApiProperty({
    description: 'Tipos de serviço disponíveis',
    enum: ServiceType,
    isArray: true,
    example: [ServiceType.HOURLY, ServiceType.DAILY],
  })
  serviceTypes: ServiceType[];

  @ApiProperty({
    description: 'Se está disponível ou bloqueado',
    example: true,
  })
  isAvailable: boolean;

  @ApiProperty({
    description: 'Observações sobre a disponibilidade',
    example: 'Disponível apenas para cuidados básicos',
    required: false,
  })
  notes?: string;

  @ApiProperty({
    description: 'Data de início da validade',
    example: '2024-01-01',
    required: false,
  })
  effectiveFrom?: Date;

  @ApiProperty({
    description: 'Data de fim da validade',
    example: '2024-12-31',
    required: false,
  })
  effectiveUntil?: Date;

  @ApiProperty({
    description: 'Se a regra está ativa',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;
}
