import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_endpoints.dart';
import '../../../../core/network/api_response.dart';
import '../../models/response/room/room_api_models.dart';
import '../../../domain/repositories/room/room_repository.dart';

class RoomRepositoryImpl implements RoomRepository {
  final ApiClient _apiClient = ApiClient();

  @override
  Future<ApiResponse<List<RoomCategoryResponse>>> getFeaturedCategories() async {
    return await _apiClient.get<List<RoomCategoryResponse>>(
      ApiEndpoints.featuredCategories,
      fromJson: (json) {
        if (json is List) {
          return json.map((e) => RoomCategoryResponse.fromJson(e)).toList();
        }
        return [];
      },
    );
  }

  @override
  Future<ApiResponse<List<RoomResponse>>> getRooms({
    String? category,
    String? keyword,
    int? minCapacity,
    double? minPrice,
    double? maxPrice,
    int? page,
    int? size,
  }) async {
    final queryParams = <String, dynamic>{};
    if (category != null) queryParams['category'] = category;
    if (keyword != null) queryParams['keyword'] = keyword;
    if (minCapacity != null) queryParams['minCapacity'] = minCapacity;
    if (minPrice != null) queryParams['minPrice'] = minPrice;
    if (maxPrice != null) queryParams['maxPrice'] = maxPrice;
    if (page != null) queryParams['page'] = page;
    if (size != null) queryParams['size'] = size;

    return await _apiClient.get<List<RoomResponse>>(
      ApiEndpoints.roomsBase,
      queryParameters: queryParams,
      fromJson: (json) {
        // Backend returns PageResponse, so we need to handle it
        if (json is Map<String, dynamic> && json['content'] != null) {
          final content = json['content'] as List;
          return content.map((e) => RoomResponse.fromJson(e)).toList();
        }
        return [];
      },
    );
  }
}
