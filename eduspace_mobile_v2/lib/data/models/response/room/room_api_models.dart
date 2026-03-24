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

class RoomAmenityModel {
  final String name;
  final String? icon;

  RoomAmenityModel({required this.name, this.icon});

  factory RoomAmenityModel.fromJson(Map<String, dynamic> json) {
    return RoomAmenityModel(
      name: json['amenityName'] ?? '',
      icon: json['amenityIcon'],
    );
  }
}

class RoomPolicyModel {
  final String name;
  final String? description;

  RoomPolicyModel({required this.name, this.description});

  factory RoomPolicyModel.fromJson(Map<String, dynamic> json) {
    return RoomPolicyModel(
      name: json['name'] ?? '',
      description: json['description'],
    );
  }
}

class RoomScheduleModel {
  final int dayOfWeek;
  final bool isOpen;
  final String? openTime;
  final String? closeTime;

  RoomScheduleModel({
    required this.dayOfWeek,
    required this.isOpen,
    this.openTime,
    this.closeTime,
  });

  factory RoomScheduleModel.fromJson(Map<String, dynamic> json) {
    return RoomScheduleModel(
      dayOfWeek: json['dayOfWeek'] ?? 0,
      isOpen: json['isOpen'] ?? false,
      openTime: json['openTime'],
      closeTime: json['closeTime'],
    );
  }
}

class RoomResponse {
  final int id;
  final String name;
  final String? description;
  final double pricePerHour;
  final int capacity;
  final double area;
  final String? imageUrl;
  final List<String> imageUrls;
  final String address;
  final double rating;
  final int reviewCount;
  final bool isFavorite;
  final List<RoomAmenityModel> amenities;
  final List<RoomPolicyModel> policies;
  final List<RoomScheduleModel> schedules;

  RoomResponse({
    required this.id,
    required this.name,
    this.description,
    required this.pricePerHour,
    required this.capacity,
    this.area = 0.0,
    this.imageUrl,
    this.imageUrls = const [],
    this.address = '',
    this.rating = 0.0,
    this.reviewCount = 0,
    this.isFavorite = false,
    this.amenities = const [],
    this.policies = const [],
    this.schedules = const [],
  });

  factory RoomResponse.fromJson(Map<String, dynamic> json) {
    // Handle images string from backend
    List<String> images = [];
    if (json['images'] != null && json['images'] is String) {
      images = (json['images'] as String).split(',').where((s) => s.isNotEmpty).toList();
    } else if (json['imageUrls'] != null && json['imageUrls'] is List) {
      images = (json['imageUrls'] as List).map((e) => e.toString()).toList();
    }

    String? firstImage = images.isNotEmpty ? images[0] : json['imageUrl'];

    return RoomResponse(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      description: json['description'],
      pricePerHour: (json['pricePerHour'] as num?)?.toDouble() ?? 0.0,
      capacity: json['capacity'] ?? 0,
      area: (json['area'] as num?)?.toDouble() ?? 0.0,
      imageUrl: firstImage,
      imageUrls: images,
      address: json['location'] ?? '',
      rating: (json['avgRating'] as num?)?.toDouble() ?? 5.0,
      reviewCount: json['reviewCount'] ?? 0,
      isFavorite: json['isFavorite'] ?? false,
      amenities: (json['amenities'] as List?)
              ?.map((e) => RoomAmenityModel.fromJson(e))
              .toList() ??
          [],
      policies: (json['policies'] as List?)
              ?.map((e) => RoomPolicyModel.fromJson(e))
              .toList() ??
          [],
      schedules: (json['schedules'] as List?)
              ?.map((e) => RoomScheduleModel.fromJson(e))
              .toList() ??
          [],
    );
  }
}
