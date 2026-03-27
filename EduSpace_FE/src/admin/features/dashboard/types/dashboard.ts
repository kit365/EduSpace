export interface Property {
    id: number;
    name: string;
    type: string;
    ownerId: string;
    status: string;
    createdAt: string;
}

export interface TopHost {
    hostId: string;
    hostName: string;
    hostAvatar?: string;
    totalRevenue: number;
    totalBookings: number;
    activeListings: number;
}

export interface DashboardStats {
    totalUsers: number;
    activeHosts: number;
    pendingKyc: number;
    totalListings: number;
    newListingsToday: number;
    totalBookings: number;
    totalRevenue: number;
    successRate: number;
    categoryDistribution?: string; // JSON string from backend
    pendingListings: Property[];
    topHosts: TopHost[];
    updatedAt: string;
}

export interface DashboardResponse {
    success: boolean;
    data: DashboardStats;
}
