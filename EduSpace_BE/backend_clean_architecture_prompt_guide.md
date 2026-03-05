# Backend Clean Architecture & Response Standard

## 1. API Response Standard

All APIs MUST return a unified response structure.

```json
{
  "timestamp": "2026-03-04T10:15:30Z",
  "status": 200,
  "code": "USER_REGISTER_SUCCESS",
  "message": "Đăng ký tài khoản thành công",
  "data": {}
}
```

### Rules
- `status` MUST match the real HTTP status.
- `code` MUST be a business code (enum).
- `message` MUST NOT be hardcoded in controller.
- All errors MUST go through GlobalExceptionHandler.
- Controllers MUST NOT return raw ResponseEntity without wrapper.
- Only ONE response wrapper class is allowed (e.g., ApiResponse<T>). Remove redundant classes like MessageResponse.

---

## 2. Constants Architecture

### General Rules
- NO hardcoded strings for:
  - API base path
  - Endpoint path
  - Role names
  - Header names
  - Error messages
  - Business codes
  - External URLs
  - Frontend URLs
  - Redirect URLs
  - Queue/topic names
  - Realm names
- Log debug messages MAY be hardcoded.

---

## 3. Folder Structure for Constants

Organize by DOMAIN first, not by layer.

```
accountservice/
  common/
    constants/
      ApiPaths.java
      SecurityConstants.java
      SystemConstants.java
  user/
    constants/
      UserMessages.java
      UserErrorCodes.java
```

---

## 4. API Path Standardization

Create a central ApiPaths class:

```java
public final class ApiPaths {

    public static final String BASE = "/api/v1";

    public static final String AUTH = BASE + "/auth";
    public static final String REGISTER = "/register";
}
```

Controllers must use constants instead of hardcoded paths.

---

## 5. Error Code Strategy

Create a Business ErrorCode enum:

```java
public enum ErrorCode {
    USER_NOT_FOUND,
    USER_ALREADY_EXISTS,
    INVALID_CREDENTIALS,
    INTERNAL_SERVER_ERROR
}
```

Each error must:
- Map to HTTP status
- Have corresponding message constant

---

## 6. Message Management (Bilingual Support - EN / VI)

System must support bilingual response messages (Vietnamese - English).

### Strategy

- Messages MUST NOT be hardcoded.
- Messages MUST support i18n.
- Use message keys instead of raw text in business logic.
- Actual message resolution should depend on request locale (Accept-Language header).

---

### 6.1 Message Key Design

Example:

```java
public final class UserMessageKeys {

    private UserMessageKeys() {}

    public static final String REGISTER_SUCCESS = "user.register.success";
    public static final String USER_NOT_FOUND = "user.not-found";
}
```

---

### 6.2 messages.properties

```
# English
user.register.success=User registered successfully
user.not-found=User not found
```

### messages_vi.properties

```
# Vietnamese
user.register.success=Đăng ký tài khoản thành công
user.not-found=Không tìm thấy người dùng
```

---

### 6.3 Resolution Rule

- Locale must be resolved via Accept-Language header.
- Default locale: English.
- Service layer returns message KEY only.
- Global layer resolves key into localized message before sending response.

---

### 6.4 Response Structure with i18n

```json
{
  "status": 201,
  "code": "USER_REGISTER_SUCCESS",
  "message": "User registered successfully",
  "data": {}
}
```

OR (if Accept-Language: vi)

```json
{
  "status": 201,
  "code": "USER_REGISTER_SUCCESS",
  "message": "Đăng ký tài khoản thành công",
  "data": {}
}
```

---

### 6.5 Clean Rules for i18n

- Business layer must NEVER depend on language.
- No conditional language logic inside service.
- Only message keys flow through business logic.
- Translation happens at edge layer (presentation/global handler).

---

No inline hardcoded response messages in controller or ser

---

## 7. Configuration Rules

All environment values MUST come from configuration files.

Examples:

```yaml
app:
  api:
    base-path: /api/v1
  frontend-url: ${FRONTEND_URL}
```

Never hardcode:
- Frontend URL
- Base API URL
- Keycloak realm
- Secret values

---

## 8. Logging Rules

- Use Lombok @Slf4j per class.
- Use parameterized logging ("{}" placeholders).
- NEVER log password or secret.
- Log levels must be appropriate:
  - DEBUG → development logic
  - INFO → business flow
  - WARN → abnormal situation
  - ERROR → exceptions

Logging messages MAY be hardcoded.

---

## 9. Clean Architecture Enforcement

- Controllers: request validation + response mapping only
- Services: business logic only
- Infrastructure: external system communication only
- Entities: no logging, no framework dependency

---

## 10. Production Safety Rules

- Microservices must NOT expose ports publicly (except gateway).
- CORS must be handled at gateway level.
- Swagger should be exposed via gateway in production.
- All sensitive configs must come from environment variables.

---

## 11. Final Principles

- No magic strings
- No duplicate response classes
- No hardcoded endpoint paths
- No direct raw exception return
- Always consistent response structure
- Constants live close to domain usage

This document defines the coding standard for backend maintainability and scalability.

