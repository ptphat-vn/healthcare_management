# LUỒNG DEMO: TECH STACK VÀ CÁCH CODE BACKEND

## I. GIỚI THIỆU TECH STACK (3 phút)

### 1.1. Ngôn ngữ và Framework chính
**"Backend của chúng ta được xây dựng với:"**

1. **Node.js + TypeScript**
   - "Sử dụng Node.js làm runtime environment"
   - "TypeScript để đảm bảo type safety và code quality"
   - "Target ES2020, module CommonJS"
   - "Path alias `~/*` để import dễ dàng hơn"

2. **Express.js 5.1.0**
   - "Framework web phổ biến cho Node.js"
   - "Xử lý HTTP requests và routing"
   - "Middleware-based architecture"

3. **MongoDB 6.20.0**
   - "NoSQL database linh hoạt"
   - "Native MongoDB driver (không dùng ODM như Mongoose)"
   - "Schema-less, phù hợp với dữ liệu y tế đa dạng"

### 1.2. Các thư viện quan trọng

**Authentication & Security:**
- `jsonwebtoken`: JWT authentication
- `bcryptjs`: Hash mật khẩu
- `cors`: Cross-Origin Resource Sharing

**Validation:**
- `zod`: Schema validation mạnh mẽ, type-safe

**File Upload:**
- `multer`: Xử lý file upload
- `cloudinary`: Lưu trữ và quản lý hình ảnh

**Real-time:**
- `socket.io`: WebSocket cho real-time communication
- `@sendgrid/mail`: Gửi email

**Documentation:**
- `swagger-jsdoc` + `swagger-ui-express`: API documentation tự động

**Testing:**
- `jest`: Unit testing và integration testing
- `supertest`: Testing HTTP endpoints

**Development:**
- `nodemon`: Auto-reload khi development
- `tsc-alias`: Resolve path aliases sau khi compile

---

## II. KIẾN TRÚC VÀ CẤU TRÚC THƯ MỤC (5 phút)

### 2.1. Cấu trúc thư mục
**"Backend được tổ chức theo mô hình Layered Architecture:"**

```
back-end/src/
├── configs/          # Cấu hình (database, CORS, Swagger, environment)
├── constants/        # Constants (messages, privileges)
├── controllers/     # Xử lý HTTP requests/responses
├── middlewares/     # Middleware (auth, privilege, upload)
├── models/          # Database models và collections
├── routes/          # Định nghĩa API routes
├── services/        # Business logic
├── sockets/         # Socket.io handlers
├── utils/           # Utility functions
├── validations/     # Request validation schemas
└── server.ts        # Entry point
```

### 2.2. Giải thích từng layer

**1. Configs (Cấu hình)**
- "Chứa các file cấu hình: MongoDB connection, CORS, Swagger, Environment variables"
- "Tách biệt cấu hình khỏi business logic"

**2. Constants (Hằng số)**
- "Định nghĩa các constant như error messages, privilege codes"
- "Dễ dàng maintain và thay đổi"

**3. Models (Mô hình dữ liệu)**
- "Định nghĩa TypeScript interfaces cho documents"
- "Export functions để lấy collections từ database"
- "Ví dụ: `getTestOrdersCollection()`, `getUsersCollection()`"

**4. Routes (Định tuyến)**
- "Định nghĩa các API endpoints"
- "Kết nối HTTP methods với controllers"
- "Áp dụng middlewares (auth, privilege, validation)"

**5. Controllers (Điều khiển)**
- "Xử lý HTTP request/response"
- "Gọi services để thực hiện business logic"
- "Trả về JSON response hoặc throw errors"

**6. Services (Dịch vụ)**
- "Chứa toàn bộ business logic"
- "Tương tác trực tiếp với database"
- "Có thể gọi các services khác"
- "Không phụ thuộc vào HTTP layer"

**7. Validations (Xác thực)**
- "Sử dụng Zod để validate request data"
- "Type-safe validation schemas"
- "Middleware để tự động validate trước khi vào controller"

