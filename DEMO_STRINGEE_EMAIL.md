# LUỒNG DEMO: STRINGEE VÀ EMAIL SERVICE

## I. GIỚI THIỆU TỔNG QUAN (2 phút)

### 1.1. Stringee - Video Call Service
**"Stringee là một dịch vụ WebRTC của Việt Nam, cho phép tích hợp video call vào ứng dụng:"**

- **WebRTC Platform**: Hỗ trợ video/voice call real-time
- **SDK**: Có SDK cho cả web và mobile
- **Token-based Authentication**: Sử dụng JWT token để xác thực
- **Scalable**: Xử lý được nhiều cuộc gọi đồng thời

**"Trong hệ thống của chúng ta, Stringee được sử dụng để:**
- Video call giữa bác sĩ và bệnh nhân
- Tư vấn y tế từ xa
- Hội nghị trực tuyến"

### 1.2. Email Service
**"Hệ thống email hỗ trợ 2 phương thức gửi email:"**

1. **SendGrid** (Ưu tiên): Cloud email service, reliable và scalable
2. **SMTP** (Fallback): Gửi qua SMTP server thông thường

**"Email được sử dụng cho:**
- Gửi thông tin tài khoản mới
- Gửi mã OTP đặt lại mật khẩu
- Thông báo quan trọng từ hệ thống"

---

## II. STRINGEE INTEGRATION (5 phút)

### 2.1. Cấu hình Stringee

**"Stringee cần 2 thông tin cấu hình:"**

```typescript
// configs/environment.config.ts
STRINGEE_API_KEY_SID: string      // API Key SID từ Stringee dashboard
STRINGEE_API_KEY_SECRET: string   // API Key Secret từ Stringee dashboard
```

**"Các biến này được lấy từ Stringee dashboard sau khi đăng ký tài khoản."**

### 2.2. Service Layer - Generate Token

**"Backend cung cấp service để generate Stringee access token:"**

```typescript
// services/videocall/stringee.service.ts
export const generateStringeeAccessToken = (userId: string): string => {
  // 1. Validate userId
  if (!userId) {
    throw new HttpError(400, 'userId is required')
  }

  // 2. Lấy config từ environment
  const { apiKeySid, apiKeySecret } = getStringeeConfig()

  // 3. Tạo JWT payload
  const now = Math.floor(Date.now() / 1000)
  const exp = now + 24 * 60 * 60  // Token hết hạn sau 24 giờ

  const payload = {
    jti: randomUUID(),           // Unique token ID
    iss: apiKeySid,              // Issuer (API Key SID)
    exp,                         // Expiration time
    nbf: now,                    // Not before (có hiệu lực từ bây giờ)
    userId: String(userId)       // User ID của người dùng
  }

  // 4. Sign JWT với API Key Secret
  return jwt.sign(payload, apiKeySecret, {
    algorithm: 'HS256'
  })
}
```

**"Giải thích:**
- **jti (JWT ID)**: Unique identifier cho token, dùng `randomUUID()` để tạo
- **iss (Issuer)**: API Key SID từ Stringee
- **exp (Expiration)**: Token có hiệu lực 24 giờ
- **userId**: ID của user trong hệ thống, Stringee dùng để identify user
- **Algorithm**: HS256 (HMAC SHA-256)"

### 2.3. API Endpoint

**"Endpoint để lấy Stringee token:"**

```typescript
// routes/webrtc.routes.ts
router.get('/webrtc/token', authMiddleware, getStringeeTokenController)
```

**"Endpoint này:**
- Yêu cầu authentication (phải đăng nhập)
- Trả về Stringee access token cho user hiện tại"

#### Controller Implementation

```typescript
// controllers/webrtc.controller.ts
export const getStringeeTokenController = async (req, res, next) => {
  try {
    // 1. Lấy user ID từ auth middleware
    const authUserId = req.authUserId
    if (!authUserId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // 2. Generate token
    const token = generateStringeeAccessToken(String(authUserId))

    // 3. Trả về token
    return res.status(200).json({
      message: 'Stringee access token',
      data: { token }
    })
  } catch (err) {
    next(err)
  }
}
```

**"Luồng hoạt động:**
1. User đăng nhập → có JWT token
2. Frontend gọi `GET /api/webrtc/token` với JWT token
3. Backend verify JWT → lấy user ID
4. Backend generate Stringee token với user ID
5. Frontend nhận Stringee token → dùng để kết nối Stringee"

### 2.4. Frontend Integration

**"Frontend sử dụng token như sau:"**

