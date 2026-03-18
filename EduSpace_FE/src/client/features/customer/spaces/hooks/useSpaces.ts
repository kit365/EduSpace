import { useState, useEffect } from 'react';
import { SpaceDetails, Space } from '../../../../../types/space';
import { spaceService } from '../services/spaceService';

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
    const [data, setData] = useState<Space[]>([]);
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
