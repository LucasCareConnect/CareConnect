import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../user/dto/user-response.dto';
import {
  Gender,
  Relationship,
  MobilityLevel,
  CareLevel,
} from '../entities/family-member.entity';

class MedicationResponseDto {
  @ApiProperty({ description: 'Nome do medicamento', example: 'Losartana' })
  name: string;

  @ApiProperty({ description: 'Dosagem', example: '50mg' })
  dosage: string;

  @ApiProperty({ description: 'Frequência', example: '1x ao dia' })
  frequency: string;

  @ApiProperty({
    description: 'Instruções especiais',
    example: 'Tomar em jejum',
    required: false,
  })
  instructions?: string;
}

export class FamilyMemberResponseDto {
  @ApiProperty({ description: 'ID único do membro da família', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID do usuário da família', example: 1 })
  familyUserId: number;

  @ApiProperty({
    description: 'Dados do usuário da família',
    type: UserResponseDto,
  })
  familyUser: UserResponseDto;

  @ApiProperty({
    description: 'Nome completo',
    example: 'Maria Silva Santos',
  })
  name: string;

  @ApiProperty({
    description: 'Data de nascimento',
    example: '1950-05-15',
  })
  birthDate: Date;

  @ApiProperty({
    description: 'Idade calculada',
    example: 73,
  })
  age: number;

  @ApiProperty({
    description: 'Gênero',
    enum: Gender,
    example: Gender.FEMALE,
  })
  gender: Gender;

  @ApiProperty({
    description: 'Relacionamento',
    enum: Relationship,
    example: Relationship.PARENT,
  })
  relationship: Relationship;

  @ApiProperty({
    description: 'URL da foto',
    example: 'https://example.com/photo.jpg',
    required: false,
  })
  photo?: string;

  @ApiProperty({
    description: 'Biografia',
    example: 'Pessoa alegre que gosta de jardinagem',
    required: false,
  })
  biography?: string;

  @ApiProperty({
    description: 'Nível de cuidado',
    enum: CareLevel,
    example: CareLevel.MODERATE,
  })
  careLevel: CareLevel;

  @ApiProperty({
    description: 'Nível de mobilidade',
    enum: MobilityLevel,
    example: MobilityLevel.ASSISTANCE_NEEDED,
  })
  mobilityLevel: MobilityLevel;

  @ApiProperty({
    description: 'Condições médicas',
    example: ['Hipertensão', 'Diabetes tipo 2'],
    required: false,
    type: [String],
  })
  medicalConditions?: string[];

  @ApiProperty({
    description: 'Lista de medicamentos',
    required: false,
    type: [MedicationResponseDto],
  })
  medications?: MedicationResponseDto[];

  @ApiProperty({
    description: 'Alergias',
    example: ['Penicilina', 'Amendoim'],
    required: false,
    type: [String],
  })
  allergies?: string[];

  @ApiProperty({
    description: 'Restrições alimentares',
    example: ['Sem glúten', 'Baixo sódio'],
    required: false,
    type: [String],
  })
  dietaryRestrictions?: string[];

  @ApiProperty({
    description: 'Contato de emergência',
    example: 'João Silva Santos',
    required: false,
  })
  emergencyContact?: string;

  @ApiProperty({
    description: 'Telefone de emergência',
    example: '(11) 99999-9999',
    required: false,
  })
  emergencyPhone?: string;

  @ApiProperty({
    description: 'Nome do médico',
    example: 'Dr. Carlos Oliveira',
    required: false,
  })
  doctorName?: string;

  @ApiProperty({
    description: 'Telefone do médico',
    example: '(11) 3333-4444',
    required: false,
  })
  doctorPhone?: string;

  @ApiProperty({
    description: 'Informações do plano de saúde',
    example: 'Unimed - Cartão: 123456789',
    required: false,
  })
  insuranceInfo?: string;

  @ApiProperty({
    description: 'Necessidades especiais',
    example: ['Cadeira de rodas', 'Oxigênio'],
    required: false,
    type: [String],
  })
  specialNeeds?: string[];

  @ApiProperty({
    description: 'Instruções de cuidado',
    example: 'Verificar pressão arterial 2x ao dia',
    required: false,
  })
  careInstructions?: string;

  @ApiProperty({
    description: 'Atividades preferidas',
    example: ['Leitura', 'Jardinagem', 'Música clássica'],
    required: false,
    type: [String],
  })
  preferredActivities?: string[];

  @ApiProperty({
    description: 'Notas comportamentais',
    example: 'Pessoa calma, mas pode ficar agitada à noite',
    required: false,
  })
  behavioralNotes?: string;

  @ApiProperty({
    description: 'Necessidades de comunicação',
    example: 'Fala baixo, usar tom de voz suave',
    required: false,
  })
  communicationNeeds?: string;

  @ApiProperty({
    description: 'Se está ativo',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Observações gerais',
    example: 'Gosta de receber visitas pela manhã',
    required: false,
  })
  notes?: string;

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
