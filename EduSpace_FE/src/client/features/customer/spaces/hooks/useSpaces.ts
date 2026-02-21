import { useState, useEffect } from 'react';
import { SpaceDetails, Space } from '../../../../../types/space';
import { spaceService } from '../services/spaceService';

export function useSpaceDetails(id: number) {
    const [data, setData] = useState<SpaceDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const details = await spaceService.getSpaceDetails(id);
                setData(details);
            } catch (err: any) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

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
