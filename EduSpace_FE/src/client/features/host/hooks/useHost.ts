import { useState, useEffect } from 'react';
import { hostService } from '../services/hostService';

export function useHostStats() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            const data = await hostService.getHostStats();
            setStats(data);
            setLoading(false);
        };
        fetch();
    }, []);

    return { stats, loading };
}
