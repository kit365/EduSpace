import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { profileService } from '../services/profileService';

export function useProfile() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            const data = await profileService.getProfile();
            setProfile(data);
            setLoading(false);
        };
        fetch();
    }, []);

    const updateProfile = async (data: Partial<UserProfile>) => {
        const updated = await profileService.updateProfile(data);
        setProfile(updated);
    };

    return { profile, loading, updateProfile };
}
