import 'package:eduspace_mobile_v2/data/models/entities/auth/user_entity.dart';
import 'package:eduspace_mobile_v2/data/models/response/profile/profile_model.dart';
import 'package:eduspace_mobile_v2/data/repositories/auth/auth_repository.dart';
import 'auth_service.dart';

class AuthServiceImpl implements AuthService {
  final AuthRepository _repository;

  AuthServiceImpl(this._repository);

  @override
  Future<UserEntity?> login(String email, String password) {
    return _repository.login(email, password);
  }

  @override
  Future<ProfileModel?> getProfile() {
    return _repository.getProfile();
  }
}
