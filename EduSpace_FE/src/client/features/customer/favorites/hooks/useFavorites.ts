import { useState, useEffect } from 'react';
import { Space } from '../../../../../types/space';
import { favoriteService } from '../services/favoriteService';

export function useFavorites() {
    const [favorites, setFavorites] = useState<Space[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            const data = await favoriteService.getFavorites();
            setFavorites(data);
            setLoading(false);
        };
        fetch();
    }, []);

    const removeFavorite = async (id: number) => {
        const success = await favoriteService.toggleFavorite(id);
        if (success) {
            setFavorites(prev => prev.filter(f => f.id !== id));
        }
    };

    return { favorites, loading, removeFavorite };
}
