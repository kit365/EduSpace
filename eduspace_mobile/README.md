# 🏨 Room Booking App — Flutter

Ứng dụng đặt phòng  xây dựng bằng Flutter, theo kiến trúc **Feature-first + Provider**.

---

## 📁 Cấu trúc thư mục

```
lib/
├── main.dart               # Entry point — khởi chạy app
├── app.dart                # Root widget — cấu hình MaterialApp, inject Provider
│
├── core/                   # Code dùng chung toàn app (không thuộc feature nào)
│   ├── constants/          # Hằng số cố định
│   │   ├── api_constants.dart   # Base URL và các endpoint API
│   │   ├── app_colors.dart      # Bảng màu toàn app
│   │   └── app_strings.dart     # Chuỗi text (tránh hardcode)
│   │
│   ├── theme/              # Giao diện tổng thể
│   │   └── app_theme.dart       # Cấu hình ThemeData: font, màu, button, input...
│   │
│   ├── network/            # Cấu hình HTTP
│   │   ├── api_client.dart      # Khởi tạo Dio (HTTP client), singleton
│   │   └── dio_interceptor.dart # Tự gắn Bearer token, xử lý lỗi 401
│   │
│   ├── utils/              # Hàm tiện ích thuần (không có UI)
│   │   ├── validators.dart      # Kiểm tra email, password, phone, required
│   │   └── helpers.dart         # Format tiền, ngày, tính số đêm...
│   │
│   └── widgets/            # Widget tái sử dụng nhiều nơi
│       └── custom_button.dart   # Button chung: loading, outlined, icon
│
├── features/               # ⭐ Mỗi tính năng là 1 folder độc lập
│   │
│   ├── auth/               # Đăng nhập / Đăng ký
│   │   ├── data/
│   │   │   ├── auth_model.dart       # Cấu trúc dữ liệu user trả về từ API
│   │   │   ├── auth_api.dart         # Gọi API: login, register, logout
│   │   │   └── auth_repository.dart  # Trung gian giữa controller và API
│   │   ├── presentation/
│   │   │   ├── auth_controller.dart  # Quản lý state: loading, success, error
│   │   │   ├── login_screen.dart     # UI màn hình đăng nhập
│   │   │   └── register_screen.dart  # UI màn hình đăng ký
│   │   └── auth_route.dart           # Khai báo tên route của feature auth
│   │
│   ├── booking/            # Đặt phòng
│   │   ├── data/
│   │   │   ├── booking_model.dart       # Cấu trúc dữ liệu booking, enum trạng thái
│   │   │   ├── booking_api.dart         # Gọi API: lấy danh sách, tạo, huỷ booking
│   │   │   └── booking_repository.dart  # Trung gian giữa controller và API
│   │   ├── presentation/
│   │   │   ├── booking_controller.dart      # Quản lý state danh sách booking
│   │   │   └── booking_list_screen.dart     # UI danh sách booking của user
│   │   └── booking_route.dart               # Khai báo tên route của feature booking
│   │
│   └── profile/            # Hồ sơ người dùng
│       ├── data/
│       │   └── profile_model.dart       # Cấu trúc dữ liệu profile
│       └── presentation/
│           └── profile_screen.dart      # UI màn hình hồ sơ
│
└── routes/
    └── app_router.dart     # Router trung tâm — map tên route → màn hình
```

---

## 🧠 Kiến trúc hoạt động thế nào?

```
UI (Screen)
  └── đọc/ghi state từ → Controller  (ChangeNotifier)
                              └── gọi → Repository
                                            └── gọi → API  (Dio)
                                                      └── Backend Server
```

| Tầng | Nhiệm vụ |
|---|---|
| **Screen** | Hiển thị UI, lắng nghe state từ Controller |
| **Controller** | Quản lý trạng thái (loading / success / error), gọi Repository |
| **Repository** | Lớp trung gian, dễ mock khi test |
| **API** | Gọi HTTP thực tế bằng Dio |
| **Model** | Chuyển đổi JSON ↔ Dart object |

---

## 📦 Packages sẽ dùng

| Package | Dùng để |
|---|---|
| `provider` | Quản lý state |
| `dio` | Gọi HTTP API |
| `go_router` | Điều hướng màn hình |
| `shared_preferences` | Lưu token local |
| `intl` | Format tiền, ngày tháng |
| `cached_network_image` | Load ảnh có cache |

---

## 🚀 Chạy project

```bash
flutter pub get
flutter run
```
