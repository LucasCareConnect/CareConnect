import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ReviewRepository } from './review.repository';
import { AppointmentService } from '../appointment/appointment.service';
import { CaregiverService } from '../caregiver/caregiver.service';
import { UserService } from '../user/user.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReportReviewDto } from './dto/report-review.dto';
import { QueryReviewsDto } from './dto/query-reviews.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { PaginatedReviews } from './interfaces/paginated-reviews.interface';
import { Review, ReviewStatus } from './entities/review.entity';
import { UserRole } from '../user/enum/user-role.enum';
import { AppointmentStatus } from '../appointment/entities/appointment.entity';

@Injectable()
export class ReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly appointmentService: AppointmentService,
    private readonly caregiverService: CaregiverService,
    private readonly userService: UserService,
  ) {}

  /**
   * Cria uma nova avaliação
   */
  async create(
    familyUserId: number,
    createReviewDto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    // Verificar se o usuário é da família
    const familyUser = await this.userService.findById(familyUserId);
    if (!familyUser || familyUser.userType !== UserRole.FAMILY) {
      throw new ForbiddenException(
        'Apenas usuários do tipo família podem criar avaliações',
      );
    }

    // Verificar se o agendamento existe e pertence ao usuário
    const appointment = await this.appointmentService.findById(
      createReviewDto.appointmentId,
    );

    if (appointment.familyUserId !== familyUserId) {
      throw new ForbiddenException(
        'Você só pode avaliar seus próprios agendamentos',
      );
    }

    // Verificar se o agendamento foi concluído
    if (appointment.status !== AppointmentStatus.COMPLETED) {
      throw new BadRequestException(
        'Só é possível avaliar agendamentos concluídos',
      );
    }

    // Verificar se já existe uma avaliação para este agendamento
    const existingReview = await this.reviewRepository.findByAppointmentId(
      createReviewDto.appointmentId,
    );

    if (existingReview) {
      throw new ConflictException(
        'Já existe uma avaliação para este agendamento',
      );
    }

    const reviewData = {
      familyUserId,
      caregiverId: appointment.caregiverId,
      appointmentId: createReviewDto.appointmentId,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
      isAnonymous: createReviewDto.isAnonymous || false,
      status: ReviewStatus.PUBLISHED,
    };

    const review = await this.reviewRepository.create(reviewData);

    // Atualizar estatísticas do cuidador
    await this.updateCaregiverRating(appointment.caregiverId);

    return this.toResponseDto(review);
  }

  /**
   * Busca avaliação por ID
   */
  async findById(id: number): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new NotFoundException('Avaliação não encontrada');
    }
    return this.toResponseDto(review);
  }

  /**
   * Busca avaliações com filtros e paginação
   */
  async findAll(query: QueryReviewsDto): Promise<PaginatedReviews> {
    const { reviews, total } =
      await this.reviewRepository.findWithFilters(query);

    return {
      data: reviews.map((review) => this.toResponseDto(review)),
      total,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil(total / (query.limit || 10)),
    };
  }

  /**
   * Busca avaliações de um cuidador
   */
  async findByCaregiver(
    caregiverId: number,
    query: QueryReviewsDto,
  ): Promise<PaginatedReviews> {
    const { reviews, total } = await this.reviewRepository.findByCaregiver(
      caregiverId,
      query,
    );

    const stats = await this.reviewRepository.getCaregiverStats(caregiverId);

    return {
      data: reviews.map((review) => this.toResponseDto(review)),
      total,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil(total / (query.limit || 10)),
      averageRating: stats.averageRating,
      ratingDistribution: stats.ratingDistribution,
    };
  }

  /**
   * Busca avaliações de uma família
   */
  async findByFamilyUser(
    familyUserId: number,
    query: QueryReviewsDto,
  ): Promise<PaginatedReviews> {
    const { reviews, total } = await this.reviewRepository.findByFamilyUser(
      familyUserId,
      query,
    );

    return {
      data: reviews.map((review) => this.toResponseDto(review)),
      total,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil(total / (query.limit || 10)),
    };
  }

  /**
   * Atualiza uma avaliação
   */
  async update(
    id: number,
    userId: number,
    userRole: UserRole,
    updateReviewDto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    // Verificar permissões
    if (userRole === UserRole.FAMILY && review.familyUserId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar esta avaliação',
      );
    }

    // Apenas admin pode alterar status e notas administrativas
    if (userRole !== UserRole.ADMIN) {
      delete updateReviewDto.status;
      delete updateReviewDto.adminNotes;
    }

    const updatedReview = await this.reviewRepository.update(
      id,
      updateReviewDto,
    );
    if (!updatedReview) {
      throw new NotFoundException('Erro ao atualizar avaliação');
    }

    // Se a avaliação foi alterada, atualizar estatísticas do cuidador
    if (updateReviewDto.rating && updateReviewDto.rating !== review.rating) {
      await this.updateCaregiverRating(review.caregiverId);
    }

    return this.toResponseDto(updatedReview);
  }

  /**
   * Remove uma avaliação
   */
  async remove(id: number, userId: number, userRole: UserRole): Promise<void> {
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    // Verificar permissões
    if (userRole === UserRole.FAMILY && review.familyUserId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para remover esta avaliação',
      );
    }

    if (userRole !== UserRole.ADMIN && userRole !== UserRole.FAMILY) {
      throw new ForbiddenException(
        'Apenas famílias e administradores podem remover avaliações',
      );
    }

    await this.reviewRepository.delete(id);

    // Atualizar estatísticas do cuidador
    await this.updateCaregiverRating(review.caregiverId);
  }

  /**
   * Reporta uma avaliação
   */
  async report(
    id: number,
    userId: number,
    reportReviewDto: ReportReviewDto,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    if (review.familyUserId === userId) {
      throw new BadRequestException(
        'Você não pode reportar sua própria avaliação',
      );
    }

    const updateData = {
      status: ReviewStatus.REPORTED,
      reportReason: reportReviewDto.reason,
      reportedAt: new Date(),
      reportedBy: userId,
      adminNotes: reportReviewDto.details,
    };

    const updatedReview = await this.reviewRepository.update(id, updateData);
    if (!updatedReview) {
      throw new NotFoundException('Erro ao reportar avaliação');
    }

    return this.toResponseDto(updatedReview);
  }

  /**
   * Marca/desmarca avaliação como útil
   */
  async toggleHelpful(
    id: number,
    userId: number,
    isHelpful: boolean,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    if (review.familyUserId === userId) {
      throw new BadRequestException(
        'Você não pode marcar sua própria avaliação como útil',
      );
    }

    if (isHelpful) {
      await this.reviewRepository.incrementHelpfulCount(id);
    } else {
      await this.reviewRepository.decrementHelpfulCount(id);
    }

    const updatedReview = await this.reviewRepository.findById(id);
    if (!updatedReview) {
      throw new NotFoundException('Erro ao atualizar avaliação');
    }

    return this.toResponseDto(updatedReview);
  }

  /**
   * Obtém estatísticas de um cuidador
   */
  async getCaregiverStats(caregiverId: number): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  }> {
    return await this.reviewRepository.getCaregiverStats(caregiverId);
  }

  /**
   * Métodos auxiliares privados
   */
  private async updateCaregiverRating(caregiverId: number): Promise<void> {
    const stats = await this.reviewRepository.getCaregiverStats(caregiverId);

    // Atualizar as estatísticas do cuidador no CaregiverService
    // Assumindo que existe um método para isso no CaregiverService
    try {
      await this.caregiverService['updateRating'](
        caregiverId,
        stats.averageRating,
      );
      await this.caregiverService['recordReview'](
        caregiverId,
        stats.totalReviews,
      );
    } catch (error) {
      // Log do erro, mas não falha a operação principal
      console.error('Erro ao atualizar estatísticas do cuidador:', error);
    }
  }

  private toResponseDto(review: Review): ReviewResponseDto {
    return {
      id: review.id,
      familyUserId: review.familyUserId,
      familyUser: review.isAnonymous
        ? undefined
        : {
            id: review.familyUser.id,
            name: review.familyUser.name,
            email: review.familyUser.email,
            phone: review.familyUser.phone,
            userType: review.familyUser.userType,
            createdAt: review.familyUser.createdAt,
          },
      caregiverId: review.caregiverId,
      caregiver: {
        id: review.caregiver.id,
        userId: review.caregiver.userId,
        user: {
          id: review.caregiver.user.id,
          name: review.caregiver.user.name,
          email: review.caregiver.user.email,
          phone: review.caregiver.user.phone,
          userType: review.caregiver.user.userType,
          createdAt: review.caregiver.user.createdAt,
        },
        bio: review.caregiver.bio,
        experience: review.caregiver.experience,
        experienceLevel: review.caregiver.experienceLevel,
        hourlyRate: review.caregiver.hourlyRate,
        specialties: review.caregiver.specialties,
        certifications: review.caregiver.certifications,
        languages: review.caregiver.languages,
        isAvailable: review.caregiver.isAvailable,
        status: review.caregiver.status,
        rating: review.caregiver.rating,
        totalReviews: review.caregiver.totalReviews,
        totalAppointments: review.caregiver.totalAppointments,
        profilePicture: review.caregiver.profilePicture,
        backgroundCheck: review.caregiver.backgroundCheck,
        backgroundCheckDate: review.caregiver.backgroundCheckDate,
        lastActive: review.caregiver.lastActive,
        createdAt: review.caregiver.createdAt,
        updatedAt: review.caregiver.updatedAt,
      },
      appointmentId: review.appointmentId,
      appointment: {
        id: review.appointment.id,
        familyUserId: review.appointment.familyUserId,
        familyUser: {
          id: review.appointment.familyUser.id,
          name: review.appointment.familyUser.name,
          email: review.appointment.familyUser.email,
          phone: review.appointment.familyUser.phone,
          userType: review.appointment.familyUser.userType,
          createdAt: review.appointment.familyUser.createdAt,
        },
        caregiverId: review.appointment.caregiverId,
        caregiver: {
          id: review.appointment.caregiver.id,
          userId: review.appointment.caregiver.userId,
          user: {
            id: review.appointment.caregiver.user.id,
            name: review.appointment.caregiver.user.name,
            email: review.appointment.caregiver.user.email,
            phone: review.appointment.caregiver.user.phone,
            userType: review.appointment.caregiver.user.userType,
            createdAt: review.appointment.caregiver.user.createdAt,
          },
          bio: review.appointment.caregiver.bio,
          experience: review.appointment.caregiver.experience,
          experienceLevel: review.appointment.caregiver.experienceLevel,
          hourlyRate: review.appointment.caregiver.hourlyRate,
          specialties: review.appointment.caregiver.specialties,
          certifications: review.appointment.caregiver.certifications,
          languages: review.appointment.caregiver.languages,
          isAvailable: review.appointment.caregiver.isAvailable,
          status: review.appointment.caregiver.status,
          rating: review.appointment.caregiver.rating,
          totalReviews: review.appointment.caregiver.totalReviews,
          totalAppointments: review.appointment.caregiver.totalAppointments,
          profilePicture: review.appointment.caregiver.profilePicture,
          backgroundCheck: review.appointment.caregiver.backgroundCheck,
          backgroundCheckDate: review.appointment.caregiver.backgroundCheckDate,
          lastActive: review.appointment.caregiver.lastActive,
          createdAt: review.appointment.caregiver.createdAt,
          updatedAt: review.appointment.caregiver.updatedAt,
        },
        status: review.appointment.status,
        type: review.appointment.type,
        startDate: review.appointment.startDate,
        endDate: review.appointment.endDate,
        hourlyRate: review.appointment.hourlyRate,
        totalHours: review.appointment.totalHours,
        totalAmount: review.appointment.totalAmount,
        notes: review.appointment.notes,
        specialRequirements: review.appointment.specialRequirements,
        address: review.appointment.address,
        emergencyContact: review.appointment.emergencyContact,
        emergencyPhone: review.appointment.emergencyPhone,
        confirmedAt: review.appointment.confirmedAt,
        startedAt: review.appointment.startedAt,
        completedAt: review.appointment.completedAt,
        cancelledAt: review.appointment.cancelledAt,
        cancellationReason: review.appointment.cancellationReason,
        cancelledBy: review.appointment.cancelledBy,
        createdAt: review.appointment.createdAt,
        updatedAt: review.appointment.updatedAt,
      },
      rating: review.rating,
      comment: review.comment,
      status: review.status,
      isAnonymous: review.isAnonymous,
      helpfulCount: review.helpfulCount,
      reportReason: review.reportReason,
      reportedAt: review.reportedAt,
      reportedBy: review.reportedBy,
      adminNotes: review.adminNotes,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }
}
