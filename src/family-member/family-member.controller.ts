import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FamilyMemberService } from './family-member.service';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
import { UpdateFamilyMemberDto } from './dto/update-family-member.dto';
import { QueryFamilyMembersDto } from './dto/query-family-members.dto';
import { FamilyMemberResponseDto } from './dto/family-member-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/enum/user-role.enum';

@ApiTags('family-members')
@Controller('family-members')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class FamilyMemberController {
  constructor(private readonly familyMemberService: FamilyMemberService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.FAMILY)
  @ApiOperation({ summary: 'Criar novo membro da família' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Membro da família criado com sucesso',
    type: FamilyMemberResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos',
  })
  async create(
    @Request() req: any,
    @Body() createFamilyMemberDto: CreateFamilyMemberDto,
  ): Promise<FamilyMemberResponseDto> {
    return await this.familyMemberService.create(
      req.user.id,
      createFamilyMemberDto,
    );
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(UserRole.FAMILY)
  @ApiOperation({ summary: 'Listar meus membros da família' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de membros da família do usuário',
  })
  async findMy(@Request() req: any, @Query() query: QueryFamilyMembersDto) {
    return await this.familyMemberService.findMyFamilyMembers(
      req.user.id,
      query,
    );
  }

  @Get('my/active')
  @UseGuards(RolesGuard)
  @Roles(UserRole.FAMILY)
  @ApiOperation({ summary: 'Listar meus membros da família ativos' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de membros da família ativos',
    type: [FamilyMemberResponseDto],
  })
  async findMyActive(@Request() req: any) {
    return await this.familyMemberService.findActiveFamilyMembers(req.user.id);
  }

  @Get('my/count')
  @UseGuards(RolesGuard)
  @Roles(UserRole.FAMILY)
  @ApiOperation({ summary: 'Contar meus membros da família' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Número de membros da família',
  })
  async countMy(@Request() req: any) {
    const count = await this.familyMemberService.countByFamily(req.user.id);
    return { count };
  }

  @Get('search/medical-condition/:condition')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CAREGIVER)
  @ApiOperation({ summary: 'Buscar membros por condição médica' })
  @ApiParam({ name: 'condition', description: 'Condição médica para busca' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de membros com a condição médica',
    type: [FamilyMemberResponseDto],
  })
  async findByMedicalCondition(@Param('condition') condition: string) {
    return await this.familyMemberService.findByMedicalCondition(condition);
  }

  @Get('search/allergy/:allergy')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CAREGIVER)
  @ApiOperation({ summary: 'Buscar membros por alergia' })
  @ApiParam({ name: 'allergy', description: 'Alergia para busca' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de membros com a alergia',
    type: [FamilyMemberResponseDto],
  })
  async findByAllergy(@Param('allergy') allergy: string) {
    return await this.familyMemberService.findByAllergy(allergy);
  }

  @Get('family/:familyUserId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar membros de uma família (admin)' })
  @ApiParam({ name: 'familyUserId', description: 'ID do usuário da família' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de membros da família',
  })
  async findByFamily(
    @Param('familyUserId', ParseIntPipe) familyUserId: number,
    @Query() query: QueryFamilyMembersDto,
  ) {
    return await this.familyMemberService.findByFamily(familyUserId, query);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todos os membros de família (admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de todos os membros de família',
  })
  async findAll(@Query() query: QueryFamilyMembersDto) {
    return await this.familyMemberService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar membro da família por ID' })
  @ApiParam({ name: 'id', description: 'ID do membro da família' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Membro da família encontrado',
    type: FamilyMemberResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Membro da família não encontrado',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FamilyMemberResponseDto> {
    return await this.familyMemberService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar membro da família' })
  @ApiParam({ name: 'id', description: 'ID do membro da família' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Membro da família atualizado com sucesso',
    type: FamilyMemberResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Membro da família não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Sem permissão para atualizar este membro da família',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() updateFamilyMemberDto: UpdateFamilyMemberDto,
  ): Promise<FamilyMemberResponseDto> {
    return await this.familyMemberService.update(
      id,
      req.user.id,
      req.user.userType,
      updateFamilyMemberDto,
    );
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Desativar membro da família' })
  @ApiParam({ name: 'id', description: 'ID do membro da família' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Membro da família desativado com sucesso',
    type: FamilyMemberResponseDto,
  })
  async deactivate(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<FamilyMemberResponseDto> {
    return await this.familyMemberService.deactivate(
      id,
      req.user.id,
      req.user.userType,
    );
  }

  @Patch(':id/reactivate')
  @ApiOperation({ summary: 'Reativar membro da família' })
  @ApiParam({ name: 'id', description: 'ID do membro da família' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Membro da família reativado com sucesso',
    type: FamilyMemberResponseDto,
  })
  async reactivate(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<FamilyMemberResponseDto> {
    return await this.familyMemberService.reactivate(
      id,
      req.user.id,
      req.user.userType,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover membro da família' })
  @ApiParam({ name: 'id', description: 'ID do membro da família' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Membro da família removido com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Membro da família não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Sem permissão para remover este membro da família',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<void> {
    return await this.familyMemberService.remove(
      id,
      req.user.id,
      req.user.userType,
    );
  }
}
