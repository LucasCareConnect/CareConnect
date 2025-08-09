import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsArray,
  IsUrl,
  MaxLength,
  ValidateNested,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  Gender,
  Relationship,
  MobilityLevel,
  CareLevel,
} from '../entities/family-member.entity';

class MedicationDto {
  @ApiProperty({
    description: 'Nome do medicamento',
    example: 'Losartana',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Dosagem do medicamento',
    example: '50mg',
  })
  @IsNotEmpty()
  @IsString()
  dosage: string;

  @ApiProperty({
    description: 'Frequência de uso',
    example: '1x ao dia',
  })
  @IsNotEmpty()
  @IsString()
  frequency: string;

  @ApiProperty({
    description: 'Instruções especiais',
    example: 'Tomar em jejum',
    required: false,
  })
  @IsOptional()
  @IsString()
  instructions?: string;
}

export class CreateFamilyMemberDto {
  @ApiProperty({
    description: 'Nome completo do membro da família',
    example: 'Maria Silva Santos',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Data de nascimento',
    example: '1950-05-15',
  })
  @IsNotEmpty()
  @IsDateString()
  birthDate: string;

  @ApiProperty({
    description: 'Gênero',
    enum: Gender,
    example: Gender.FEMALE,
  })
  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({
    description: 'Relacionamento com o usuário',
    enum: Relationship,
    example: Relationship.PARENT,
  })
  @IsNotEmpty()
  @IsEnum(Relationship)
  relationship: Relationship;

  @ApiProperty({
    description: 'URL da foto',
    example: 'https://example.com/photo.jpg',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  photo?: string;

  @ApiProperty({
    description: 'Biografia ou descrição da pessoa',
    example: 'Pessoa alegre que gosta de jardinagem e leitura',
    required: false,
  })
  @IsOptional()
  @IsString()
  biography?: string;

  @ApiProperty({
    description: 'Nível de cuidado necessário',
    enum: CareLevel,
    example: CareLevel.MODERATE,
    required: false,
    default: CareLevel.MINIMAL,
  })
  @IsOptional()
  @IsEnum(CareLevel)
  careLevel?: CareLevel = CareLevel.MINIMAL;

  @ApiProperty({
    description: 'Nível de mobilidade',
    enum: MobilityLevel,
    example: MobilityLevel.ASSISTANCE_NEEDED,
    required: false,
    default: MobilityLevel.INDEPENDENT,
  })
  @IsOptional()
  @IsEnum(MobilityLevel)
  mobilityLevel?: MobilityLevel = MobilityLevel.INDEPENDENT;

  @ApiProperty({
    description: 'Lista de condições médicas',
    example: ['Hipertensão', 'Diabetes tipo 2'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medicalConditions?: string[];

  @ApiProperty({
    description: 'Lista de medicamentos',
    required: false,
    type: [MedicationDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicationDto)
  medications?: MedicationDto[];

  @ApiProperty({
    description: 'Lista de alergias',
    example: ['Penicilina', 'Amendoim'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @ApiProperty({
    description: 'Restrições alimentares',
    example: ['Sem glúten', 'Baixo sódio'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietaryRestrictions?: string[];

  @ApiProperty({
    description: 'Nome do contato de emergência',
    example: 'João Silva Santos',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  emergencyContact?: string;

  @ApiProperty({
    description: 'Telefone do contato de emergência',
    example: '(11) 99999-9999',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, {
    message: 'Telefone deve estar no formato (00) 00000-0000',
  })
  emergencyPhone?: string;

  @ApiProperty({
    description: 'Nome do médico',
    example: 'Dr. Carlos Oliveira',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  doctorName?: string;

  @ApiProperty({
    description: 'Telefone do médico',
    example: '(11) 3333-4444',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, {
    message: 'Telefone deve estar no formato (00) 00000-0000',
  })
  doctorPhone?: string;

  @ApiProperty({
    description: 'Informações do plano de saúde',
    example: 'Unimed - Cartão: 123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  insuranceInfo?: string;

  @ApiProperty({
    description: 'Lista de necessidades especiais',
    example: ['Cadeira de rodas', 'Oxigênio'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialNeeds?: string[];

  @ApiProperty({
    description: 'Instruções específicas de cuidado',
    example: 'Verificar pressão arterial 2x ao dia',
    required: false,
  })
  @IsOptional()
  @IsString()
  careInstructions?: string;

  @ApiProperty({
    description: 'Atividades preferidas',
    example: ['Leitura', 'Jardinagem', 'Música clássica'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredActivities?: string[];

  @ApiProperty({
    description: 'Notas comportamentais',
    example: 'Pessoa calma, mas pode ficar agitada à noite',
    required: false,
  })
  @IsOptional()
  @IsString()
  behavioralNotes?: string;

  @ApiProperty({
    description: 'Necessidades de comunicação',
    example: 'Fala baixo, usar tom de voz suave',
    required: false,
  })
  @IsOptional()
  @IsString()
  communicationNeeds?: string;

  @ApiProperty({
    description: 'Observações gerais',
    example: 'Gosta de receber visitas pela manhã',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
