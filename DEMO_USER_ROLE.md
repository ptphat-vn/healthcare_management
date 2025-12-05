# LUỒNG DEMO: HỆ THỐNG USER VÀ ROLE

## I. GIỚI THIỆU TỔNG QUAN (2 phút)

### 1.1. Mở đầu
"Xin chào mọi người, hôm nay tôi sẽ trình bày về hệ thống quản lý User và Role trong Healthcare Management System. Đây là một hệ thống quan trọng đảm bảo tính bảo mật và phân quyền truy cập trong ứng dụng quản lý y tế."

### 1.2. Kiến trúc hệ thống
"Hệ thống của chúng ta sử dụng mô hình **RBAC (Role-Based Access Control)** - kiểm soát truy cập dựa trên vai trò. Mỗi user sẽ được gán một role, và mỗi role sẽ có các privilege (quyền) cụ thể để thực hiện các thao tác trong hệ thống."

---

## II. DEMO CÁC ROLE TRONG HỆ THỐNG (5 phút)

### 2.1. Giới thiệu 5 Role chính

**"Hệ thống có 5 role chính:"**

1. **Administrator (Admin)**
   - Mô tả: "Quyền truy cập toàn bộ hệ thống"
   - Privilege đặc biệt: `*` (tất cả quyền)
   - "Admin có thể làm mọi thứ trong hệ thống, không bị giới hạn bởi bất kỳ quyền nào."

2. **Lab Manager (Quản lý phòng lab)**
   - Mô tả: "Quản lý phòng lab và người dùng"
   - Các quyền chính:
     - Quản lý role (xem, tạo, cập nhật)
     - Quản lý cấu hình hệ thống
     - Quản lý user (xem, sửa, xóa, khóa/mở khóa)
     - Quản lý comment
     - Review và chỉnh sửa test order
     - Quản lý hồ sơ y tế (xem, tạo, xóa, review, sửa)
     - Xem event logs
     - Quản lý thiết bị (instruments)
     - Quản lý reagent (hóa chất)

3. **Service (Dịch vụ/Bảo trì)**
   - Mô tả: "Vận hành và bảo trì"
   - Các quyền chính:
     - Xem và quản lý role (hạn chế)
     - Quản lý cấu hình hệ thống
     - Xem và kích hoạt/vô hiệu hóa thiết bị
     - Xem event logs
   - "Role này phù hợp cho nhân viên bảo trì, kỹ thuật viên cần quản lý thiết bị và cấu hình hệ thống."

4. **Lab User (Người dùng phòng lab)**
   - Mô tả: "Thực hiện xét nghiệm và quản lý mẫu"
   - Các quyền chính:
     - Quản lý role (xem, tạo, cập nhật)
     - Quản lý cấu hình
     - Quản lý user
     - Quản lý comment
     - Review và chỉnh sửa test order
     - Quản lý hồ sơ y tế đầy đủ
     - Xem event logs
     - Quản lý thiết bị và reagent đầy đủ
   - "Đây là role cho các kỹ thuật viên phòng lab thực hiện các xét nghiệm hàng ngày."

5. **Patient (Bệnh nhân)**
   - Mô tả: "Vai trò người dùng mặc định"
   - Quyền hạn chế:
     - `read_only`: Chỉ đọc
     - `view_medical_record`: Xem hồ sơ y tế của chính mình
   - "Bệnh nhân chỉ có thể xem thông tin của chính họ, không thể chỉnh sửa hay truy cập dữ liệu của người khác."

---

## III. DEMO CHI TIẾT CÁC PRIVILEGE (3 phút)

### 3.1. Nhóm quyền quản lý Role
"Trong hệ thống, chúng ta có các privilege để quản lý role:"
- `view_role`: Xem danh sách role
- `create_role`: Tạo role mới
- `update_role`: Cập nhật role
- `delete_role`: Xóa role

### 3.2. Nhóm quyền quản lý User
- `view_user`: Xem danh sách user
- `modify_user`: Chỉnh sửa thông tin user
- `delete_user`: Xóa user
- `lock_unlock_user`: Khóa/mở khóa tài khoản user

