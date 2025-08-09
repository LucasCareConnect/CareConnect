import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../user/dto/user-response.dto';
import { CaregiverResponseDto } from '../../caregiver/dto/caregiver-response.dto';
import { AppointmentResponseDto } from '../../appointment/dto/appointment-response.dto';
import { ReviewStatus } from '../entities/review.entity';

export class ReviewResponseDto {
  @ApiProperty({ description: 'ID único da avaliação', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID do usuário da família', example: 1 })
  familyUserId: number;

  @ApiProperty({
    description: 'Dados do usuário da família (null se anônimo)',
    type: UserResponseDto,
    nullable: true,
  })
  familyUser?: UserResponseDto;

  @ApiProperty({ description: 'ID do cuidador', example: 1 })
  caregiverId: number;

  @ApiProperty({
    description: 'Dados do cuidador',
    type: CaregiverResponseDto,
  })
  caregiver: CaregiverResponseDto;

  @ApiProperty({ description: 'ID do agendamento', example: 1 })
  appointmentId: number;

  @ApiProperty({
    description: 'Dados do agendamento',
    type: AppointmentResponseDto,
  })
  appointment: AppointmentResponseDto;

  @ApiProperty({
    description: 'Avaliação de 1 a 5 estrelas',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  rating: number;

  @ApiProperty({
    description: 'Comentário sobre o cuidador',
    example: 'Excelente cuidadora! Muito atenciosa e carinhosa.',
  })
  comment: string;

  @ApiProperty({
    description: 'Status da avaliação',
    enum: ReviewStatus,
    example: ReviewStatus.PUBLISHED,
  })
  status: ReviewStatus;

  @ApiProperty({
    description: 'Se a avaliação é anônima',
    example: false,
  })
  isAnonymous: boolean;

  @ApiProperty({
    description: 'Número de pessoas que marcaram como útil',
    example: 5,
  })
  helpfulCount: number;

  @ApiProperty({
    description: 'Motivo da denúncia (se houver)',
    example: 'inappropriate_language',
    required: false,
  })
  reportReason?: string;

  @ApiProperty({
    description: 'Data da denúncia',
    example: '2024-01-15T10:30:00Z',
    required: false,
  })
  reportedAt?: Date;

  @ApiProperty({
    description: 'ID de quem fez a denúncia',
    example: 2,
    required: false,
  })
  reportedBy?: number;

  @ApiProperty({
    description: 'Notas administrativas',
    example: 'Avaliação revisada e aprovada',
    required: false,
  })
  adminNotes?: string;

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