**8. Middlewares (Trung gian)**
- "Xử lý cross-cutting concerns"
- "Auth middleware: verify JWT token"
- "Privilege middleware: check user permissions"
- "Upload middleware: handle file uploads"

---

## III. LUỒNG XỬ LÝ REQUEST (5 phút)

### 3.1. Request Flow Diagram
**"Khi một request đến server, nó đi qua các bước sau:"**

```
Client Request
    ↓
Express Router
    ↓
CORS Middleware (nếu cần)
    ↓
Auth Middleware (verify JWT)
    ↓
Privilege Middleware (check permissions)
    ↓
Validation Middleware (validate request body/params)
    ↓
Controller (extract data, call service)
    ↓
Service (business logic, database operations)
    ↓
Response (JSON) hoặc Error
```

### 3.2. Ví dụ cụ thể: Tạo Test Order

**"Hãy xem luồng xử lý khi tạo một test order:"**

#### Bước 1: Route Definition
```typescript
// routes/test-order.routes.ts
testOrderRouter.post(
  '/test-orders',
  authMiddleware,                    // Bước 1: Xác thực user
  privilegeMiddleware(['create_test_order']), // Bước 2: Kiểm tra quyền
  validateCreateTestOrder,           // Bước 3: Validate dữ liệu
  createTestOrderController          // Bước 4: Xử lý request
)
```

**"Route này định nghĩa:**
- Endpoint: `POST /api/test-orders`
- Yêu cầu authentication
- Yêu cầu privilege `create_test_order`
- Validate request body theo schema
- Gọi controller để xử lý"

#### Bước 2: Auth Middleware
```typescript
// middlewares/auth.middleware.ts
export const authMiddleware = async (req, res, next) => {
  // 1. Lấy token từ header Authorization
  const token = req.headers.authorization?.substring(7)
  
  // 2. Verify JWT token
  const payload = jwt.verify(token, secret)
  
  // 3. Lấy user từ database
  const user = await users.findOne({ _id: payload.sub })
  
  // 4. Lấy role và privileges
  const role = await roles.findOne({ _id: user.roleId })
  
  // 5. Gắn thông tin vào request
  req.authUserId = user._id
  req.authUserRole = role?.code
  req.authUserPrivileges = role?.privileges
  
  next() // Chuyển sang middleware tiếp theo
}
```

**"Auth middleware:**
- Kiểm tra token có hợp lệ không
- Lấy thông tin user và role
- Gắn vào request object để các layer sau sử dụng"

#### Bước 3: Privilege Middleware
```typescript
// middlewares/privilege.middleware.ts
export const privilegeMiddleware = (requiredPrivileges: string[]) => {
  return (req, res, next) => {
    const userPrivileges = req.authUserPrivileges || []
    
    // Admin có tất cả quyền
    if (isAdmin(userPrivileges)) {
      return next()
    }
    
    // Kiểm tra user có đủ quyền không
    const hasAllPrivileges = requiredPrivileges.every(privilege => 
      hasPrivilege(userPrivileges, privilege)
    )
    
    if (!hasAllPrivileges) {
      return res.status(403).json({ 
        message: 'You do not have permission'
      })
    }
    
    next()
  }
}
```

**"Privilege middleware:**
- Kiểm tra user có privilege cần thiết không
- Admin (privilege `*`) tự động pass
- Nếu không có quyền → trả về 403"

#### Bước 4: Validation Middleware
```typescript
// validations/test-order.validation.ts
const createTestOrderSchema = z.object({
  medicalRecordId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  requestedTests: z.array(z.enum(CBC_TESTS)).min(1)
})

export const validateCreateTestOrder = (req, res, next) => {
  try {
    createTestOrderSchema.parse(req.body)
    next()
  } catch (error) {
    res.status(400).json({ message: 'Validation error', errors: error.errors })
  }
}
```

**"Validation middleware:**
- Sử dụng Zod schema để validate
- Kiểm tra type, format, required fields
- Trả về lỗi chi tiết nếu validation fail"

