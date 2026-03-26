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

const KYC_AI_BASE = import.meta.env.VITE_KYC_AI_BASE_URL?.trim();
const KYC_AI_KEY = import.meta.env.VITE_KYC_AI_API_KEY?.trim() ?? '';

type OcrFrontPayload = {
    fields?: {
        name?: string | null;
        id_number?: string | null;
        dob?: string | null;
        address?: string | null;
        expiry_date?: string | null;
    };
};

type OcrApiResponse = {
    front?: OcrFrontPayload;
    back?: unknown;
};

type FaceApiResponse = {
    verified?: boolean;
    distance?: number;
    threshold?: number;
    error?: string;
};

/**
 * eKYC: Luôn gọi qua account-service (Spring Boot) để đảm bảo bảo mật và lưu vết.
 * Spring Boot sẽ chịu trách nhiệm gọi qua Python AI service.
 */
export async function submitEkycVerification(input: {
    fullName: string;
    dob: string;
    phone: string;
    address: string;
    front: File;
    back?: File;
    selfie: File;
}): Promise<EkycVerifyDto> {
    const formData = new FormData();
    formData.append('fullName', input.fullName);
    formData.append('dob', input.dob);
    formData.append('phone', input.phone);
    formData.append('address', input.address);
    formData.append('front', input.front);
    if (input.back) {
        formData.append('back', input.back);
    }
    formData.append('selfie', input.selfie);

    const res = await apiClient.post<unknown, ApiResponse<EkycVerifyDto>>(
        '/api/v1/accounts/me/ekyc/verify',
        formData,
        { 
            timeout: 120000,
            headers: { 'Content-Type': 'multipart/form-data' }
        },
    );
    return unwrapData<EkycVerifyDto>(res);
}