```typescript
// Frontend flow
1. Fetch token từ backend: GET /api/webrtc/token
2. Khởi tạo StringeeClient với token
3. Connect đến Stringee server
4. Sử dụng StringeeCall2 để thực hiện video call
```

**"Ví dụ trong frontend:**
- `StringeeProvider`: Component quản lý Stringee client
- `VideoCallButton`: Button để bắt đầu cuộc gọi
- `VideoCallModal`: Modal hiển thị video call
- `IncomingCallModal`: Modal hiển thị khi có cuộc gọi đến"

### 2.5. Security Considerations

**"Bảo mật Stringee token:**
- ✅ Token chỉ được generate sau khi user đã authenticate
- ✅ Token có thời hạn 24 giờ
- ✅ Mỗi token có unique ID (jti)
- ✅ Token được sign bằng secret key, không thể giả mạo
- ✅ User ID được embed trong token để Stringee identify user"

---

## III. EMAIL SERVICE (6 phút)

### 3.1. Cấu hình Email

**"Hệ thống hỗ trợ 2 phương thức, ưu tiên SendGrid:"**

#### SendGrid Configuration
```typescript
SENDGRID_API_KEY: string           // API key từ SendGrid
SENDGRID_FROM_EMAIL: string        // Email người gửi
SENDGRID_FROM_NAME: string         // Tên hiển thị (mặc định: "FSA Healthcare")
```

#### SMTP Configuration (Fallback)
```typescript
SMTP_HOST: string                  // SMTP server host
SMTP_PORT: string                  // SMTP port (thường 587 hoặc 465)
SMTP_USER: string                  // SMTP username
SMTP_PASS: string                  // SMTP password
SMTP_FROM: string                  // Email người gửi
```

**"Hệ thống tự động chọn SendGrid nếu có API key, nếu không sẽ dùng SMTP."**

### 3.2. Email Service Implementation

**"Email service được implement trong `utils/email.ts`:"**

```typescript
// utils/email.ts
import nodemailer from 'nodemailer'
import sgMail from '@sendgrid/mail'

// 1. Kiểm tra có SendGrid không
const hasSendGrid = Boolean(env.SENDGRID_API_KEY)

if (hasSendGrid) {
  sgMail.setApiKey(env.SENDGRID_API_KEY)
}

// 2. Tạo SMTP transporter (fallback)
const smtpTransporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: false,  // true cho port 465, false cho port 587
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  }
})

// 3. Interface cho email params
interface SendMailParams {
  to: string        // Email người nhận
  subject: string   // Tiêu đề email
  text?: string     // Nội dung text (plain text)
  html?: string    // Nội dung HTML
}

// 4. Function gửi email
export async function sendMail({ to, subject, text, html }: SendMailParams) {
  // Ưu tiên SendGrid
  if (hasSendGrid) {
    const fromEmail = env.SENDGRID_FROM_EMAIL || env.SMTP_FROM
    const fromName = env.SENDGRID_FROM_NAME || 'FSA Healthcare'

    try {
      const [response] = await sgMail.send({
        to,
        from: {
          email: fromEmail,
          name: fromName
        },
        subject,
        text: text || '',
        html
      })
      return response
    } catch (error) {
      console.error('Error sending email via SendGrid:', error)
      throw error
    }
  }

  // Fallback: SMTP
  try {
    const info = await smtpTransporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      text,
      html
    })
    return info
  } catch (error) {
    console.error('Error sending email via SMTP:', error)
    throw error
  }
}
```

**"Giải thích:**
- **Priority-based**: SendGrid được ưu tiên, SMTP là fallback
- **Flexible**: Hỗ trợ cả text và HTML content
- **Error handling**: Catch và log errors, throw để caller xử lý
- **From address**: Tự động chọn từ SendGrid config hoặc SMTP config"

### 3.3. Use Cases trong Hệ thống

#### Use Case 1: Gửi thông tin tài khoản mới

**"Khi admin tạo user mới, hệ thống gửi email với thông tin đăng nhập:"**

```typescript
// services/auth/auth.service.ts
export async function createUserByAdmin(payload, performedBy) {
  // 1. Tạo user trong database
  const created = await register(payload)

  // 2. Gửi email với thông tin đăng nhập
  try {
    await sendMail({
      to: payload.email,
      subject: 'Tài khoản của bạn đã được tạo',
      text: `Xin chào ${payload.fullName},
      
Tài khoản của bạn đã được tạo trên hệ thống.

Thông tin đăng nhập:
- Email: ${payload.email}
- Mật khẩu: ${payload.password}