#### Bước 5: Controller
```typescript
// controllers/test-order.controller.ts
export const createTestOrderController = async (req, res, next) => {
  try {
    const authUserId = req.authUserId // Lấy từ auth middleware
    
    // Gọi service để thực hiện business logic
    const data = await testOrderService.createTestOrder(
      req.body, 
      authUserId.toString()
    )
    
    // Trả về response
    return res.status(201).json({
      message: 'Test order created successfully',
      data
    })
  } catch (err) {
    next(err) // Chuyển error sang error handler
  }
}
```

**"Controller:**
- Extract data từ request
- Gọi service với data và user ID
- Trả về JSON response
- Catch errors và chuyển sang error handler"

#### Bước 6: Service (Business Logic)
```typescript
// services/testorder/test-order.service.ts
export async function createTestOrder(data, createdBy) {
  const testOrders = getTestOrdersCollection()
  const medicalRecords = getPatientMedicalRecordsCollection()
  
  // 1. Validate medical record exists
  const medicalRecord = await medicalRecords.findOne({ 
    _id: new ObjectId(data.medicalRecordId) 
  })
  if (!medicalRecord) {
    throw new HttpError(404, 'Medical record not found')
  }
  
  // 2. Create test order document
  const testOrder = {
    medicalRecordId: new ObjectId(data.medicalRecordId),
    requestedTests: data.requestedTests,
    status: 'pending',
    createdBy: new ObjectId(createdBy),
    createdAt: new Date(),
    updatedAt: new Date(),
    // ... other fields
  }
  
  // 3. Insert into database
  const result = await testOrders.insertOne(testOrder)
  
  // 4. Log event
  await logEvent('test_order_created', createdBy, result.insertedId)
  
  // 5. Return created data
  return {
    id: result.insertedId,
    ...testOrder
  }
}
```

**"Service:**
- Chứa toàn bộ business logic
- Tương tác trực tiếp với database
- Validate business rules
- Log events
- Throw HttpError nếu có lỗi"

#### Bước 7: Error Handling
```typescript
// server.ts
app.use((err, req, res, next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message })
  }
  console.error('Unhandled error:', err)
  return res.status(500).json({ message: 'Internal Server Error' })
})
```

**"Error handler:**
- Catch tất cả errors
- HttpError → trả về status code và message tương ứng
- Unknown errors → 500 Internal Server Error"

---

## IV. CÁCH ĐẶT ENDPOINT VÀ NAMING CONVENTION (4 phút)

### 4.1. RESTful API Design

**"Chúng ta tuân theo RESTful conventions:"**

#### HTTP Methods
- `GET`: Lấy dữ liệu (read)
- `POST`: Tạo mới (create)
- `PUT`: Cập nhật toàn bộ (update)
- `PATCH`: Cập nhật một phần (partial update)
- `DELETE`: Xóa (delete)

#### URL Structure
```
/api/{resource}                    # List/Create
/api/{resource}/:id                # Get/Update/Delete by ID
/api/{resource}/:id/{sub-resource}  # Nested resources
```

### 4.2. Ví dụ Endpoints

**Test Orders:**
```
GET    /api/test-orders              # Lấy danh sách
GET    /api/test-orders/:id          # Lấy chi tiết
POST   /api/test-orders              # Tạo mới
PUT    /api/test-orders/:id          # Cập nhật
DELETE /api/test-orders/:id          # Xóa
POST   /api/test-orders/:id/review   # Action: Review
POST   /api/test-orders/:id/comments # Nested: Thêm comment
```

**Users:**
```
GET    /api/admin/users              # Lấy danh sách (admin namespace)
PUT    /api/admin/users/update/:id   # Cập nhật user
PATCH  /api/admin/users/:id/status   # Cập nhật status
DELETE /api/admin/users/delete/:id   # Xóa user
POST   /api/admin/users/block/:id   # Action: Block user
PUT    /api/user/profile             # Cập nhật profile của chính mình
```

**Medical Records:**
```
GET    /api/patient-medical-records
GET    /api/patient-medical-records/:id
POST   /api/patient-medical-records
PUT    /api/patient-medical-records/:id
DELETE /api/patient-medical-records/:id
POST   /api/patient-medical-records/:id/review
```

### 4.3. Naming Conventions

