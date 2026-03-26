package com.eduspace.accountservice.model.dto.request.hoststaff;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InviteBranchManagerRequest {

    /** Email tài khoản đã đăng ký (Guest) trên hệ thống. */
    @NotBlank
    @Email
    private String email;

    /** ID chi nhánh (property) thuộc host — khớp room-service. */
    @NotNull
    private Long branchPropertyId;

    /** Optional: họ tên hiển thị khi tạo tài khoản mới. */
    private String fullName;

    /** Optional: mật khẩu tạm dùng cho lần đăng nhập đầu tiên. */
    private String temporaryPassword;
}
