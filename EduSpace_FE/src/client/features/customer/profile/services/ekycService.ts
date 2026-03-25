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
 * Gọi trực tiếp FastAPI eduspace-ai (cần CORS + X-API-Key). Chỉ dùng dev / lab;
 * production nên gọi qua account-service (bỏ trống VITE_KYC_AI_BASE_URL).
 */
async function submitViaKycAiService(input: {
    front: File;
    back?: File;
    selfie: File;
}): Promise<EkycVerifyDto> {
    const base = KYC_AI_BASE!.replace(/\/$/, '');
    const headers: HeadersInit = {};
    if (KYC_AI_KEY) {
        headers['X-API-Key'] = KYC_AI_KEY;
    }

    const ocrForm = new FormData();
    ocrForm.append('front', input.front);
    if (input.back) {
        ocrForm.append('back', input.back);
    }

    const ocrRes = await fetch(`${base}/internal/v1/ocr/id-card`, {
        method: 'POST',
        headers,
        body: ocrForm,
    });
    if (!ocrRes.ok) {
        const text = await ocrRes.text();
        throw new Error(text || `OCR failed (${ocrRes.status})`);
    }

    const ocrJson = (await ocrRes.json()) as OcrApiResponse;
    const fields = ocrJson.front?.fields ?? {};
    const ocrData: NonNullable<EkycVerifyDto['ocrData']> = {
        name: fields.name ?? null,
        idNumber: fields.id_number ?? null,
        dob: fields.dob ?? null,
        address: fields.address ?? null,
        expiryDate: fields.expiry_date ?? null,
    };

    const faceForm = new FormData();
    faceForm.append('selfie', input.selfie);
    faceForm.append('id_front', input.front);

    const faceRes = await fetch(`${base}/internal/v1/face/verify`, {
        method: 'POST',
        headers,
        body: faceForm,
    });
    if (!faceRes.ok) {
        const text = await faceRes.text();
        throw new Error(text || `Face verify failed (${faceRes.status})`);
    }

    const faceJson = (await faceRes.json()) as FaceApiResponse;
    const verified = Boolean(faceJson.verified);
    const distance = Number(faceJson.distance ?? 1);
    const faceMatchingScore = verified
        ? Math.max(0, Math.min(100, 100 * (1 - Math.min(1, distance))))
        : 0;

    const hasOcrSignal = Boolean(ocrData.idNumber || ocrData.name);
    const status: EkycVerifyDto['status'] = verified && hasOcrSignal ? 'success' : 'failed';

    return {
        status,
        ocrData,
        faceMatchingScore,
        message:
            status === 'success'
                ? null
                : faceJson.error ?? (!verified ? 'Face verification failed' : 'Could not read ID fields'),
    };
}

/**
 * eKYC: nếu có `VITE_KYC_AI_BASE_URL` → gọi trực tiếp Python (multipart + CORS).
 * Ngược lại → POST qua gateway tới account-service (không lộ API key ra browser).
 */
export async function submitEkycVerification(input: {
    front: File;
    back?: File;
    selfie: File;
}): Promise<EkycVerifyDto> {
    if (KYC_AI_BASE) {
        return submitViaKycAiService(input);
    }

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