**1. Routes:**
- "Sử dụng kebab-case: `test-orders`, `medical-records`"
- "Plural form cho resources: `users`, `roles`, `test-orders`"
- "Verb cho actions: `/review`, `/block`, `/run-with-instrument`"

**2. Files:**
- "Routes: `test-order.routes.ts` (singular + .routes)"
- "Controllers: `test-order.controller.ts`"
- "Services: `test-order.service.ts`"
- "Models: `test-order.model.ts`"
- "Validations: `test-order.validation.ts`"

**3. Functions:**
- "Controllers: `createTestOrderController`, `getAllTestOrdersController`"
- "Services: `createTestOrder`, `getAllTestOrders`, `updateTestOrder`"
- "CamelCase, descriptive names"

**4. Variables:**
- "camelCase: `authUserId`, `testOrderId`"
- "Constants: UPPER_SNAKE_CASE: `TEST_ORDERS_COLLECTION`"

---

## V. PATTERNS VÀ BEST PRACTICES (4 phút)

### 5.1. Separation of Concerns

**"Mỗi layer có trách nhiệm riêng:"**

- **Routes**: Chỉ định nghĩa endpoints và middleware chain
- **Controllers**: Chỉ xử lý HTTP (extract data, format response)
- **Services**: Chứa business logic, không biết về HTTP
- **Models**: Định nghĩa data structure và database access

**"Lợi ích:**
- Dễ test (test service không cần HTTP)
- Dễ maintain (thay đổi HTTP layer không ảnh hưởng business logic)
- Code reuse (service có thể dùng ở nhiều nơi)"

### 5.2. Error Handling Pattern

**"Sử dụng custom HttpError class:"**

```typescript
// models/error.model.ts
export class HttpError extends Error {
  constructor(
    public status: number,
    public message: string
  ) {
    super(message)
  }
}

// Usage trong service
throw new HttpError(404, 'User not found')
throw new HttpError(400, 'Invalid input')
throw new HttpError(403, 'Access denied')
```

**"Lợi ích:**
- Consistent error format
- Dễ dàng map error code với HTTP status
- Type-safe error handling"

### 5.3. Database Access Pattern

**"Mỗi model export collection getter:"**

```typescript
// models/test-order.model.ts
export const getTestOrdersCollection = (): Collection<TestOrderDocument> => {
  return getDb().collection<TestOrderDocument>(TEST_ORDERS_COLLECTION)
}

// Usage trong service
const testOrders = getTestOrdersCollection()
const result = await testOrders.insertOne(data)
```

**"Lợi ích:**
- Type-safe database operations
- Centralized collection names
- Dễ dàng mock trong testing"

### 5.4. Validation Pattern

**"Sử dụng Zod cho validation:"**

```typescript
// Schema definition
const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18).max(100)
})

// Validation middleware
export const validate = (schema: z.ZodSchema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body)
      next()
    } catch (error) {
      res.status(400).json({ errors: error.errors })
    }
  }
}
```

**"Lợi ích:**
- Type inference từ schema
- Rich validation rules
- Clear error messages"

### 5.5. Environment Configuration

**"Tách biệt config theo environment:"**

```typescript
// configs/environment.config.ts
export const env = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI!,
  JWT_SECRET: process.env.JWT_SECRET!,
  // ...
}
```

**"Lợi ích:**
- Type-safe environment variables
- Centralized config
- Easy to test với different configs"

---

## VI. DEMO CODE THỰC TẾ (3 phút)

### 6.1. Ví dụ hoàn chỉnh: Update Test Order

**"Hãy xem một endpoint hoàn chỉnh từ đầu đến cuối:"**

#### Route
```typescript
// routes/test-order.routes.ts
testOrderRouter.put(
  '/test-orders/:id',
  authMiddleware,
  privilegeMiddleware(['modify_test_order']),
  validateUpdateTestOrder,
  updateTestOrderController
)
```

#### Validation
```typescript
// validations/test-order.validation.ts
const updateTestOrderSchema = z.object({
  patientName: z.string().min(1).optional(),
  dateOfBirth: z.string().refine(isValidDate).optional(),
  gender: z.enum(['male', 'female']).optional(),
  requestedTests: z.array(z.enum(CBC_TESTS)).min(1).optional()
})
```

