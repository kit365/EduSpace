# Rooms flow theo role USER & HOST (hiện tại)

## 0) Tổng quan dữ liệu & các “trạng thái” chính

### 0.1. `approvalStatus` (duyệt hiển thị với khách)
- Nằm trong `RoomEntity.approvalStatus`: `PENDING | APPROVED | REJECTED`.
- Backend **public listing** chỉ trả về phòng có `approvalStatus = APPROVED`.
  - Cụ thể: `RoomSpecification.hasFilters()` luôn thêm predicate `approvalStatus == "APPROVED"`.

### 0.2. `pendingEditStatus` (chờ admin duyệt chỉnh sửa)
- Nằm trong `RoomEntity.pendingEditStatus`: `NONE | PENDING | APPROVED | REJECTED` (hiện FE đang dùng key `"PENDING"`).
- Khi host gửi chỉnh sửa “chờ duyệt”, BE sẽ lưu `pendingEditPayload` + đặt `pendingEditStatus = "PENDING"`.
- Admin/portal gọi `approvePendingEdit` hoặc `rejectPendingEdit` để chấp nhận/từ chối.

### 0.3. `status` (trạng thái vận hành dashboard host)
- Nằm trong `RoomEntity.status` (enum `RoomStatus`): `READY | IN_USE | CLEANING | MAINTENANCE` (+ các legacy `ACTIVE | INACTIVE`).
- FE quy ước hiển thị & lọc “đang mở/đang đóng cho thuê” bằng:
  - `isRoomOpenForBooking(status)` = `ACTIVE` hoặc `READY`.
  - `toOperationalStatus(raw)` map:
    - `ACTIVE` -> `READY`
    - `INACTIVE` -> `MAINTENANCE`

### 0.4. `schedules` (giờ mở/đóng theo từng ngày)
- Nằm trong `RoomScheduleEntity`: 7 bản ghi cho `dayOfWeek` từ **2..8** (Thứ 2..Chủ nhật).
- Mỗi schedule có:
  - `isOpen`
  - `openTime` / `closeTime` (nếu `isOpen=true`)
- Khi host tạo phòng mới:
  - BE seed mặc định 7 ngày thông qua `roomScheduleService.seedDefaultsForNewRoom()`.

### 0.5. `room_blocks` (khóa bảo trì theo thời gian thực)
- Nằm ở `room_block` (BE endpoints ở `RoomBlockController`).
- FE tính “effective operational status” theo thời điểm hiện tại:
  - Nếu có `room_block` type `MAINTENANCE` đang active tại thời điểm `now` -> forced `effective = MAINTENANCE` bất kể `room.status`.

---

## 1) Role USER: luồng “xem phòng & chọn giờ để đặt”

## 1.1. USER tìm kiếm / list phòng công khai

### Backend (public room listing)
- Endpoint (public):
  - `GET /rooms/public/rooms`
- Bộ lọc phía backend:
  - `RoomSpecification.hasFilters()` **luôn** lọc:
    - `deletedAt IS NULL`
    - `isActive = true`
    - `approvalStatus = "APPROVED"`
- Các filter FE gửi sang gồm (tùy UI):
  - keyword, categorySlug, min/max capacity, min/max price, amenityIds, districtCode, page/size/sort...

### Frontend (SpaceService)
- FE gom dữ liệu `RoomDto` + `PropertyDto` -> `Space`.
- FE còn lọc bổ sung:
  - `r.approvalStatus === "APPROVED"`
  - `isRoomOpenForBooking(r.status)` (ACTIVE/READY)
  - nếu người dùng chọn khoảng thời gian (`timeStart/timeEnd`) thì filter tiếp theo schedule:
    - tìm schedule theo `dayOfWeek`
    - schedule phải `isOpen`
    - so sánh `openTime/closeTime` (substring HH:mm) để đảm bảo khoảng thời gian nằm trong khung giờ mở.

## 1.2. USER xem chi tiết phòng
- Route FE:
  - `/...` theo `spaceRef` (slug hoặc id)
