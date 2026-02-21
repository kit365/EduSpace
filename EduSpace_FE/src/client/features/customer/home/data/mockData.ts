import { Space } from '../../../../../types/space';

export const FEATURED_CATEGORIES = [
  {
    id: 1,
    name: 'Meeting Rooms',
    description: 'Ideal for group discussions and workshops',
    image: 'https://images.unsplash.com/photo-1703355685952-03ed19f70f51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWV0aW5nJTIwcm9vbSUyMG1vZGVybnxlbnwxfHx8fDE3NjgzOTE5MDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    count: '120+ Spaces'
  },
  {
    id: 2,
    name: 'Classrooms',
    description: 'Traditional setups for structured learning',
    image: 'https://images.unsplash.com/photo-1631885661110-aa12f8b42b25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc3Jvb20lMjBlbXB0eSUyMGNoYWlyc3xlbnwxfHx8fDE3NjgzOTE5MDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    count: '85+ Spaces'
  },
  {
    id: 3,
    name: 'Halls',
    description: 'Large venues for seminars and events',
    image: 'https://images.unsplash.com/photo-1766476210492-824c8a4b79b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZW1pbmFyJTIwaGFsbCUyMHByZXNlbnRhdGlvbnxlbnwxfHx8fDE3NjgzOTE5MDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    count: '45+ Spaces'
  }
];

export const TOP_RATED_SPACES: Space[] = [
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
    badge: 'Top Rated',
    type: 'classroom',
    amenities: ['Wifi', 'AC', 'Projector']
  },
  {
    id: 2,
    name: 'Zen Classroom Studio',
    location: 'District 3, HCMC',
    capacity: 15,
    size: 45,
    price: 180000,
    rating: 4.8,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1496115796104-62e3b3446710?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx6ZW4lMjBjbGFzc3Jvb20lMjBzdHVkaW98ZW58MXx8fHwxNzY4MzkxOTA1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    verified: false,
    badge: null,
    type: 'classroom',
    amenities: ['Wifi', 'Whiteboard']
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
    badge: 'Featured',
    type: 'seminar_hall',
    amenities: ['Wifi', 'AC', 'Projector', 'Parking']
  },
  {
    id: 4,
    name: 'Classic Boardroom',
    location: 'District 7, HCMC',
    capacity: 20,
    size: 60,
    price: 310000,
    rating: 4.7,
    reviewCount: 72,
    image: 'https://images.unsplash.com/photo-1637665662134-db459c1bbb46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib2FyZHJvb20lMjBvZmZpY2V8ZW58MXx8fHwxNzY4MzkxOTA2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    verified: false,
    badge: null,
    type: 'classroom',
    amenities: ['Wifi', 'AC']
  }
];
