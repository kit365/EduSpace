export interface Review {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  spaceId: number;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}
