import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../user/dto/user-response.dto';
import { CaregiverResponseDto } from '../../caregiver/dto/caregiver-response.dto';
import {
  AppointmentStatus,
  AppointmentType,
} from '../entities/appointment.entity';

export class AppointmentResponseDto {
  @ApiProperty({ description: 'ID único do agendamento', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID do usuário da família', example: 1 })
  familyUserId: number;

  @ApiProperty({
    description: 'Dados do usuário da família',
    type: UserResponseDto,
  })
  familyUser: UserResponseDto;

  @ApiProperty({ description: 'ID do cuidador', example: 1 })
  caregiverId: number;

  @ApiProperty({
    description: 'Dados do cuidador',
    type: CaregiverResponseDto,
  })
  caregiver: CaregiverResponseDto;

  @ApiProperty({
    description: 'Status do agendamento',
    enum: AppointmentStatus,
    example: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @ApiProperty({
    description: 'Tipo de agendamento',
    enum: AppointmentType,
    example: AppointmentType.HOURLY,
  })
  type: AppointmentType;

  @ApiProperty({
    description: 'Data e hora de início',
    example: '2024-01-15T08:00:00Z',
  })
  startDate: Date;

  @ApiProperty({
    description: 'Data e hora de término',
    example: '2024-01-15T16:00:00Z',
  })
  endDate: Date;

  @ApiProperty({
    description: 'Valor por hora em reais',
    example: 25.5,
  })
  hourlyRate: number;

  @ApiProperty({
    description: 'Total de horas',
    example: 8.0,
  })
  totalHours: number;

  @ApiProperty({
    description: 'Valor total em reais',
    example: 204.0,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Observações adicionais',
    example: 'Paciente com mobilidade reduzida',
    required: false,
  })
  notes?: string;

  @ApiProperty({
    description: 'Requisitos especiais',
    example: ['medicação', 'fisioterapia'],
    type: [String],
    required: false,
  })
  specialRequirements?: string[];

  @ApiProperty({
    description: 'Endereço onde será realizado o cuidado',
    example: 'Rua das Flores, 123, Jardim Primavera, São Paulo - SP',
    required: false,
  })
  address?: string;

  @ApiProperty({
    description: 'Nome do contato de emergência',
    example: 'Maria Silva',
    required: false,
  })
  emergencyContact?: string;

  @ApiProperty({
    description: 'Telefone do contato de emergência',
    example: '(11) 99999-9999',
    required: false,
  })
  emergencyPhone?: string;

  @ApiProperty({
    description: 'Data de confirmação',
    example: '2024-01-10T10:30:00Z',
    required: false,
  })
  confirmedAt?: Date;

  @ApiProperty({
    description: 'Data de início efetivo',
    example: '2024-01-15T08:00:00Z',
    required: false,
  })
  startedAt?: Date;

  @ApiProperty({
    description: 'Data de conclusão',
    example: '2024-01-15T16:00:00Z',
    required: false,
  })
  completedAt?: Date;

  @ApiProperty({
    description: 'Data de cancelamento',
    example: '2024-01-12T14:30:00Z',
    required: false,
  })
  cancelledAt?: Date;

  @ApiProperty({
    description: 'Motivo do cancelamento',
    example: 'Conflito de agenda',
    required: false,
  })
  cancellationReason?: string;

  @ApiProperty({
    description: 'Quem cancelou o agendamento',
    example: 'family',
    required: false,
  })
  cancelledBy?: 'family' | 'caregiver' | 'admin';

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