- FE gọi:
  - `spaceService.getSpaceDetails(ref)`
  - backend sử dụng `roomApiService.getByRef()` -> `RoomController.getByRef()`:
    - Nếu `ref` là số -> `getRoomById`
    - Nếu không -> `getRoomBySlug`
- Lúc trả về, BE `RoomServiceImpl.mapToResponse()` gắn thêm:
  - `schedules = roomScheduleService.listByRoomId(roomId)`

## 1.3. USER chọn giờ để đặt (BookingPanel)
- UI dùng `BookingPanel` với `space.schedules`.
- Dòng logic chính:
  - Tính `dayOfWeek` (FE đang map JS day => dayOfWeek backend dùng 2..8)
  - Determine đóng/mở theo:
    - `is24_7` (nếu bật thì bỏ qua open/close)
    - nếu không:
      - schedule tồn tại
      - schedule `isOpen=true`
      - validate `startTime >= openTime` và `endTime <= closeTime`
  - `availableHours` được tạo từ `openHour..closeHour`.
- Khi user bấm continue:
  - FE điều hướng `/checkout` với bookingDetails (date/startTime/endTime/guests/price...).

---

## 2) Role HOST: luồng “đăng phòng, chỉnh sửa, duyệt, và quản lý trạng thái”

## 2.1. HOST có quyền quản lý phòng khi nào?
Trên FE (portal):
- `isHostPartner = profile?.role === 'host'`
- `canManageRooms = isHostPartner || hostApp?.status === 'APPROVED'`
- Nếu `!canManageRooms` thì các trang host sẽ:
  - chặn không cho tải/cập nhật danh sách phòng
  - hiển thị CTA đi đăng ký đối tác hoặc đợi duyệt.

## 2.2. HOST xem danh sách phòng của mình
- Trang FE: `/rental/spaces` (component `SpacesPage`)
- FE load:
  - `roomApiService.getAll({ ownerId: profile.id })`
- Backend:
  - `RoomController.getAll()`:
    - nếu truyền `ownerId` thì gọi `roomService.getRoomsByOwnerId(ownerId)`
- Lưu ý:
  - `RoomServiceImpl.getRoomsByOwnerId(ownerId)` chỉ trả về phòng của property có `property.ownerId = ownerId`.

## 2.3. HOST đăng phòng mới (publish lần đầu)

### FE
- Trong `SpacePublishFlow` khi `isEdit=false`:
  - gọi `hostService.publishSpace(formData)`

### FE -> BE API
- `hostService.publishSpace()`:
  - chuẩn bị payload `RoomCreateRequest` từ form
  - gọi `roomApiService.create({ ...approvalStatus: "PENDING" })`
  - gọi `roomApiService.putSchedules(created.id, ownerId, weeklySchedules)`

### Backend behavior
- `RoomServiceImpl.create()`:
  - set workflow status mặc định:
    - `room.status = READY`
    - `room.approvalStatus = PENDING`
    - `room.isActive = true`
  - seed schedules mặc định qua `roomScheduleService.seedDefaultsForNewRoom(saved.id)`
- Sau đó FE gọi `putSchedules`:
  - `RoomController.replaceSchedules()` -> `roomScheduleService.replaceSchedules(roomId, ownerId, items)`
  - `replaceSchedules()` **chặn quyền** (backend-side):
    - `ownerId` phải khớp `room.property.ownerId`
    - validate đủ 7 items, dayOfWeek hợp lệ, open/close hợp lệ.

## 2.4. HOST chỉnh sửa phòng
Hiện FE đang có 2 chế độ submit khi host sửa:

### (A) Edit mode “direct” (cập nhật và đặt lại workflow duyệt lần đầu)
- FE gọi `hostService.updateRoomBeforeApproval()`:
  - `roomApiService.update(roomId, { approvalStatus: "PENDING", ... })`
  - `roomApiService.putSchedules(...)`

### (B) Edit mode “pending” (gửi payload chờ admin duyệt)
- FE gọi `hostService.submitRoomEdit()`:
  - `roomApiService.submitPendingEdit(roomId, payload, ownerId)`
