class RoomModel {
  final String id;
  final String name;
  final String imageUrl;
  final List<String> imageUrls; // carousel
  final double rating;
  final int reviewCount;
  final int capacity;
  final int sqft;
  final List<String> amenities;
  final double pricePerHour;
  final double distanceMi;
  final String address;
  final String description;
  final bool isFeatured;
  final bool isFavorite;

  const RoomModel({
    required this.id,
    required this.name,
    required this.imageUrl,
    List<String>? imageUrls,
    required this.rating,
    this.reviewCount = 0,
    required this.capacity,
    this.sqft = 0,
    required this.amenities,
    required this.pricePerHour,
    required this.distanceMi,
    this.address = '',
    this.description = '',
    this.isFeatured = false,
    this.isFavorite = false,
  }) : imageUrls = imageUrls ?? const [];
}

// ─── Mock Data ────────────────────────────────────────────────
final List<RoomModel> mockRooms = [
  const RoomModel(
    id: '1',
    name: 'Grand Innovation Hall',
    imageUrl:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80',
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
    ],
    rating: 4.9,
    reviewCount: 120,
    capacity: 50,
    sqft: 850,
    amenities: ['WiFi', 'A/C', 'Projector', 'Coffee'],
    pricePerHour: 45,
    distanceMi: 0.8,
    address:
        '123 Education Lane, Academic District, Suite 405, Ho Chi Minh City',
    description:
        'Designed for high-impact meetings and professional seminars. This space features ergonomic seating, high-speed fiber internet, and premium acoustic treatment to ensure your presentation is delivered perfectly.',
    isFeatured: true,
    isFavorite: true,
  ),
  const RoomModel(
    id: '2',
    name: 'Quiet Focus Lab',
    imageUrl:
        'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=800&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=800&q=80',
      'https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800&q=80',
    ],
    rating: 4.7,
    reviewCount: 87,
    capacity: 12,
    sqft: 320,
    amenities: ['WiFi', 'Projector', 'A/C'],
    pricePerHour: 28,
    distanceMi: 1.2,
    address: '56 University Ave, District 3, Ho Chi Minh City',
    description:
        'A calm, distraction-free workspace ideal for focused study sessions, small team meetings, and creative workshops. Equipped with high-speed internet and a large display screen.',
  ),
  const RoomModel(
    id: '3',
    name: 'Creative Studio A',
    imageUrl:
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
    ],
    rating: 4.8,
    reviewCount: 54,
    capacity: 20,
    sqft: 450,
    amenities: ['WiFi', 'Whiteboard', 'Coffee'],
    pricePerHour: 35,
    distanceMi: 0.5,
    address: '88 Innovation Blvd, Binh Thanh District, Ho Chi Minh City',
    description:
        'An inspiring open-plan studio designed for creative teams. Flexible furniture layout, natural lighting, and all the tools you need to brainstorm and collaborate effectively.',
  ),
  const RoomModel(
    id: '4',
    name: 'Tech Conference Room',
    imageUrl:
        'https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800&q=80',
    ],
    rating: 4.6,
    reviewCount: 33,
    capacity: 30,
    sqft: 600,
    amenities: ['WiFi', 'A/C', 'TV Screen'],
    pricePerHour: 55,
    distanceMi: 2.1,
    address: '200 Tech Park, District 9, Ho Chi Minh City',
    description:
        'A fully equipped conference room for corporate meetings and tech presentations. Features a 75-inch smart TV, video conferencing system, and sound-proof walls.',
  ),
];
