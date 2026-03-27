import '../../../data/models/response/room/room_api_models.dart';
import '../../../../core/network/api_response.dart';

abstract class RoomRepository {
  Future<ApiResponse<List<RoomCategoryResponse>>> getFeaturedCategories();
  Future<ApiResponse<List<RoomResponse>>> getRooms({
    String? category,
    String? keyword,
    int? minCapacity,
    double? minPrice,
    double? maxPrice,
    int? page,
    int? size,
  });
}
