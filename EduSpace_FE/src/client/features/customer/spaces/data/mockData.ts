import { Wifi, Coffee, Projector, Printer, Wind, Zap } from 'lucide-react';
import { SpaceDetails } from '../../../../../types/space';

export const SPACE_DETAILS_DATA: Record<number, SpaceDetails> = {
  1: {
    id: 1,
    name: 'Premium Seminar Room - District 1',
    location: 'Quận 1, TP.HCM',
    address: 'Toà nhà Bitexco Financial Tower, số 2 Hải Triều, Bến Nghé, Quận 1, Thành phố Hồ Chí Minh, Việt Nam',
    rating: 4.8,
    reviewCount: 124,
    capacity: 50,
    size: 120,
    price: 450000,
    image: 'https://images.unsplash.com/photo-1766476210492-824c8a4b79b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZW1pbmFyJTIwaGFsbCUyMHByZXNlbnRhdGlvbnxlbnwxfHx8fDE3NjgzOTE5MDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    images: [
      'https://images.unsplash.com/photo-1766476210492-824c8a4b79b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZW1pbmFyJTIwaGFsbCUyMHByZXNlbnRhdGlvbnxlbnwxfHx8fDE3NjgzOTE5MDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1631885661110-aa12f8b42b25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc3Jvb20lMjBlbXB0eSUyMGNoYWlyc3xlbnwxfHx8fDE3NjgzOTE5MDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1703355685952-03ed19f70f51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWV0aW5nJTIwcm9vbSUyMG1vZGVybnxlbnwxfHx8fDE3NjgzOTE5MDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1758270704524-596810e891b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGNsYXNzcm9vbSUyMGxlYXJuaW5nfGVufDF8fHx8MTc2ODM0NDExOXww&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    verified: true,
    type: 'seminar_hall',
    amenities: ['Wifi', 'AC', 'Projector', 'Coffee', 'Printer', 'Charging'],
    description: 'Modern and fully equipped seminar room located in the heart of Saigon. Ideal for corporate training, workshops, and language classes. Our space features natural lighting, high-quality audio-visual equipment and comfortable seating arrangements for up to 50 participants. High-speed fiber optic internet is included.',
    additionalInfo: 'The room is accessible 24/7 with advance booking. We provide complimentary coffee and tea for all-day participants. High-speed WiFi and air conditioning are included.',
    amenitiesDetailed: [
      { icon: Wifi, name: 'High-speed Wi-Fi' },
      { icon: Projector, name: 'Air Projector' },
      { icon: Wind, name: 'Air Conditioning' },
      { icon: Coffee, name: 'Free Coffee & Tea' },
      { icon: Printer, name: 'Printing Service' },
      { icon: Zap, name: 'Charging Stations' }
    ],
    availableSlots: 25,
    reviews: [
      {
        id: 1,
        author: 'Nguyen Van A',
        date: 'August 2023',
        rating: 4.8,
        comment: 'Excellent space for my 4-day workshop. The host was very responsive and the tech setup was flawless. Highly recommend!',
        avatar: 'https://i.pravatar.cc/150?img=12'
      },
      {
        id: 2,
        author: 'Tran Thi B',
        date: 'August 2023',
        rating: 4.8,
        comment: 'Great location and very professional environment. The air conditioning was perfect. My students loved the space for our HCMC field trip.',
        avatar: 'https://i.pravatar.cc/150?img=45'
      },
      {
        id: 3,
        author: 'Pham Minh C',
        date: 'September 2023',
        rating: 5.0,
        comment: 'Best seminar hall in Dist 1. I have booked here multiple times and it never disappoints. The amenities are top-notch.',
        avatar: 'https://i.pravatar.cc/150?img=32'
      },
      {
        id: 4,
        author: 'Le Thu D',
        date: 'October 2023',
        rating: 4.5,
        comment: 'Everything was great, but the parking was a bit tight during peak hours. Otherwise, 5 stars!',
        avatar: 'https://i.pravatar.cc/150?img=25'
      }
    ]
  }
};
