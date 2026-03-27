/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_API_PREFIX: string;
    /** Base URL FastAPI eduspace-ai (vd http://localhost:8000). Có thì FE gọi trực tiếp OCR/face (cần CORS trên Python). */
    readonly VITE_KYC_AI_BASE_URL?: string;
    /** Khớp KYC_AI_API_KEY trên Python khi gọi trực tiếp */
    readonly VITE_KYC_AI_API_KEY?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
