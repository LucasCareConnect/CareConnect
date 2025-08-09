import { ReviewResponseDto } from '../dto/review-response.dto';

export interface PaginatedReviews {
  data: ReviewResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  averageRating?: number;
  ratingDistribution?: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
