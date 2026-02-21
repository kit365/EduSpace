import { Space } from '../../../../../types/space';

export const FAVORITE_SPACES: Space[] = [
    {
        id: 1,
        name: 'Tech Hub Training Suite',
        location: 'District 1, HCMC',
        capacity: 30,
        size: 75,
        price: 250000,
        rating: 4.9,
        reviewCount: 124,
        image: 'https://images.unsplash.com/photo-1640622304964-3e2c2c0cd7cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwdHJhaW5pbmclMjByb29tfGVufDF8fHx8MTc2ODM5MTkwNXww&ixlib=rb-4.1.0&q=80&w=1080',
        verified: true,
        badge: 'Saved',
        type: 'classroom',
        amenities: ['Wifi', 'AC', 'Projector'],
        hostId: '2',
        approvalStatus: 'active'
    },
    {
        id: 3,
        name: 'The Creative Commons',
        location: 'Binh Thanh, HCMC',
        capacity: 40,
        size: 90,
        price: 420000,
        rating: 5.0,
        reviewCount: 156,
        image: 'https://images.unsplash.com/photo-1556978082-fc2023bb5081?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMGNvbW1vbnMlMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzY4MzkxOTA2fDA&ixlib=rb-4.1.0&q=80&w=1080',
        verified: true,
        badge: 'Popular',
        type: 'seminar_hall',
        amenities: ['Wifi', 'AC', 'Projector', 'Parking'],
        hostId: '5',
        approvalStatus: 'active'
    }
];
