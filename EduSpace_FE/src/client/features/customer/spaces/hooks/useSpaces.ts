import { useState, useEffect } from 'react';
import type { RoomCategoryDto } from '@/client/features/room';
import { SpaceDetails, Space } from '../../../../../types/space';
import { spaceService } from '../services/spaceService';
import { PageResponse } from '@/client/features/room';

export function useSpaceDetails(spaceRef: string) {
    const [data, setData] = useState<SpaceDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                setError(null);
                const details = await spaceService.getSpaceDetails(spaceRef);
                setData(details);
            } catch (err: unknown) {
                setError(err instanceof Error ? err : new Error('Failed'));
            } finally {
                setLoading(false);
            }
        };
        if (spaceRef) fetch();
    }, [spaceRef]);

    return { data, loading, error };
}

export function useSearchSpaces(query: any) {
    const [data, setData] = useState<PageResponse<Space> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const results = await spaceService.searchSpaces(query);
            setData(results);
            setLoading(false);
        };
        fetch();
    }, [JSON.stringify(query)]);

    return { data, loading };
}

export function useTopRatedSpaces() {
    const [data, setData] = useState<Space[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const results = await spaceService.getTopRatedSpaces();
            setData(results);
            setLoading(false);
        };
        fetch();
    }, []);

    return { data, loading };
}

export function useRoomCategories() {
    const [data, setData] = useState<RoomCategoryDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const results = await spaceService.getCategories();
                setData(results);
            } catch (err) {
                console.error('Failed to fetch categories', err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    return { data, loading };
}

export function useFeaturedCategories() {
    const [data, setData] = useState<RoomCategoryDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const results = await spaceService.getFeaturedCategories();
                setData(results);
            } catch (err) {
                console.error('Failed to fetch featured categories', err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    return { data, loading };
}

export function useAdminCategories() {
    const [data, setData] = useState<RoomCategoryDto[]>([]);
    const [loading, setLoading] = useState(true);

    const fetch = async () => {
        try {
            setLoading(true);
            const results = await spaceService.getAllCategoriesAdmin();
            setData(results);
        } catch (err) {
            console.error('Failed to fetch admin categories', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch();
    }, []);

    return { data, loading, refresh: fetch };
}

export function useUpdateCategory() {
    const [loading, setLoading] = useState(false);

    const update = async (id: number, body: Partial<RoomCategoryDto>) => {
        try {
            setLoading(true);
            return await spaceService.updateCategory(id, body);
        } catch (err) {
            console.error('Failed to update category', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { update, loading };
}
