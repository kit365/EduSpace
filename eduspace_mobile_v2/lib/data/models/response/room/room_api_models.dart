import 'package:flutter/material.dart';

class RoomCategoryResponse {
  final int id;
  final String name;
  final String? description;
  final String? iconName;
  final bool isFeatured;

  RoomCategoryResponse({
    required this.id,
    required this.name,
    this.description,
    this.iconName,
    this.isFeatured = false,
  });

  factory RoomCategoryResponse.fromJson(Map<String, dynamic> json) {
    return RoomCategoryResponse(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      iconName: json['iconName'],
      isFeatured: json['isFeatured'] ?? false,
    );
  }
}

class RoomResponse {
  final int id;
  final String name;
  final String? description;
  final double pricePerHour;
  final int capacity;
  final String? imageUrl;
  final List<String> imageUrls;
  final String address;
  final double rating;
  final int reviewCount;
  final List<String> amenities;

  RoomResponse({
    required this.id,
    required this.name,
    this.description,
    required this.pricePerHour,
    required this.capacity,
    this.imageUrl,
    this.imageUrls = const [],
    this.address = '',
    this.rating = 0.0,
    this.reviewCount = 0,
    this.amenities = const [],
  });

  factory RoomResponse.fromJson(Map<String, dynamic> json) {
    return RoomResponse(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      pricePerHour: (json['pricePerHour'] as num?)?.toDouble() ?? 0.0,
      capacity: json['capacity'] ?? 0,
      imageUrl: json['imageUrl'] ?? (json['imageUrls'] != null && (json['imageUrls'] as List).isNotEmpty ? json['imageUrls'][0] : null),
      imageUrls: (json['imageUrls'] as List?)?.map((e) => e.toString()).toList() ?? [],
      address: json['location'] ?? '',
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      reviewCount: json['reviewCount'] ?? 0,
      amenities: (json['amenities'] as List?)?.map((e) => e.toString()).toList() ?? [],
    );
  }
}
