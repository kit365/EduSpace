import { ROOM_API } from '@/config/api';
import apiClient from '@/lib/axios';

export type BranchApprovalStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'BANNED';
export type HostBranchStatus = 'active' | 'inactive' | 'pending' | 'rejected' | 'banned';

interface PropertyApiDto {
    id: number;
    ownerId: string | null;
    name: string;
    propertyType: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
    provinceCode: string | null;
    districtCode: string | null;
    wardCode: string | null;
    addressDetail: string | null;
    logo: string | null;
    description: string | null;
    status: BranchApprovalStatus | null;
    rejectionNote: string | null;
    submittedAt: string | null;
    approvedBy: string | null;
    approvedAt: string | null;
}

interface PropertyUpsertRequest {
    ownerId: string;
    nameVi: string;
    nameEn: string;
    propertyType: string;
    contactPhone: string;
    contactEmail: string;
    provinceCode?: string | null;
    districtCode?: string | null;
    wardCode?: string | null;
    addressDetailVi: string;
    addressDetailEn: string;
    logo?: string | null;
    descriptionVi?: string | null;
    descriptionEn?: string | null;
    status?: BranchApprovalStatus;
}

export interface HostBranch {
    id: number;
    ownerId: string;
    name: string;
    propertyType: string;
    address: string;
    provinceCode: string;
    districtCode: string;
    wardCode: string;
    logo: string;
    manager: string;
    status: HostBranchStatus;
    rawStatus: BranchApprovalStatus;
    phone: string;
    email: string;
    rejectionNote: string | null;
    submittedAt: string | null;
    approvedBy: string | null;
    approvedAt: string | null;
}

export interface BranchUpsertPayload {
    ownerId: string;
    name: string;
    propertyType: string;
    address: string;
    provinceCode?: string;
    districtCode?: string;
    wardCode?: string;
    logo?: string;
    phone: string;
    email: string;
    manager?: string;
    description?: string;
}

export interface CreateBranchResult {
    branch: HostBranch;
    created: boolean;
}

interface BranchModerationPayload {
    approvedBy?: string;
    rejectionNote?: string;
}

function unwrap<T>(res: unknown): T {
    if (res && typeof res === 'object' && 'data' in res && (res as { data: unknown }).data !== undefined) {
        return (res as { data: T }).data;
    }
    return res as T;
}

function toHostStatus(status: BranchApprovalStatus | null): HostBranchStatus {
    switch (status) {
        case 'VERIFIED':
            return 'active';
        case 'REJECTED':
            return 'rejected';
        case 'BANNED':
            return 'banned';
        case 'PENDING':
        default:
            return 'pending';
    }
}

function mapPropertyToBranch(dto: PropertyApiDto): HostBranch {
    const rawStatus: BranchApprovalStatus = dto.status ?? 'PENDING';
    return {
        id: dto.id,
        ownerId: dto.ownerId ?? '',
        name: dto.name ?? 'Chi nhánh chưa đặt tên',
        propertyType: dto.propertyType ?? '',
        address: dto.addressDetail ?? '',
        provinceCode: dto.provinceCode ?? '',
        districtCode: dto.districtCode ?? '',
        wardCode: dto.wardCode ?? '',
        logo: dto.logo ?? '',
        manager: dto.description ?? 'Host',
        status: toHostStatus(rawStatus),
        rawStatus,
        phone: dto.contactPhone ?? '',
        email: dto.contactEmail ?? '',
        rejectionNote: dto.rejectionNote ?? null,
        submittedAt: dto.submittedAt ?? null,
        approvedBy: dto.approvedBy ?? null,
        approvedAt: dto.approvedAt ?? null,
    };
}

function mapUpsertPayload(payload: BranchUpsertPayload): PropertyUpsertRequest {
    return {
        ownerId: payload.ownerId,
        nameVi: payload.name.trim(),
        nameEn: payload.name.trim(),
        propertyType: payload.propertyType.trim(),
        contactPhone: payload.phone.trim(),
        contactEmail: payload.email.trim(),
        provinceCode: payload.provinceCode?.trim() || null,
        districtCode: payload.districtCode?.trim() || null,
        wardCode: payload.wardCode?.trim() || null,
        addressDetailVi: payload.address.trim(),
        addressDetailEn: payload.address.trim(),
        logo: payload.logo?.trim() || null,
        descriptionVi: payload.manager?.trim() || payload.description?.trim() || null,
        descriptionEn: payload.manager?.trim() || payload.description?.trim() || null,
    };
}

function normalizeText(s: string): string {
    return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

export const branchService = {
    listAll: async (): Promise<HostBranch[]> => {
        const res = await apiClient.get(ROOM_API.BRANCHES);
        const list = unwrap<PropertyApiDto[]>(res);
        if (!Array.isArray(list)) return [];
        return list.map(mapPropertyToBranch);
    },

    listByOwner: async (ownerId: string, ownerAliases: string[] = []): Promise<HostBranch[]> => {
        const all = await branchService.listAll();
        const owners = new Set(
            [ownerId, ...ownerAliases]
                .map((v) => (v ?? '').trim())
                .filter((v) => v.length > 0)
        );
        return all.filter((b) => owners.has((b.ownerId ?? '').trim()));
    },

    create: async (payload: BranchUpsertPayload): Promise<HostBranch> => {
        const body = mapUpsertPayload(payload);
        const res = await apiClient.post(ROOM_API.BRANCHES, body);
        return mapPropertyToBranch(unwrap<PropertyApiDto>(res));
    },

    createIfNotExists: async (payload: BranchUpsertPayload): Promise<CreateBranchResult> => {
        const ownerBranches = await branchService.listByOwner(payload.ownerId);
        const targetName = normalizeText(payload.name);
        const targetAddress = normalizeText(payload.address);
        const duplicated = ownerBranches.find(
            (b) => normalizeText(b.name) === targetName && normalizeText(b.address) === targetAddress
        );
        if (duplicated) {
            return { branch: duplicated, created: false };
        }
        const createdBranch = await branchService.create(payload);
        return { branch: createdBranch, created: true };
    },

    update: async (id: number, payload: BranchUpsertPayload): Promise<HostBranch> => {
        const body = mapUpsertPayload(payload);
        const res = await apiClient.put(`${ROOM_API.BRANCHES}/${id}`, body);
        return mapPropertyToBranch(unwrap<PropertyApiDto>(res));
    },

    approve: async (id: number, payload?: BranchModerationPayload): Promise<HostBranch> => {
        const res = await apiClient.post(`${ROOM_API.BRANCHES}/${id}/approve`, {
            approvedBy: payload?.approvedBy ?? null,
        });
        return mapPropertyToBranch(unwrap<PropertyApiDto>(res));
    },

    reject: async (id: number, payload?: BranchModerationPayload): Promise<HostBranch> => {
        const res = await apiClient.post(`${ROOM_API.BRANCHES}/${id}/reject`, {
            rejectionNote: payload?.rejectionNote ?? null,
        });
        return mapPropertyToBranch(unwrap<PropertyApiDto>(res));
    },

    /**
     * Xóa mềm chi nhánh (backend đánh dấu `deleted`, không xóa bản ghi).
     * Gọi khi cần ẩn cơ sở khỏi danh sách host; dữ liệu vẫn lưu trong DB.
     */
    remove: async (id: number): Promise<void> => {
        await apiClient.delete(`${ROOM_API.BRANCHES}/${id}`);
    },
};