- Backend:
  - `RoomServiceImpl.submitPendingEdit(roomId, request, ownerId)`:
    - kiểm tra `ownerId` không null và phải khớp `room.property.ownerId` (nếu không -> `FORBIDDEN`)
    - nếu `room.approvalStatus` đang `PENDING` -> `ROOM_EDIT_NOT_ALLOWED`
    - set:
      - `pendingEditPayload = <json>`
      - `pendingEditStatus = "PENDING"`

## 2.5. Admin duyệt phòng / duyệt chỉnh sửa (moderation)
Trong admin portal (FE `VerificationPage`):

### Approve pending edit
- Nếu `room.pendingEditStatus === "PENDING"`:
  - `roomApiService.approvePendingEdit(room.id)`
- Backend:
  - `RoomServiceImpl.approvePendingEdit(roomId)`:
    - bắt buộc `pendingEditStatus == "PENDING"` và payload không null/blank
    - parse payload thành `RoomRequest`
    - xóa pending fields
    - set `req.approvalStatus = APPROVED`
    - gọi `update(roomId, req)`

### Reject pending edit
- Nếu `room.pendingEditStatus === "PENDING"`:
  - `roomApiService.rejectPendingEdit(room.id, rejectionNote)`
- Backend:
  - `RoomServiceImpl.rejectPendingEdit(roomId, rejectionNote)`:
    - xóa payload/pending status
    - lưu rejection note
    - phòng giữ dữ liệu hiện tại (không áp payload chờ)

## 2.6. HOST quản lý trạng thái vận hành (Ready/In_use/Cleaning/Maintenance)

### FE load
- Trang FE: `/rental/room-status` (component `RoomStatusPage`)
- Load song song:
  - `roomApiService.getAll({ ownerId })`
  - `roomBlockService.listAll()`
- Lọc loại REJECTED:
  - `roomsOnStatusPage = rooms.filter(r => r.approvalStatus !== "REJECTED")`

### FE tính “effective operational status”
- Dựa trên:
  - `getEffectiveOperationalStatus(room, blocks, nowMs)`
  - rule: có maintenance block active -> forced `MAINTENANCE`

### FE cập nhật status
- Khi host bấm đổi:
  - `roomApiService.patchStatus(roomId, newStatus)`
- Backend:
  - `RoomController.patchStatus()` -> `roomService.updateStatus(id, status)`
  - BE chỉ set `room.status = status.name()` và save (không enforce thêm schedule/blocks ở backend side).

---

## 3) Gợi ý quan trọng cho logic booking sắp tới (dựa trên luồng hiện tại)

Nếu bạn định implement booking ở `booking-service`, các điều kiện “phòng có thể đặt” hiện đang được model hóa ở 2 lớp:

1. **Backend (public listing) đã lọc**:
   - `approvalStatus = APPROVED`
   - `isActive = true`
   - `deletedAt IS NULL`

2. **Frontend (BookingPanel + SpaceService) đã lọc theo thời gian**:
   - chỉ khi `isRoomOpenForBooking(room.status)` (ACTIVE/READY)
   - schedule ngày đó phải `isOpen` và khoảng `[startTime,endTime]` nằm trong `[openTime,closeTime]`

3. **Maintenance khóa theo room_blocks**:
   - FE dashboard “effective status” ưu tiên maintenance block đang active.
   - Hiện tại logic booking vẫn đang dùng schedule open/close (ở `BookingPanel`) và chưa thấy nơi nào ở FE/BE đảm bảo “maintenance block active -> chặn booking”.

=> Khi làm booking backend, bạn nên cân nhắc đồng bộ rule:
- Chỉ cho đặt nếu `approvalStatus=APPROVED` và `isActive=true`
- Chỉ cho đặt nếu `status` thuộc open-for-booking (ACTIVE/READY hoặc mapping READY)
- Chỉ cho đặt nếu schedule ngày tương ứng `isOpen` và khung giờ bao phủ interval
- Và cần cân nhắc thêm rule “maintenance block active” (tương tự dashboard) để tránh trường hợp schedule vẫn open nhưng đang bị maintenance.

