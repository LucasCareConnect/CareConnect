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
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { QueryAddressesDto } from './dto/query-addresses.dto';
import { AddressResponseDto } from './dto/address-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/enum/user-role.enum';

@ApiTags('Addresses')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo endereço' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Endereço criado com sucesso',
    type: AddressResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos',
  })
  async create(
    @Request() req: any,
    @Body() createAddressDto: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    return await this.addressService.create(req.user.id, createAddressDto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Listar meus endereços' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de endereços do usuário',
  })
  async findMy(@Request() req: any, @Query() query: QueryAddressesDto) {
    return await this.addressService.findMyAddresses(req.user.id, query);
  }

  @Get('my/primary')
  @ApiOperation({ summary: 'Buscar meu endereço principal' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Endereço principal do usuário',
    type: AddressResponseDto,
  })
  async findMyPrimary(@Request() req: any) {
    return await this.addressService.findPrimaryAddress(req.user.id);
  }

  @Get('my/active')
  @ApiOperation({ summary: 'Listar meus endereços ativos' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de endereços ativos do usuário',
    type: [AddressResponseDto],
  })
  async findMyActive(@Request() req: any) {
    return await this.addressService.findActiveAddresses(req.user.id);
  }

  @Get('search/postal-code/:postalCode')
  @ApiOperation({ summary: 'Buscar endereços por CEP' })
  @ApiParam({ name: 'postalCode', description: 'CEP para busca' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de endereços encontrados',
    type: [AddressResponseDto],
  })
  async findByPostalCode(@Param('postalCode') postalCode: string) {
    return await this.addressService.findByPostalCode(postalCode);
  }

  @Get('search/city/:city')
  @ApiOperation({ summary: 'Buscar endereços por cidade' })
  @ApiParam({ name: 'city', description: 'Cidade para busca' })
  @ApiQuery({
    name: 'state',
    description: 'Estado (opcional)',
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de endereços encontrados',
    type: [AddressResponseDto],
  })
  async findByCity(
    @Param('city') city: string,
    @Query('state') state?: string,
  ) {
    return await this.addressService.findByCity(city, state);
  }

  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar endereços de um usuário (admin)' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de endereços do usuário',
  })
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: QueryAddressesDto,
  ) {
    return await this.addressService.findByUser(userId, query);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todos os endereços (admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de todos os endereços',
  })
  async findAll(@Query() query: QueryAddressesDto) {
    return await this.addressService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar endereço por ID' })
  @ApiParam({ name: 'id', description: 'ID do endereço' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Endereço encontrado',
    type: AddressResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Endereço não encontrado',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AddressResponseDto> {
    return await this.addressService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar endereço' })
  @ApiParam({ name: 'id', description: 'ID do endereço' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Endereço atualizado com sucesso',
    type: AddressResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Endereço não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Sem permissão para atualizar este endereço',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() updateAddressDto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    return await this.addressService.update(
      id,
      req.user.id,
      req.user.userType,
      updateAddressDto,
    );
  }

  @Patch(':id/set-primary')
  @ApiOperation({ summary: 'Definir endereço como principal' })
  @ApiParam({ name: 'id', description: 'ID do endereço' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Endereço definido como principal',
    type: AddressResponseDto,
  })
  async setPrimary(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<AddressResponseDto> {
    return await this.addressService.setPrimary(
      id,
      req.user.id,
      req.user.userType,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover endereço' })
  @ApiParam({ name: 'id', description: 'ID do endereço' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Endereço removido com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Endereço não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Sem permissão para remover este endereço',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Não é possível remover o único endereço ativo',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<void> {
    return await this.addressService.remove(id, req.user.id, req.user.userType);
  }
}