Vui lòng đăng nhập và đổi mật khẩu sau khi sử dụng lần đầu.`,
      html: `
        <p>Xin chào <b>${payload.fullName}</b>,</p>
        <p>Tài khoản của bạn đã được tạo trên hệ thống.</p>
        <p><b>Thông tin đăng nhập:</b><br/>
           Email: <code>${payload.email}</code><br/>
           Mật khẩu: <code>${payload.password}</code>
        </p>
        <p>Vui lòng đăng nhập và <b>đổi mật khẩu</b> sau khi sử dụng lần đầu.</p>
      `
    })
  } catch (err) {
    // Log error nhưng không fail việc tạo user
    console.error('Failed to send credentials email:', err)
  }

  return created
}
```

**"Điểm quan trọng:**
- Email được gửi trong try-catch
- Nếu gửi email fail, user vẫn được tạo (không block flow)
- Email chứa cả text và HTML version"

#### Use Case 2: Gửi mã OTP đặt lại mật khẩu

**"Khi user quên mật khẩu, hệ thống gửi mã OTP qua email:"**

```typescript
// services/auth/auth.service.ts
export async function forgotPassword(email: string) {
  // 1. Tìm user
  const user = await users.findOne({ email })
  if (!user) throw new HttpError(404, 'Email not found')

  // 2. Xóa các OTP cũ chưa dùng
  await resetTokens.deleteMany({ 
    userId: user._id, 
    used: false 
  })

  // 3. Tạo OTP mới (6 chữ số)
  const otp = crypto.randomInt(100000, 999999).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 phút

  // 4. Lưu OTP vào database
  await resetTokens.insertOne({
    userId: user._id,
    token: otp,
    expiresAt,
    createdAt: new Date(),
    used: false
  })

  // 5. Gửi email với OTP
  await sendMail({
    to: email,
    subject: 'Mã OTP đặt lại mật khẩu',
    text: `Mã OTP của bạn là: ${otp}. Có hiệu lực trong 10 phút.`,
    html: `
      <h2>Mã OTP của bạn là: <b>${otp}</b></h2>
      <p>Hiệu lực 10 phút.</p>
    `
  })

  return { email }
}
```

**"Bảo mật OTP:**
- OTP là 6 chữ số ngẫu nhiên
- Có thời hạn 10 phút
- Mỗi user chỉ có 1 OTP active tại một thời điểm
- OTP được lưu trong database với trạng thái `used`"

### 3.4. Error Handling

**"Email service có error handling tốt:"**

```typescript
// Trong service sử dụng email
try {
  await sendMail({ ... })
} catch (err) {
  // Log error nhưng không throw
  // Để không ảnh hưởng đến flow chính
  console.error('Failed to send email:', err)
}
```

**"Lý do:**
- Email là non-critical operation
- Nếu email fail, user vẫn có thể sử dụng hệ thống
- Log error để debug sau"

### 3.5. Best Practices

**"Khi sử dụng email service:"**

1. **Always use try-catch**: Email có thể fail, không nên block main flow
2. **Provide both text and HTML**: Một số email client chỉ hiển thị text
3. **Meaningful subject**: Subject line rõ ràng, dễ nhận biết
4. **Personalization**: Sử dụng tên user trong email
5. **Security**: Không gửi sensitive data qua email (trừ khi cần thiết như OTP)

---

## IV. DEMO LUỒNG HOẠT ĐỘNG (4 phút)

### 4.1. Demo Stringee Flow

**"Luồng hoàn chỉnh của video call:"**

```
1. User đăng nhập vào hệ thống
   ↓
2. Frontend gọi GET /api/webrtc/token
   - Header: Authorization: Bearer <JWT>
   ↓
3. Backend verify JWT → lấy user ID
   ↓
4. Backend generate Stringee token
   - JWT với payload: { userId, exp: 24h, ... }
   - Sign với Stringee API Key Secret
   ↓
5. Frontend nhận token
   ↓
6. Frontend khởi tạo StringeeClient
   - client.connect(token)
   ↓
7. StringeeClient authenticate với Stringee server
   ↓
8. User có thể thực hiện video call
   - Tạo StringeeCall2 object
   - Gọi makeCall()
   ↓
9. Cuộc gọi được thiết lập
   - Video/audio stream được truyền qua WebRTC
```

**"Demo thực tế:**
- Mở ứng dụng → Đăng nhập
- Click nút video call
- Hệ thống tự động lấy token và kết nối
- Cuộc gọi được thiết lập"

