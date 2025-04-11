# Hệ thống quản lý Menu Nhà hàng API

Hệ thống API quản lý nhà hàng với các chức năng đăng nhập/đăng ký, xác thực OTP, quản lý danh mục, món ăn và đánh giá.

## Yêu cầu hệ thống

- Node.js (v14.x trở lên)
- MongoDB (v4.x trở lên)
- NPM (v6.x trở lên)

## Cài đặt

### 1. Clone dự án

```bash
git clone <repository-url>
cd DACK_NNPTUD_BE-new
```

### 2. Cài đặt các dependencies

```bash
npm install
```

### 3. Tạo file môi trường

Tạo file `.env` trong thư mục gốc của dự án với nội dung:

PORT=3000
MONGODB_URI=mongodb://localhost:27017/restaurant_management
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES=1d
OTP_SECRET=your_otp_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

### 4. Chạy ứng dụng

```bash
npm start
```

Hoặc chạy trong môi trường development:

```bash
npm run dev
```

## Cấu trúc dự án

```
├── public/              # Thư mục public (chứa uploads)
│   └── uploads/         # Chứa hình ảnh upload
├── src/                 # Mã nguồn
│   ├── config/          # Cấu hình database
│   ├── controllers/     # Xử lý request
│   ├── enums/           # Các enum
│   ├── imports/         # Import modules
│   ├── middlewares/     # Middlewares
│   ├── models/          # Models mongoose
│   ├── repositories/    # Repositories pattern
│   ├── routes/          # Routes API
│   ├── services/        # Business logic
│   └── app.js           # Entry point
├── .env                 # Environment variables
├── package.json
└── README.md
```

## Hướng dẫn sử dụng API với Postman

### Đăng ký tài khoản

1. **POST** `http://localhost:3000/api/auth/register`
2. Body (JSON):
   ```json
   {
     "name": "username",
     "email": "user@example.com",
     "password": "password123",
     "age": 25,
     "gender": "male"
   }
   ```
3. Nhấn Send để đăng ký

![Register API](https://i.imgur.com/example1.png)

### Đăng nhập (2 bước)

#### Bước 1: Gửi thông tin đăng nhập
1. **POST** `http://localhost:3000/api/auth/login`
2. Body (JSON):
   ```json
   {
     "name": "username",
     "password": "password123"
   }
   ```
3. Nhấn Send để nhận OTP

![Login API Step 1](https://i.imgur.com/example2.png)

#### Bước 2: Xác thực OTP
1. **POST** `http://localhost:3000/api/otp/verifyOTP`
2. Body (JSON):
   ```json
   {
     "otp": "123456"  // OTP bạn nhận được từ bước 1
   }
   ```
3. Nhấn Send để hoàn tất đăng nhập

![Login API Step 2](https://i.imgur.com/example3.png)

### Quản lý danh mục (Categories)

#### Lấy tất cả danh mục
- **GET** `http://localhost:3000/api/categories`

#### Thêm danh mục mới (yêu cầu quyền admin)
1. **POST** `http://localhost:3000/api/categories`
2. Headers:
   ```
   Cookie: token=your_jwt_token
   ```
3. Body (form-data):
   - name: Tên danh mục
   - description: Mô tả danh mục
   - image: Tệp hình ảnh (nếu có)

![Add Category API](https://i.imgur.com/example4.png)

#### Cập nhật danh mục (yêu cầu quyền admin)
1. **PUT** `http://localhost:3000/api/categories/:id`
2. Headers:
   ```
   Cookie: token=your_jwt_token
   ```
3. Body (form-data):
   - name: Tên danh mục
   - description: Mô tả danh mục
   - image: Tệp hình ảnh (nếu cần thay đổi)

#### Xóa danh mục (yêu cầu quyền admin)
1. **DELETE** `http://localhost:3000/api/categories/:id`
2. Headers:
   ```
   Cookie: token=your_jwt_token
   ```

### Quản lý món ăn (Menu Items)

#### Lấy tất cả món ăn
- **GET** `http://localhost:3000/api/menu-items`

#### Lấy món ăn theo danh mục
- **GET** `http://localhost:3000/api/menu-items/category/:categoryId`

#### Thêm món ăn mới (yêu cầu quyền admin)
1. **POST** `http://localhost:3000/api/menu-items`
2. Headers:
   ```
   Cookie: token=your_jwt_token
   ```
3. Body (form-data):
   - name: Tên món ăn
   - price: Giá (số)
   - description: Mô tả
   - detail: Chi tiết
   - category: ID của danh mục
   - image: Tệp hình ảnh (nếu có)

![Add MenuItem API](https://i.imgur.com/example5.png)

#### Cập nhật món ăn (yêu cầu quyền admin)
1. **PUT** `http://localhost:3000/api/menu-items/:id`
2. Headers:
   ```
   Cookie: token=your_jwt_token
   ```
3. Body (form-data - tương tự thêm món ăn)

#### Xóa món ăn (yêu cầu quyền admin)
1. **DELETE** `http://localhost:3000/api/menu-items/:id`
2. Headers:
   ```
   Cookie: token=your_jwt_token
   ```

### Quản lý đánh giá (Reviews)

#### Lấy đánh giá theo món ăn
- **GET** `http://localhost:3000/api/reviews/menu-item/:menuItemId`

#### Thêm đánh giá mới (yêu cầu đăng nhập)
1. **POST** `http://localhost:3000/api/reviews`
2. Headers:
   ```
   Cookie: token=your_jwt_token
   ```
3. Body (form-data):
   - menuItem: ID của món ăn
   - rating: Đánh giá (1-5)
   - comment: Nội dung đánh giá
   - images: Tệp hình ảnh (có thể chọn nhiều)

![Add Review API](https://i.imgur.com/example6.png)

#### Quản lý đánh giá (yêu cầu quyền admin)
- **GET** `http://localhost:3000/api/reviews/admin` - Xem tất cả đánh giá
- **GET** `http://localhost:3000/api/reviews/pending` - Xem các đánh giá chờ duyệt
- **PATCH** `http://localhost:3000/api/reviews/:id/status` - Cập nhật trạng thái (duyệt/từ chối)
  - Body (JSON):
    ```json
    {
      "status": "approved"  // hoặc "rejected"
    }
    ```
- **DELETE** `http://localhost:3000/api/reviews/:id` - Xóa đánh giá

## Lưu ý quan trọng

1. **Authentication:**
   - Token JWT được lưu trong cookie sau khi đăng nhập
   - Các API yêu cầu xác thực sẽ kiểm tra cookie `token`

2. **Admin Role:**
   - Để sử dụng các chức năng admin, cần đăng nhập với tài khoản có role `admin`
   - Có thể tạo tài khoản admin bằng cách đăng ký thông thường và cập nhật role trong database

3. **Upload Files:**
   - Hỗ trợ upload hình ảnh dạng JPG, PNG, GIF
   - Giới hạn kích thước file: 5MB

4. **Error Handling:**
   - API trả về các mã lỗi HTTP phù hợp (400, 401, 403, 404, 500, v.v.)
   - Response body chứa thông báo lỗi chi tiết

## Troubleshooting

### Vấn đề thường gặp

1. **Không kết nối được database**
   - Kiểm tra MongoDB đang chạy
   - Kiểm tra connection string trong file `.env`

2. **Lỗi xác thực**
   - Đảm bảo token được lưu trong cookie
   - Kiểm tra token còn hạn sử dụng

3. **Lỗi upload file**
   - Kiểm tra thư mục `public/uploads` có quyền ghi
   - Đảm bảo file không vượt quá 5MB



