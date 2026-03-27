import { useState, useEffect, useCallback } from 'react';
import { Space } from '../../../../../types/space';
import { favoriteService, subscribeFavoriteChanges } from '../services/favoriteService';

export function useFavorites() {
    const [favorites, setFavorites] = useState<Space[]>(() => favoriteService.getAllSync());
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(() => {
        setFavorites(favoriteService.getAllSync());
    }, []);

    useEffect(() => {
        const load = async () => {
            const data = await favoriteService.getFavorites();
            setFavorites(data);
            setLoading(false);
        };
        load();
    }, []);

    useEffect(() => subscribeFavoriteChanges(refresh), [refresh]);

    const removeFavorite = async (id: number) => {
        const success = await favoriteService.removeFavorite(id);
        if (success) {
            refresh();
        }
    };

    return { favorites, loading, removeFavorite, refresh };
}
