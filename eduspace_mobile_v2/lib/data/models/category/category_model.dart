import 'package:flutter/material.dart';

class CategoryModel {
  final String label;
  final IconData icon;

  const CategoryModel({required this.label, required this.icon});
}

final List<CategoryModel> mockCategories = [
  const CategoryModel(label: 'Meeting', icon: Icons.meeting_room_outlined),
  const CategoryModel(label: 'Labs', icon: Icons.science_outlined),
  const CategoryModel(label: 'Lecture', icon: Icons.groups_outlined),
  const CategoryModel(label: 'IT Suite', icon: Icons.computer_outlined),
  const CategoryModel(label: 'Studio', icon: Icons.palette_outlined),
  const CategoryModel(label: 'Library', icon: Icons.local_library_outlined),
];
