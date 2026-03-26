import 'package:eduspace_mobile_v2/data/models/entities/auth/user_entity.dart';
import 'package:eduspace_mobile_v2/data/models/response/profile/profile_model.dart';
import '../../../application/auth/auth_service.dart';

class AuthController {
  final AuthService _authService;

  AuthController(this._authService);

  AuthService get authService => _authService;

  Future<UserEntity?> login(String email, String password) {
    return _authService.login(email, password);
  }

  Future<ProfileModel?> getProfile() {
    return _authService.getProfile();
  }
}