#### Controller
```typescript
// controllers/test-order.controller.ts
export const updateTestOrderController = async (req, res, next) => {
  try {
    const authUserId = req.authUserId
    const { id } = req.params
    
    // Chỉ cho phép update một số fields
    const allowedFields = ['patientName', 'dateOfBirth', 'gender', 'requestedTests']
    const updatePayload = {}
    for (const key of allowedFields) {
      if (key in req.body) {
        updatePayload[key] = req.body[key]
      }
    }
    
    const data = await testOrderService.updateTestOrder(
      id,
      updatePayload,
      authUserId.toString()
    )
    
    return res.status(200).json({
      message: 'Test order updated successfully',
      data
    })
  } catch (err) {
    next(err)
  }
}
```

#### Service
```typescript
// services/testorder/test-order.service.ts
export async function updateTestOrder(
  id: string,
  data: UpdateTestOrderData,
  updatedBy: string
) {
  const testOrders = getTestOrdersCollection()
  
  // Validate ID
  let objectId: ObjectId
  try {
    objectId = new ObjectId(id)
  } catch {
    throw new HttpError(400, 'Invalid test order ID')
  }
  
  // Check exists
  const existing = await testOrders.findOne({ _id: objectId })
  if (!existing) {
    throw new HttpError(404, 'Test order not found')
  }
  
  // Update
  const updateDoc = {
    $set: {
      ...data,
      updatedAt: new Date(),
      updatedBy: new ObjectId(updatedBy)
    }
  }
  
  await testOrders.updateOne({ _id: objectId }, updateDoc)
  
  // Return updated document
  const updated = await testOrders.findOne({ _id: objectId })
  return updated
}
```

**"Luồng hoàn chỉnh:**
1. Request đến → Route match
2. Auth middleware → Verify token
3. Privilege middleware → Check `modify_test_order`
4. Validation → Validate request body
5. Controller → Extract data, call service
6. Service → Business logic, database update
7. Response → Return updated data"

---

## VII. TESTING VÀ DOCUMENTATION (2 phút)

### 7.1. Testing

**"Sử dụng Jest cho testing:"**

```typescript
// services/testorder/test-order.service.test.ts
describe('createTestOrder', () => {
  it('should create test order successfully', async () => {
    const data = {
      medicalRecordId: 'valid-id',
      requestedTests: ['White Blood Cell Count']
    }
    const result = await createTestOrder(data, 'user-id')
    expect(result).toHaveProperty('id')
  })
})
```

**"Có thể test:**
- Services (unit tests)
- Controllers (integration tests với supertest)
- End-to-end API tests"

### 7.2. API Documentation

**"Swagger tự động generate từ code:"**

```typescript
/**
 * @swagger
 * /api/test-orders:
 *   post:
 *     summary: Create a new test order
 *     tags: [Test Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               medicalRecordId:
 *                 type: string
 *               requestedTests:
 *                 type: array
 */
```

**"Truy cập tại: `/api-docs`"**

---

## VIII. KẾT LUẬN (1 phút)

### 8.1. Tóm tắt

**"Backend của chúng ta:**
- ✅ Type-safe với TypeScript
- ✅ Layered architecture rõ ràng
- ✅ RESTful API design
- ✅ Security với JWT + RBAC
- ✅ Validation với Zod
- ✅ Error handling nhất quán
- ✅ Dễ test và maintain"

### 8.2. Điểm mạnh

1. **Separation of Concerns**: Mỗi layer có trách nhiệm riêng
2. **Type Safety**: TypeScript + Zod đảm bảo type safety
3. **Security**: Multi-layer security (auth + privilege)
4. **Scalability**: Dễ dàng thêm features mới
5. **Maintainability**: Code structure rõ ràng, dễ đọc

---

**Tổng thời gian demo: ~27 phút**

**Lưu ý:** Có thể điều chỉnh thời gian và độ sâu của từng phần tùy theo đối tượng người nghe.

