import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../../application/auth/auth_service_impl.dart';
import '../../../data/repositories/auth/auth_repository_impl.dart';
import '../../controllers/auth/auth_controller.dart';
import '../../../core/storage/local_storage_service.dart';
import '../../../data/models/response/profile/profile_model.dart';

class AuthProvider extends ChangeNotifier {
  late final AuthController _controller;
  final LocalStorageService _storage = LocalStorageService();

  AuthProvider() {
    final repository = AuthRepositoryImpl();
    final authService = AuthServiceImpl(repository);
    _controller = AuthController(authService);
  }
  
  bool _isLoading = false;
  String? _error;
  String? _token;
  bool _isLoggedIn = false;
  ProfileModel? _profile;

  bool get isLoading => _isLoading;
  String? get error => _error;
  String? get token => _token;
  bool get isLoggedIn => _isLoggedIn;
  ProfileModel? get profile => _profile;

  Future<void> checkLoginStatus() async {
    await _storage.init();
    final token = _storage.accessToken;
    if (token != null && token.isNotEmpty) {
      _token = token;
      _isLoggedIn = true;
      notifyListeners();
      // Optional: fetch profile immediately
      fetchProfile();
    }
  }

  Future<void> fetchProfile() async {
    _error = null;
    notifyListeners();

    try {
      final authService = _controller.authService; // Need access to service
      _profile = await authService.getProfile();
      notifyListeners();
    } catch (e) {
      _error = _handleError(e);
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final user = await _controller.login(email, password);

      if (user != null) {
        _token = user.accessToken;
        _isLoggedIn = true;
        
        await _storage.init();
        await _storage.saveAccessToken(user.accessToken);
        await _storage.saveRefreshToken(user.refreshToken);
        
        // Fetch profile after login
        await fetchProfile();
        
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      _error = _handleError(e);
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  String _handleError(dynamic e) {
    if (e is DioException) {
      final response = e.response;
      if (response != null) {
        final data = response.data;
        if (data is Map) {
          return data['message']?.toString() ?? 'Có lỗi xảy ra, vui lòng thử lại!';
        }
        return data?.toString() ?? 'Lỗi kết nối server (${response.statusCode})';
      }
      return 'Lỗi kết nối: ${e.message}';
    }
    return e.toString().replaceFirst('Exception: ', '');
  }

  Future<void> logout() async {
    await _storage.init();
    await _storage.clearAuth();
    _token = null;
    _isLoggedIn = false;
    _profile = null;
    notifyListeners();
  }
}
