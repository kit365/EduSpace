import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { profileService } from '../services/profileService';

export function useProfile() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await profileService.getProfile();
                setProfile(data);
            } catch (error) {
                console.error("Failed to fetch profile", error);
                // Optionally handle error state
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const updateProfile = async (data: Partial<UserProfile>) => {
        if (profile) {
            setProfile((prev) => (prev ? { ...prev, ...data } : prev));
        }
        const updated = await profileService.updateProfile(data);
        setProfile(updated);
    };

    return { profile, loading, updateProfile };
}
