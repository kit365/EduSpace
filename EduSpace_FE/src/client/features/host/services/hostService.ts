class HostService {
    async publishSpace(data: any): Promise<void> {
        return new Promise((resolve) => {
            // Logic from ListSpacePage
            console.log('Sending to API:', data);
            setTimeout(resolve, 2000);
        });
    }

    async getHostStats(): Promise<any> {
        return new Promise((resolve) => {
            setTimeout(() => resolve({
                activeListings: 12,
                pendingBookings: 5,
                totalEarnings: 45000000,
                averageRating: 4.8
            }), 400);
        });
    }
}

export const hostService = new HostService();
