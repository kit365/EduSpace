import 'package:eduspace_mobile_v2/data/models/entities/auth/user_entity.dart';
import 'package:eduspace_mobile_v2/data/models/response/profile/profile_model.dart';

abstract class AuthService {
  Future<UserEntity?> login(String email, String password);
  Future<ProfileModel?> getProfile();
}
