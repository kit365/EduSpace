export interface HostBranch {
    id: number;
    name: string;
    address: string;
    manager: string;
    status: 'active' | 'inactive';
    phone: string;
    email: string;
}

export const MOCK_BRANCHES: HostBranch[] = [
    {
        id: 1,
        name: 'Cơ sở Quận 1 (Trụ sở chính)',
        address: 'Toà nhà Bitexco, số 2 Hải Triều, Bến Nghé, Quận 1',
        manager: 'Trần Thị Bích Ngọc',
        status: 'active',
        phone: '0901234567',
        email: 'hq.q1@eduspace.vn',
    },
    {
        id: 2,
        name: 'Cơ sở Quận 3',
        address: '12 Võ Văn Tần, Phường 6, Quận 3',
        manager: 'Võ Minh Tuấn',
        status: 'active',
        phone: '0907654321',
        email: 'branch.q3@eduspace.vn',
    }
];
