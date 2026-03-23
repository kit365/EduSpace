import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LocalStorageService {
  static final LocalStorageService _instance = LocalStorageService._internal();
  factory LocalStorageService() => _instance;
  LocalStorageService._internal();

  static const String _keyAccessToken = 'accessToken';
  static const String _keyRefreshToken = 'refreshToken';
  static const String _keyUser = 'userData';
  static const String _keyGuestId = 'guestId';

  SharedPreferences? _prefs;

  Future<void> init() async {
    _prefs ??= await SharedPreferences.getInstance();
    
    // Auto-generate Guest ID if not exists
    if (guestId == null) {
      final newGuestId = 'GUEST-${DateTime.now().millisecondsSinceEpoch}-${(1000 + (9000 * (new DateTime.now().millisecond / 1000))).toInt()}';
      await _prefs?.setString(_keyGuestId, newGuestId);
      debugPrint('--- LocalStorage: Generated New Guest ID: $newGuestId ---');
    }
  }

  // Guest ID
  String? get guestId => _prefs?.getString(_keyGuestId);

  Future<void> clearGuestId() async {
    await _prefs?.remove(_keyGuestId);
  }

  // Access Token
  Future<void> saveAccessToken(String token) async {
    debugPrint('--- LocalStorage: Saving Access Token ---');
    if (token.length >= 5) {
      debugPrint('Token starts with: ${token.substring(0, 5)}...');
    } else {
      debugPrint('Token: $token');
    }
    await _prefs?.setString(_keyAccessToken, token);
    debugPrint('--- LocalStorage: Access Token Saved ---');
  }

  String? get accessToken {
    final token = _prefs?.getString(_keyAccessToken)?.trim();
    if (token == null) {
      debugPrint('--- LocalStorage: Access Token is NULL ---');
    } else {
      if (token.length >= 5) {
        debugPrint('--- LocalStorage: Retrieved Token starts with: ${token.substring(0, 5)}...');
      } else {
        debugPrint('--- LocalStorage: Retrieved Token: $token');
      }
    }
    return token;
  }

  // Refresh Token
  Future<void> saveRefreshToken(String token) async {
    await _prefs?.setString(_keyRefreshToken, token);
  }

  String? get refreshToken => _prefs?.getString(_keyRefreshToken)?.trim();

  // User Data
  Future<void> saveUser(Map<String, dynamic> user) async {
    await _prefs?.setString(_keyUser, jsonEncode(user));
  }

  Map<String, dynamic>? get user {
    final data = _prefs?.getString(_keyUser);
    if (data == null) return null;
    return jsonDecode(data) as Map<String, dynamic>;
  }

  // Clear all
  Future<void> clearAuth() async {
    await _prefs?.remove(_keyAccessToken);
    await _prefs?.remove(_keyRefreshToken);
    await _prefs?.remove(_keyUser);
  }
}
