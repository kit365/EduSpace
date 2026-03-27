# Admin – Cấu trúc thư mục

- **Pages** nằm **trong từng feature**: `features/<feature>/pages/<Page>.tsx`
- **Router** (`routes/index.tsx`) chỉ import từ features, ví dụ:
  - `UserManagementPage`, `RoleManagementPage` từ `../features/user-management`
  - `HostManagementPage` từ `../features/host-management`
  - v.v.
- Không đặt page ở `admin/pages/` để tránh trùng lặp và conflict với feature.

Mỗi feature thường có: `pages/`, `components/`, `hooks/`, `services/`, `index.ts` (re-export).
