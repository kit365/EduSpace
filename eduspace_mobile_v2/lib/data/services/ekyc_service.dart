import 'package:dio/dio.dart';

import '../../core/network/api_client.dart';
import '../../core/network/api_endpoints.dart';

/// eKYC: uploads go to account-service only; Python eduspace-ai is never called from the app.
class EkycVerifyResult {
  EkycVerifyResult({
    required this.status,
    this.ocrData,
    this.faceMatchingScore = 0,
    this.message,
  });

  final String status;
  final EkycOcrData? ocrData;
  final double faceMatchingScore;
  final String? message;

  factory EkycVerifyResult.fromJson(Map<String, dynamic> json) {
    Map<String, dynamic>? ocr;
    final raw = json['ocrData'];
    if (raw is Map<String, dynamic>) {
      ocr = raw;
    }
    return EkycVerifyResult(
      status: json['status'] as String? ?? 'failed',
      ocrData: ocr != null ? EkycOcrData.fromJson(ocr) : null,
      faceMatchingScore: (json['faceMatchingScore'] as num?)?.toDouble() ?? 0,
      message: json['message'] as String?,
    );
  }
}

class EkycOcrData {
  EkycOcrData({
    this.name,
    this.idNumber,
    this.dob,
    this.address,
    this.expiryDate,
  });

  final String? name;
  final String? idNumber;
  final String? dob;
  final String? address;
  final String? expiryDate;

  factory EkycOcrData.fromJson(Map<String, dynamic> json) {
    return EkycOcrData(
      name: json['name'] as String?,
      idNumber: json['idNumber'] as String?,
      dob: json['dob'] as String?,
      address: json['address'] as String?,
      expiryDate: json['expiryDate'] as String?,
    );
  }
}

Future<EkycVerifyResult> submitEkycVerification({
  required ApiClient client,
  required List<int> frontBytes,
  required String frontName,
  List<int>? backBytes,
  String? backName,
  required List<int> selfieBytes,
  required String selfieName,
}) async {
  final form = FormData.fromMap({
    'front': MultipartFile.fromBytes(frontBytes, filename: frontName),
    'selfie': MultipartFile.fromBytes(selfieBytes, filename: selfieName),
    if (backBytes != null && backBytes.isNotEmpty && backName != null)
      'back': MultipartFile.fromBytes(backBytes, filename: backName),
  });

  final res = await client.postMultipart<Map<String, dynamic>>(
    ApiEndpoints.ekycVerify,
    data: form,
    fromJson: (json) => json as Map<String, dynamic>,
  );

  final data = res.data;
  if (data == null) {
    throw StateError('Empty eKYC response');
  }
  return EkycVerifyResult.fromJson(data);
}