### 3.3. Nhóm quyền quản lý Cấu hình
- `view_config`: Xem cấu hình
- `create_config`: Tạo cấu hình mới
- `modify_config`: Chỉnh sửa cấu hình
- `delete_config`: Xóa cấu hình

### 3.4. Nhóm quyền Test Order
- `create_test_order`: Tạo đơn xét nghiệm
- `delete_test_order`: Xóa đơn xét nghiệm
- `review_test_order`: Review đơn xét nghiệm
- `modify_test_order`: Chỉnh sửa đơn xét nghiệm

### 3.5. Nhóm quyền Xét nghiệm máu
- `execute_blood_testing`: Thực hiện xét nghiệm máu

### 3.6. Nhóm quyền quản lý Thiết bị (Instruments)
- `view_instrument`: Xem thiết bị
- `create_instrument`: Tạo thiết bị mới
- `modify_instrument`: Chỉnh sửa thiết bị
- `delete_instrument`: Xóa thiết bị
- `activate_instrument`: Kích hoạt thiết bị
- `deactivate_instrument`: Vô hiệu hóa thiết bị

### 3.7. Nhóm quyền quản lý Reagent (Hóa chất)
- `view_reagent`: Xem reagent
- `create_reagent`: Tạo reagent mới
- `modify_reagent`: Chỉnh sửa reagent
- `delete_reagent`: Xóa reagent
- `view_reagent_supply_history`: Xem lịch sử nhập reagent
- `create_reagent_supply`: Tạo phiếu nhập reagent
- `view_reagent_usage_history`: Xem lịch sử sử dụng reagent
- `create_reagent_usage`: Tạo phiếu sử dụng reagent

### 3.8. Nhóm quyền quản lý Hồ sơ y tế
- `view_medical_record`: Xem hồ sơ y tế
- `create_medical_record`: Tạo hồ sơ y tế mới
- `delete_medical_record`: Xóa hồ sơ y tế
- `review_medical_record`: Review hồ sơ y tế
- `modify_medical_record`: Chỉnh sửa hồ sơ y tế

### 3.9. Nhóm quyền khác
- `add_comment`: Thêm comment
- `modify_comment`: Chỉnh sửa comment
- `delete_comment`: Xóa comment
- `view_event_logs`: Xem nhật ký sự kiện

---

## IV. DEMO LUỒNG HOẠT ĐỘNG (5 phút)

### 4.1. Đăng ký User mới
**"Bây giờ tôi sẽ demo luồng đăng ký user mới:"**

1. **User đăng ký:**
   - "Khi một user mới đăng ký, hệ thống sẽ tự động gán role mặc định là 'Patient'"
   - "Hệ thống tự động tạo Patient ID theo format P000001, P000002..."
   - "User cần cung cấp: Họ tên, Email, Số điện thoại, CMND/CCCD, Giới tính, Địa chỉ, Ngày sinh, Mật khẩu"

2. **Validation:**
   - "Hệ thống kiểm tra email, số điện thoại, CMND/CCCD không được trùng với user khác"
   - "Mật khẩu được hash bằng bcrypt trước khi lưu vào database"

### 4.2. Đăng nhập và Authentication
**"Luồng đăng nhập:"**

1. **User đăng nhập:**
   - "User nhập email và mật khẩu"
   - "Hệ thống kiểm tra:"
     - Email có tồn tại không
     - Mật khẩu có đúng không
     - Tài khoản có bị khóa (status = 2) không
     - Tài khoản có bị vô hiệu hóa (status = 0) không

2. **JWT Token:**
   - "Nếu đăng nhập thành công, hệ thống tạo 2 loại token:"
     - **Access Token**: Có thời hạn 30 phút, chứa thông tin user ID, email
     - **Refresh Token**: Có thời hạn 7 ngày, dùng để làm mới access token"

3. **Middleware Authentication:**
   - "Mỗi request được bảo vệ bởi authMiddleware"
   - "Middleware sẽ:"
     - Kiểm tra token trong header Authorization
     - Verify token
     - Lấy thông tin user từ database
     - Lấy role và privileges của user
     - Gắn thông tin vào request object: `authUserId`, `authUserRole`, `authUserPrivileges`"

### 4.3. Authorization và Privilege Check
**"Sau khi authentication, hệ thống kiểm tra quyền:"**