### 4.2. Demo Email Flow

**"Luồng gửi email khi tạo user mới:"**

```
1. Admin tạo user mới
   - POST /api/admin/users/create
   - Body: { fullName, email, password, ... }
   ↓
2. Backend tạo user trong database
   ↓
3. Backend gọi sendMail()
   ↓
4. Email service kiểm tra:
   - Có SENDGRID_API_KEY? → Dùng SendGrid
   - Không? → Dùng SMTP
   ↓
5. Gửi email
   - SendGrid: sgMail.send()
   - SMTP: smtpTransporter.sendMail()
   ↓
6. User nhận email với thông tin đăng nhập
```

**"Luồng quên mật khẩu:"**

```
1. User nhập email → POST /api/auth/forgot-password
   ↓
2. Backend tìm user
   ↓
3. Backend tạo OTP (6 chữ số)
   - Lưu vào database với expiresAt = 10 phút
   ↓
4. Backend gửi email với OTP
   ↓
5. User nhận email, nhập OTP
   ↓
6. User đặt mật khẩu mới với OTP
```

---

## V. CONFIGURATION VÀ DEPLOYMENT (2 phút)

### 5.1. Environment Variables

**"Các biến môi trường cần thiết:"**

```bash
# Stringee
STRINGEE_API_KEY_SID=your_api_key_sid
STRINGEE_API_KEY_SECRET=your_api_key_secret

# Email - SendGrid (ưu tiên)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=FSA Healthcare

# Email - SMTP (fallback)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=noreply@yourdomain.com
```

### 5.2. Setup Stringee

**"Các bước setup Stringee:**
1. Đăng ký tài khoản tại stringee.com
2. Tạo project mới
3. Lấy API Key SID và API Key Secret từ dashboard
4. Cấu hình vào environment variables"

### 5.3. Setup Email

**"Option 1: SendGrid (Khuyến nghị)**
1. Đăng ký tài khoản SendGrid
2. Tạo API key
3. Verify sender email
4. Cấu hình vào environment variables

**"Option 2: SMTP**
1. Sử dụng SMTP server có sẵn (Gmail, Outlook, ...)
2. Tạo app password nếu cần
3. Cấu hình vào environment variables"

---

## VI. TROUBLESHOOTING (2 phút)

### 6.1. Stringee Issues

**"Vấn đề thường gặp:"**

1. **Token không hợp lệ**
   - Kiểm tra API Key SID và Secret có đúng không
   - Kiểm tra token chưa hết hạn (24h)
   - Kiểm tra userId có được truyền đúng không

2. **Không kết nối được Stringee server**
   - Kiểm tra network connection
   - Kiểm tra Stringee service status
   - Kiểm tra token có được generate đúng format không

### 6.2. Email Issues

**"Vấn đề thường gặp:"**

1. **Email không được gửi (SendGrid)**
   - Kiểm tra API key có đúng không
   - Kiểm tra sender email đã được verify chưa
   - Kiểm tra SendGrid account có bị suspend không
   - Xem logs trong SendGrid dashboard

2. **Email không được gửi (SMTP)**
   - Kiểm tra SMTP credentials
   - Kiểm tra port có đúng không (587 cho TLS, 465 cho SSL)
   - Kiểm tra firewall có block port không
   - Thử test với telnet: `telnet smtp.gmail.com 587`

3. **Email vào spam**
   - Sử dụng SendGrid (có reputation tốt hơn)
   - Verify domain và setup SPF/DKIM records
   - Tránh spam keywords trong subject/content

---

## VII. KẾT LUẬN (1 phút)

### 7.1. Tóm tắt

**"Stringee và Email service:**
- ✅ Stringee: Video call real-time với token-based auth
- ✅ Email: Dual-mode (SendGrid + SMTP) với fallback tự động
- ✅ Security: Token có thời hạn, OTP có expiration
- ✅ Error handling: Graceful degradation, không block main flow
- ✅ Flexible: Dễ dàng switch giữa SendGrid và SMTP"

### 7.2. Best Practices

1. **Stringee:**
   - Luôn verify user trước khi generate token
   - Token có thời hạn hợp lý (24h)
   - Log token generation để audit

2. **Email:**
   - Luôn có fallback mechanism
   - Don't block main flow nếu email fail
   - Log email sending để debug
   - Use HTML + text format

---

**Tổng thời gian demo: ~22 phút**

**Lưu ý:** Có thể điều chỉnh thời gian và độ sâu của từng phần tùy theo đối tượng người nghe.

