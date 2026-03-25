import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types/api';

export interface EkycVerifyDto {
    status: 'success' | 'failed';
    ocrData?: {
        name: string | null;
        idNumber: string | null;
        dob: string | null;
        address: string | null;
        expiryDate: string | null;
    };
    faceMatchingScore: number;
    message?: string | null;
}

function unwrapData<T>(res: unknown): T {
    if (res && typeof res === 'object' && 'data' in res && (res as { data: unknown }).data !== undefined) {
        return (res as { data: T }).data;
    }
    return res as T;
}

/**
 * POST /api/v1/accounts/me/ekyc/verify — multipart (front, optional back, selfie).
 * Proxied by account-service to internal eduspace-ai (FastAPI); never call Python from the browser.
 */
export async function submitEkycVerification(input: {
    front: File;
    back?: File;
    selfie: File;
}): Promise<EkycVerifyDto> {
    const formData = new FormData();
    formData.append('front', input.front);
    if (input.back) {
        formData.append('back', input.back);
    }
    formData.append('selfie', input.selfie);

    const res = await apiClient.post<unknown, ApiResponse<EkycVerifyDto>>(
        '/api/v1/accounts/me/ekyc/verify',
        formData,
        { timeout: 120000 },
    );
    return unwrapData<EkycVerifyDto>(res);
}