1. **Privilege Middleware:**
   - "Mỗi endpoint có thể yêu cầu một hoặc nhiều privilege cụ thể"
   - "Middleware sẽ kiểm tra:"
     - Nếu user là Admin (có privilege `*`) → cho phép tất cả
     - Nếu không phải Admin → kiểm tra user có privilege cần thiết không
   - "Nếu không có quyền → trả về lỗi 403 Forbidden"

2. **Ví dụ:**
   - "Endpoint tạo user mới yêu cầu privilege `modify_user`"
   - "Chỉ Lab Manager, Lab User, và Admin mới có quyền này"
   - "Patient sẽ bị từ chối truy cập"

### 4.4. Quản lý Role
**"Admin hoặc Lab Manager có thể quản lý role:"**

1. **Xem danh sách role:**
   - "Hiển thị tất cả role trong hệ thống"
   - "Mỗi role hiển thị: Tên, Mã code, Mô tả, Danh sách privileges"

2. **Tạo role mới:**
   - "Chọn các privilege cần thiết cho role mới"
   - "Đặt tên, mã code, mô tả cho role"

3. **Cập nhật role:**
   - "Có thể thêm/bớt privileges cho role"
   - "Cập nhật tên, mô tả"

4. **Xóa role:**
   - "Chỉ có thể xóa role không còn user nào sử dụng"

### 4.5. Quản lý User
**"Admin, Lab Manager, Lab User có thể quản lý user:"**

1. **Xem danh sách user:**
   - "Hiển thị danh sách user với thông tin: Patient ID, Họ tên, Email, Role, Trạng thái"

2. **Tạo user mới (bởi Admin):**
   - "Admin có thể tạo user mới và gán role ngay từ đầu"
   - "Khác với đăng ký thông thường, user này không cần xác thực email"

3. **Chỉnh sửa user:**
   - "Cập nhật thông tin cá nhân"
   - "Thay đổi role của user"
   - "Reset mật khẩu"

4. **Khóa/Mở khóa user:**
   - "Khóa tài khoản: status = 2 → user không thể đăng nhập"
   - "Mở khóa: status = 1 → user có thể đăng nhập bình thường"

5. **Xóa user:**
   - "Xóa user khỏi hệ thống (soft delete hoặc hard delete tùy thiết kế)"

---

## V. DEMO TÌNH HUỐNG THỰC TẾ (3 phút)

### 5.1. Tình huống 1: Bệnh nhân xem hồ sơ y tế
**"Giả sử một bệnh nhân đăng nhập vào hệ thống:"**

1. "Bệnh nhân đăng nhập với role 'Patient'"
2. "Bệnh nhân chỉ có thể:"
   - Xem hồ sơ y tế của chính mình
   - Xem các test order của chính mình
3. "Bệnh nhân KHÔNG thể:"
   - Xem hồ sơ của bệnh nhân khác
   - Tạo hoặc chỉnh sửa test order
   - Truy cập các chức năng quản lý

### 5.2. Tình huống 2: Lab User thực hiện xét nghiệm
**"Một kỹ thuật viên phòng lab đăng nhập:"**

1. "Lab User đăng nhập với role 'lab_user'"
2. "Lab User có thể:"
   - Xem và tạo test order
   - Review và chỉnh sửa test order
   - Thực hiện xét nghiệm máu (`execute_blood_testing`)
   - Quản lý reagent (nhập, sử dụng)
   - Quản lý thiết bị
   - Tạo và quản lý hồ sơ y tế
3. "Lab User có quyền rộng để thực hiện công việc hàng ngày trong phòng lab"

### 5.3. Tình huống 3: Lab Manager quản lý hệ thống
**"Một Lab Manager đăng nhập:"**

1. "Lab Manager có tất cả quyền của Lab User"
2. "Ngoài ra, Lab Manager có thể:"
   - Quản lý user (tạo, sửa, xóa, khóa/mở khóa)
   - Quản lý role (tạo, sửa, xóa role)
   - Xem event logs để theo dõi hoạt động hệ thống
   - Quản lý cấu hình hệ thống

### 5.4. Tình huống 4: Service bảo trì thiết bị
**"Nhân viên bảo trì đăng nhập:"**

