import { useTranslation } from 'react-i18next';
import { SpaceReview } from '../../../../../types/space';

interface SpaceReviewsProps {
  rating: number;
  reviews: SpaceReview[];
}

export function SpaceReviews({ rating, reviews }: SpaceReviewsProps) {
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {t('customer.spaceDetail.reviews')} <span className="text-red-500">★ {rating}</span>
        </h2>
        <button className="text-red-500 hover:text-red-600">
          {t('customer.spaceDetail.seeAllReviews', { count: reviews.length })}
        </button>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
            <div className="flex items-start gap-4">
              <img
                src={review.avatar}
                alt={review.author}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold">{review.author}</div>
                    <div className="text-sm text-gray-600">{review.date}</div>
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
