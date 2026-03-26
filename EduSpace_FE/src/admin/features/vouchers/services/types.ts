// Voucher & Campaign types

export interface VoucherCampaign {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Voucher {
    id: number;
    campaignId?: number;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    minOrderValue: number;
    maxDiscountAmount: number | null;
    maxUses: number | null;
    usedCount: number;
    maxUsesPerUser: number;
    validFrom: string;
    validUntil: string;
    isPublic: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
