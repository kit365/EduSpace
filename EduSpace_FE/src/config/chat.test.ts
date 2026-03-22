import { describe, expect, it } from 'vitest';
import { getKeycloakSubFromAccessToken } from './chat';

/** Base64url UTF-8 JSON segment (same shape as Keycloak JWT payload). */
function b64urlJson(obj: Record<string, unknown>): string {
    const s = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(s);
    let bin = '';
    bytes.forEach((b) => {
        bin += String.fromCharCode(b);
    });
    return btoa(bin)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

describe('getKeycloakSubFromAccessToken', () => {
    it('reads sub from JWT (including non-ASCII claims)', () => {
        const sub = '550e8400-e29b-41d4-a716-446655440000';
        const header = b64urlJson({ alg: 'HS256', typ: 'JWT' });
        const payload = b64urlJson({ sub, name: 'Nguyễn Văn A' });
        const token = `${header}.${payload}.sig`;
        expect(getKeycloakSubFromAccessToken(token)).toBe(sub);
    });

    it('strips Bearer prefix', () => {
        const sub = '550e8400-e29b-41d4-a716-446655440000';
        const header = b64urlJson({ alg: 'HS256', typ: 'JWT' });
        const payload = b64urlJson({ sub });
        const token = `${header}.${payload}.sig`;
        expect(getKeycloakSubFromAccessToken(`Bearer ${token}`)).toBe(sub);
    });

    it('returns null when token is missing', () => {
        expect(getKeycloakSubFromAccessToken(null)).toBeNull();
        expect(getKeycloakSubFromAccessToken(undefined)).toBeNull();
    });
});
