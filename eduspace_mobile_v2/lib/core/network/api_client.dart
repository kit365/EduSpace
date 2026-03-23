import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../storage/local_storage_service.dart';
import '../network/api_endpoints.dart';
import 'api_response.dart';

class ApiClient {
  late final Dio _dio;
  final LocalStorageService _storage = LocalStorageService();

  ApiClient() {
    _init();
  }

  void _init() {
    final baseUrl = dotenv.get('API_URL', fallback: 'http://localhost:${dotenv.get('GATEWAY_PORT', fallback: '8080')}');
    
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        contentType: 'application/json',
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          await _storage.init();
          
          final isPublic = options.path.contains(ApiEndpoints.login) || 
                           options.path.contains(ApiEndpoints.register) ||
                           options.path.contains('auth/refresh');
          
          if (!isPublic) {
            final token = _storage.accessToken;
            if (token != null && token.isNotEmpty) {
              options.headers['Authorization'] = 'Bearer $token';
              // Also attach Guest ID for seamless migration if still present
              final guestId = _storage.guestId;
              if (guestId != null) {
                options.headers['X-Guest-ID'] = guestId;
              }
            } else {
              final guestId = _storage.guestId;
              if (guestId != null) {
                options.headers['X-Guest-ID'] = guestId;
              }
            }
          }
          
          return handler.next(options);
        },
        onError: (DioException e, handler) async {
          if (e.response?.statusCode == 401) {
            final isPublic = e.requestOptions.path.contains(ApiEndpoints.login) || 
                             e.requestOptions.path.contains(ApiEndpoints.register) ||
                             e.requestOptions.path.contains('auth/refresh');
            
            if (!isPublic) {
              final refreshToken = _storage.refreshToken;
              if (refreshToken != null) {
                try {
                  // Attempt to refresh
                  final refreshResponse = await _dio.post(
                    'api/v1/auth/refresh',
                    data: {'refreshToken': refreshToken},
                  );

                  if (refreshResponse.statusCode == 200 || refreshResponse.statusCode == 201) {
                    final data = refreshResponse.data['data'];
                    final newAccessToken = data['access_token'] ?? data['accessToken'];
                    final newRefreshToken = data['refresh_token'] ?? data['refreshToken'];

                    if (newAccessToken != null) {
                      await _storage.saveAccessToken(newAccessToken);
                      if (newRefreshToken != null) {
                        await _storage.saveRefreshToken(newRefreshToken);
                      }

                      // Retry original request
                      final opts = e.requestOptions;
                      opts.headers['Authorization'] = 'Bearer $newAccessToken';
                      final response = await _dio.fetch(opts);
                      return handler.resolve(response);
                    }
                  }
                } catch (refreshError) {
                  debugPrint('--- Token Refresh Failed ---');
                  await _storage.clearAuth();
                  // In a real app, you might want to redirect to login here
                  // using a navigator key or a stream.
                }
              }
            }
          }

          debugPrint('--- API ERROR ---');
          debugPrint('Path: ${e.requestOptions.path}');
          debugPrint('Status Code: ${e.response?.statusCode}');
          debugPrint('Response Data: ${e.response?.data}');
          debugPrint('------------------');
          return handler.next(e);
        },
      ),
    );
  }

  Future<ApiResponse<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    T Function(dynamic json)? fromJson, 
  }) async {
    try {
      final response = await _dio.get(path, queryParameters: queryParameters);
      return ApiResponse<T>.fromJson(response.data, fromJson);
    } catch (e) {
      rethrow;
    }
  }

  Future<ApiResponse<T>> post<T>(
    String path, {
    dynamic data,
    T Function(dynamic json)? fromJson,
  }) async {
    try {
      final response = await _dio.post(path, data: data);
      return ApiResponse<T>.fromJson(response.data, fromJson);
    } catch (e) {
      rethrow;
    }
  }

  Future<ApiResponse<T>> put<T>(
    String path, {
    dynamic data,
    T Function(dynamic json)? fromJson,
  }) async {
    try {
      final response = await _dio.put(path, data: data);
      return ApiResponse<T>.fromJson(response.data, fromJson);
    } catch (e) {
      rethrow;
    }
  }

  Future<ApiResponse<T>> patch<T>(
    String path, {
    dynamic data,
    T Function(dynamic json)? fromJson,
  }) async {
    try {
      final response = await _dio.patch(path, data: data);
      return ApiResponse<T>.fromJson(response.data, fromJson);
    } catch (e) {
      rethrow;
    }
  }

  Future<ApiResponse<T>> delete<T>(
    String path, {
    T Function(dynamic json)? fromJson,
  }) async {
    try {
      final response = await _dio.delete(path);
      return ApiResponse<T>.fromJson(response.data, fromJson);
    } catch (e) {
      rethrow;
    }
  }
}
