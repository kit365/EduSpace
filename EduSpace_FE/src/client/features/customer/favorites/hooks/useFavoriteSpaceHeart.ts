import { useState, useEffect, useCallback } from 'react';
import { Space } from '../../../../../types/space';
import { favoriteService, subscribeFavoriteChanges } from '../services/favoriteService';

/** Tim trên thẻ tìm kiếm: đồng bộ trạng thái với localStorage + trang Yêu thích. */
export function useFavoriteSpaceHeart(space: Space) {
    const [, setTick] = useState(0);
    useEffect(() => subscribeFavoriteChanges(() => setTick((n) => n + 1)), []);

    const isFavorite = favoriteService.isFavorite(space.id);

    const toggle = useCallback(
        async (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            await favoriteService.toggleFavoriteSpace(space);
        },
        [space],
    );

    return { isFavorite, toggle };
}
