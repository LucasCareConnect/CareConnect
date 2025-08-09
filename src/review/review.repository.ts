import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Review, ReviewStatus } from './entities/review.entity';
import { QueryReviewsDto } from './dto/query-reviews.dto';

@Injectable()
export class ReviewRepository {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async create(reviewData: Partial<Review>): Promise<Review> {
    const review = this.reviewRepository.create(reviewData);
    return await this.reviewRepository.save(review);
  }

  async findById(id: number): Promise<Review | null> {
    return await this.reviewRepository.findOne({
      where: { id },
      relations: ['familyUser', 'caregiver', 'caregiver.user', 'appointment'],
    });
  }

  async findByAppointmentId(appointmentId: number): Promise<Review | null> {
    return await this.reviewRepository.findOne({
      where: { appointmentId },
      relations: ['familyUser', 'caregiver', 'caregiver.user', 'appointment'],
    });
  }

  async findWithFilters(
    query: QueryReviewsDto,
  ): Promise<{ reviews: Review[]; total: number }> {
    const queryBuilder = this.createQueryBuilder();

    this.applyFilters(queryBuilder, query);

    const total = await queryBuilder.getCount();

    const reviews = await queryBuilder
      .skip(((query.page || 1) - 1) * (query.limit || 10))
      .take(query.limit || 10)
      .orderBy(
        `review.${query.sortBy || 'createdAt'}`,
        query.sortOrder || 'DESC',
      )
      .getMany();

    return { reviews, total };
  }

  async findByCaregiver(
    caregiverId: number,
    query: QueryReviewsDto,
  ): Promise<{ reviews: Review[]; total: number }> {
    const queryBuilder = this.createQueryBuilder();

    queryBuilder.where('review.caregiverId = :caregiverId', { caregiverId });
    queryBuilder.andWhere('review.status = :status', {
      status: ReviewStatus.PUBLISHED,
    });

    this.applyFilters(queryBuilder, query);

    const total = await queryBuilder.getCount();

    const reviews = await queryBuilder
      .skip(((query.page || 1) - 1) * (query.limit || 10))
      .take(query.limit || 10)
      .orderBy(
        `review.${query.sortBy || 'createdAt'}`,
        query.sortOrder || 'DESC',
      )
      .getMany();

    return { reviews, total };
  }

  async findByFamilyUser(
    familyUserId: number,
    query: QueryReviewsDto,
  ): Promise<{ reviews: Review[]; total: number }> {
    const queryBuilder = this.createQueryBuilder();

    queryBuilder.where('review.familyUserId = :familyUserId', { familyUserId });

    this.applyFilters(queryBuilder, query);

    const total = await queryBuilder.getCount();

    const reviews = await queryBuilder
      .skip(((query.page || 1) - 1) * (query.limit || 10))
      .take(query.limit || 10)
      .orderBy(
        `review.${query.sortBy || 'createdAt'}`,
        query.sortOrder || 'DESC',
      )
      .getMany();

    return { reviews, total };
  }

  async update(
    id: number,
    updateData: Partial<Review>,
  ): Promise<Review | null> {
    await this.reviewRepository.update(id, updateData);
    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.reviewRepository.delete(id);
  }

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
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'averageRating')
      .addSelect('COUNT(review.id)', 'totalReviews')
      .addSelect(
        'SUM(CASE WHEN review.rating = 1 THEN 1 ELSE 0 END)',
        'rating1',
      )
      .addSelect(
        'SUM(CASE WHEN review.rating = 2 THEN 1 ELSE 0 END)',
        'rating2',
      )
      .addSelect(
        'SUM(CASE WHEN review.rating = 3 THEN 1 ELSE 0 END)',
        'rating3',
      )
      .addSelect(
        'SUM(CASE WHEN review.rating = 4 THEN 1 ELSE 0 END)',
        'rating4',
      )
      .addSelect(
        'SUM(CASE WHEN review.rating = 5 THEN 1 ELSE 0 END)',
        'rating5',
      )
      .where('review.caregiverId = :caregiverId', { caregiverId })
      .andWhere('review.status = :status', { status: ReviewStatus.PUBLISHED })
      .getRawOne();

    return {
      averageRating: parseFloat(result.averageRating) || 0,
      totalReviews: parseInt(result.totalReviews) || 0,
      ratingDistribution: {
        1: parseInt(result.rating1) || 0,
        2: parseInt(result.rating2) || 0,
        3: parseInt(result.rating3) || 0,
        4: parseInt(result.rating4) || 0,
        5: parseInt(result.rating5) || 0,
      },
    };
  }

  async incrementHelpfulCount(id: number): Promise<void> {
    await this.reviewRepository.increment({ id }, 'helpfulCount', 1);
  }

  async decrementHelpfulCount(id: number): Promise<void> {
    await this.reviewRepository.decrement({ id }, 'helpfulCount', 1);
  }

  private createQueryBuilder(): SelectQueryBuilder<Review> {
    return this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.familyUser', 'familyUser')
      .leftJoinAndSelect('review.caregiver', 'caregiver')
      .leftJoinAndSelect('caregiver.user', 'caregiverUser')
      .leftJoinAndSelect('review.appointment', 'appointment');
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<Review>,
    query: QueryReviewsDto,
  ): void {
    if (query.status) {
      queryBuilder.andWhere('review.status = :status', {
        status: query.status,
      });
    }

    if (query.caregiverId) {
      queryBuilder.andWhere('review.caregiverId = :caregiverId', {
        caregiverId: query.caregiverId,
      });
    }

    if (query.familyUserId) {
      queryBuilder.andWhere('review.familyUserId = :familyUserId', {
        familyUserId: query.familyUserId,
      });
    }

    if (query.minRating) {
      queryBuilder.andWhere('review.rating >= :minRating', {
        minRating: query.minRating,
      });
    }

    if (query.maxRating) {
      queryBuilder.andWhere('review.rating <= :maxRating', {
        maxRating: query.maxRating,
      });
    }

    if (query.isAnonymous !== undefined) {
      queryBuilder.andWhere('review.isAnonymous = :isAnonymous', {
        isAnonymous: query.isAnonymous,
      });
    }
  }
}
