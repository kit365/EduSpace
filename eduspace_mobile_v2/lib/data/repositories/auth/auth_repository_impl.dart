import 'package:eduspace_mobile_v2/core/network/api_client.dart';
import 'package:eduspace_mobile_v2/core/network/api_endpoints.dart';
import '../../models/request/auth/login_request.dart';
import '../../models/response/auth/login_response.dart';
import '../../models/response/profile/profile_model.dart';
import '../../models/entities/auth/user_entity.dart';
import 'auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  final ApiClient _apiClient = ApiClient();

  @override
  Future<UserEntity?> login(String email, String password) async {
    final request = LoginRequest(email: email, password: password);
    
    final response = await _apiClient.post<LoginResponse>(
      ApiEndpoints.login, 
      data: request.toJson(),
      fromJson: (json) => LoginResponse.fromJson(json)
    );

    if (response.success && response.data != null) {
      return UserEntity(
        accessToken: response.data!.accessToken,
        refreshToken: response.data!.refreshToken,
        email: email,
      );
    }
    throw Exception(response.message);
  }

  @override
  Future<ProfileModel?> getProfile() async {
    final response = await _apiClient.get<ProfileModel>(
      ApiEndpoints.me,
      fromJson: (json) => ProfileModel.fromJson(json)
    );

    if (response.success) {
      return response.data;
    }
    throw Exception(response.message);
  }
}