1. "Service có quyền hạn chế hơn"
2. "Service có thể:"
   - Xem và quản lý thiết bị (kích hoạt/vô hiệu hóa)
   - Quản lý cấu hình hệ thống
   - Xem event logs
3. "Service KHÔNG thể:"
   - Quản lý user
   - Quản lý hồ sơ y tế
   - Thực hiện xét nghiệm

---

## VI. ĐIỂM NỔI BẬT CỦA HỆ THỐNG (2 phút)

### 6.1. Tính bảo mật
- "Mật khẩu được hash bằng bcrypt, không lưu plain text"
- "JWT token có thời hạn, giảm thiểu rủi ro nếu token bị lộ"
- "Mỗi request đều được kiểm tra authentication và authorization"

### 6.2. Tính linh hoạt
- "Hệ thống privilege-based cho phép tạo role tùy chỉnh với các quyền cụ thể"
- "Dễ dàng thêm privilege mới hoặc tạo role mới phù hợp với nhu cầu"
- "Admin có quyền tối cao, có thể truy cập mọi chức năng"

### 6.3. Tính mở rộng
- "Dễ dàng thêm role mới hoặc privilege mới khi hệ thống phát triển"
- "Cấu trúc code rõ ràng, tách biệt giữa authentication và authorization"

### 6.4. Audit và Logging
- "Hệ thống có event logs để theo dõi các hoạt động quan trọng"
- "Các thao tác quản lý user, role đều được ghi lại"

---

## VII. KẾT LUẬN VÀ Q&A (2 phút)

### 7.1. Tóm tắt
"Hệ thống User và Role của chúng ta cung cấp:"
- 5 role chính với các quyền hạn khác nhau
- Hệ thống privilege-based linh hoạt và mở rộng được
- Bảo mật cao với JWT authentication và RBAC authorization
- Phù hợp cho môi trường y tế cần kiểm soát truy cập chặt chẽ

### 7.2. Câu hỏi thường gặp

**Q: Làm thế nào để thêm role mới?**
A: Admin hoặc Lab Manager có thể tạo role mới thông qua giao diện quản lý role, chọn các privilege cần thiết cho role đó.

**Q: User có thể có nhiều role không?**
A: Hiện tại hệ thống thiết kế mỗi user chỉ có một role. Nếu cần nhiều role, có thể tạo role mới kết hợp các privilege từ nhiều role.

**Q: Làm thế nào để khôi phục quyền truy cập cho user bị khóa?**
A: Admin, Lab Manager, hoặc Lab User có quyền `lock_unlock_user` có thể mở khóa tài khoản thông qua chức năng quản lý user.

**Q: Privilege `*` có nghĩa là gì?**
A: Đây là privilege đặc biệt của Admin, cho phép truy cập tất cả các chức năng trong hệ thống mà không cần kiểm tra privilege cụ thể.

---

## VIII. HƯỚNG DẪN DEMO THỰC TẾ

### 8.1. Chuẩn bị
1. Đảm bảo hệ thống đang chạy
2. Chuẩn bị các tài khoản test cho từng role:
   - Admin account
   - Lab Manager account
   - Lab User account
   - Service account
   - Patient account

### 8.2. Thứ tự demo
1. **Đăng nhập với Patient** → Demo quyền hạn chế
2. **Đăng nhập với Lab User** → Demo quyền thực hiện xét nghiệm
3. **Đăng nhập với Lab Manager** → Demo quản lý user và role
4. **Đăng nhập với Admin** → Demo quyền tối cao

### 8.3. Các thao tác cần demo
- [ ] Đăng nhập với các role khác nhau
- [ ] Xem danh sách user và role
- [ ] Tạo user mới và gán role
- [ ] Thay đổi role của user
- [ ] Khóa/mở khóa user
- [ ] Tạo role mới với các privilege tùy chỉnh
- [ ] Demo truy cập bị từ chối khi không có quyền
- [ ] Xem event logs

---

**Tổng thời gian demo: ~20-25 phút**

**Lưu ý:** Điều chỉnh thời gian và nội dung demo phù hợp với thời gian được phân bổ và đối tượng người nghe.

