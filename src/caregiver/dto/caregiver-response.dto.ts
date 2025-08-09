import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../user/dto/user-response.dto';
import { ExperienceLevel, CaregiverStatus } from '../entities/caregiver.entity';

export class CaregiverResponseDto {
  @ApiProperty({ description: 'ID único do cuidador', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID do usuário associado', example: 1 })
  userId: number;

  @ApiProperty({
    description: 'Dados do usuário associado',
    type: UserResponseDto,
    required: false,
  })
  user?: UserResponseDto;

  @ApiProperty({
    description: 'Biografia do cuidador',
    example:
      'Cuidadora experiente com 5 anos de experiência em cuidados com idosos.',
    required: false,
  })
  bio?: string;

  @ApiProperty({
    description: 'Anos de experiência',
    example: 5,
  })
  experience: number;

  @ApiProperty({
    description: 'Nível de experiência',
    enum: ExperienceLevel,
    example: ExperienceLevel.EXPERIENCED,
  })
  experienceLevel: ExperienceLevel;

  @ApiProperty({
    description: 'Valor por hora em reais',
    example: 25.5,
    required: false,
  })
  hourlyRate?: number;

  @ApiProperty({
    description: 'Especialidades do cuidador',
    example: ['idosos', 'alzheimer', 'mobilidade reduzida'],
    type: [String],
    required: false,
  })
  specialties?: string[];

  @ApiProperty({
    description: 'Certificações do cuidador',
    example: ['Primeiros Socorros', 'Cuidados com Idosos'],
    type: [String],
    required: false,
  })
  certifications?: string[];

  @ApiProperty({
    description: 'Idiomas falados pelo cuidador',
    example: ['Português', 'Inglês', 'Espanhol'],
    type: [String],
    required: false,
  })
  languages?: string[];

  @ApiProperty({
    description: 'Se o cuidador está disponível para novos trabalhos',
    example: true,
  })
  isAvailable: boolean;

  @ApiProperty({
    description: 'Status do cuidador',
    enum: CaregiverStatus,
    example: CaregiverStatus.APPROVED,
  })
  status: CaregiverStatus;

  @ApiProperty({
    description: 'Avaliação média (0-5)',
    example: 4.5,
  })
  rating: number;

  @ApiProperty({
    description: 'Total de avaliações recebidas',
    example: 25,
  })
  totalReviews: number;

  @ApiProperty({
    description: 'Total de agendamentos realizados',
    example: 150,
  })
  totalAppointments: number;

  @ApiProperty({
    description: 'URL da foto de perfil',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  profilePicture?: string;

  @ApiProperty({
    description: 'Se o cuidador passou por verificação de antecedentes',
    example: true,
  })
  backgroundCheck: boolean;

  @ApiProperty({
    description: 'Data da verificação de antecedentes',
    example: '2024-01-15T10:30:00Z',
    required: false,
  })
  backgroundCheckDate?: Date;

  @ApiProperty({
    description: 'Data da última atividade',
    example: '2024-01-15T10:30:00Z',
    required: false,
  })
  lastActive?: Date;

  @ApiProperty({
    description: 'Data de criação do perfil',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;
}
