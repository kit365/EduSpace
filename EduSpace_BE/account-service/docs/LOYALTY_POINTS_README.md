# Hệ thống Điểm thưởng (Loyalty / Points)

Ba phần **Point Earning Rules**, **Reward Catalog** và **Loyalty Config** đều nằm trong cùng một module "điểm thưởng" và đều xoay quanh **điểm (points)**, nên nhìn có vẻ "same same". Tài liệu này giải thích **vì sao chúng giống nhau** (cùng domain) và **vì sao lại tách thành 3 thứ** (khác vai trò).

---

## Tại sao "same same"?

Cả ba đều thuộc **một luồng giá trị**:

- User **kiếm điểm** (earn) → **giữ điểm** (balance) → **đổi điểm** lấy quà hoặc quy đổi ra tiền.

Nên về mặt product/UX chúng được gom chung một chỗ (trang **Điểm thưởng & Quà** trong admin), và trong code cũng cùng service (account-service), cùng nhóm API `/api/v1/points/**`, `/api/v1/rewards/**`. Đó là lý do chúng "same same": **cùng domain điểm thưởng**.

---

## Tại sao lại tách ba bảng / ba khái niệm?

Mỗi phần đảm nhiệm **một vai trò** khác nhau trong chuỗi đó:

| Phần | Bảng / Config | Vai trò | Ví dụ |
|------|----------------|--------|--------|
| **Quy tắc cộng điểm** | `point_earning_rules` | Định nghĩa **làm gì thì được +bao nhiêu điểm** | Hoàn thành booking → +50; Viết review → +10 |
| **Catalog quà** | `reward_catalog` | Định nghĩa **đổi bao nhiêu điểm lấy quà gì** (giá bằng điểm) | Voucher 100k = 1000 điểm; 1 giờ free phòng = 800 điểm |
| **Tỉ lệ quy đổi tiền** | `loyalty_config` | Định nghĩa **1 điểm tương đương bao nhiêu VND** (dùng để tính tiền ↔ điểm) | 1 điểm = 100 VND |

- **Earning rules**: nhiều dòng, CRUD thường xuyên, gắn với từng "hành động" trong hệ thống.
- **Reward catalog**: nhiều dòng, mỗi dòng là một "mặt hàng quà" với giá bằng điểm.
- **Loyalty config**: **một dòng** (config toàn hệ thống), ít đổi, dùng cho tính toán tài chính (tiền ↔ điểm).

Tách riêng giúp:

- Dễ mở rộng (thêm rule, thêm quà) mà không đụng config tỉ lệ tiền.
- Phân quyền / audit khác nhau (ví dụ chỉ admin mới sửa conversion rate).
- Code và DB rõ ràng: "quy tắc cộng điểm" ≠ "danh mục quà" ≠ "tỉ lệ điểm–tiền".

---

## Quan hệ giữa ba phần

```
[ Hành động user ]  --(point_earning_rules)-->  [ +điểm ]  -->  [ Số dư điểm ]
                                                                      |
                                                                      v
[ loyalty_config ]  <-- 1 điểm = X VND  -->  [ Quy đổi tiền ↔ điểm ]
                                                                      |
                                                                      v
[ reward_catalog ]  <-- points_required -->  [ Đổi điểm lấy quà / voucher ]
```

- **Earning rules** trả lời: "Làm X thì được +Y điểm."
- **Reward catalog** trả lời: "Muốn quà Z thì tốn W điểm."
- **Loyalty config** trả lời: "1 điểm = bao nhiêu VND?" (dùng khi tính tiền từ điểm hoặc điểm từ tiền).

---

## Mapping: Tạo xong thì gắn thế nào?

### 1. Point Earning Rule (action name + điểm)

- Trong admin bạn chỉ **tạo định nghĩa**: ví dụ action `COMPLETE_BOOKING` = +50 điểm.
- **“Mapping”** (khi nào thì cộng điểm) **không làm trong UI**, mà làm **trong code**:
  - Ở chỗ nghiệp vụ tương ứng (ví dụ: booking service khi “hoàn thành đặt phòng”), gọi API hoặc service nội bộ: “cộng điểm cho user X, action `COMPLETE_BOOKING`”.
  - Account-service (hoặc service điểm) sẽ tìm rule theo `action_name`, lấy `points_earned` rồi cộng vào balance và ghi transaction.
- Nếu muốn **không chỉnh tay code** mà cấu hình “sự kiện nào → rule nào” thì cần thiết kế thêm (bảng event/trigger → rule_id) và UI tương ứng; hiện tại chưa có.

### 2. Role – Permission

- DB đã có bảng `roles_permissions` (role_id, permission_id); entity Role có ManyToMany với Permission.
- **Mapping hiện tại**: chỉ được gán trong **migration** (V5): SUPER_ADMIN có hết permission, ADMIN có một subset cố định.
- **Chưa có**: API PUT/PATCH “cập nhật danh sách permission của role” và UI trong admin để chọn/bỏ từng permission cho từng role.
- Để “tạo role/permission rồi mapping” không chỉnh tay: cần thêm API (ví dụ `PUT /admin/roles/:id/permissions` với body `{ permissionIds: [...] }`) và màn “Chỉnh quyền” cho role (ví dụ danh sách checkbox permission).

---

## Tóm tắt

- **Same same** vì cùng là **hệ thống điểm thưởng**: cùng module, cùng trang quản lý, cùng xoay quanh "điểm".
- **Khác nhau** vì mỗi thứ một nhiệm vụ: **quy tắc cộng điểm** (earn), **danh mục quà** (redeem), **tỉ lệ điểm–tiền** (convert). Tách bảng và tách API để dễ bảo trì và mở rộng.
