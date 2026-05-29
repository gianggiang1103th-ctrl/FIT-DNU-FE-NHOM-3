# <p align="center">⚡ QuizMaster ⚡</p>

<p align="center">
  <strong>Hệ thống Ngân hàng Câu hỏi Trắc nghiệm & Luyện thi trực tuyến chuyên nghiệp</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Developed%20By-NHÓM%203--FIT--DNU-indigo?style=for-the-badge&logo=github" alt="FIT-DNU Group 3">
  <img src="https://img.shields.io/badge/JavaScript-ES6%2B--Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="Vanilla JS">
  <img src="https://img.shields.io/badge/Bootstrap-v5.3.3--CDN-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap 5">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-Custom-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/Fetch_API-Native-0078D4?style=flat-square" alt="Fetch API">
  <img src="https://img.shields.io/badge/UI--UX-Premium-FF6B6B?style=flat-square" alt="Premium UI">
  <img src="https://img.shields.io/badge/Theme-Light%20%2F%20Dark-orange?style=flat-square" alt="Light/Dark Theme">
</p>

---

## 🌟 Giới thiệu Dự án

**QuizMaster** là nền tảng thi trắc nghiệm trực tuyến cao cấp, mượt mà và tối ưu hóa trải nghiệm người dùng tối đa. Dự án được thiết kế dành cho hai đối tượng chính: **Học sinh** (luyện thi, xem lại bài làm) và **Quản trị viên** (quản lý ngân hàng đề thi, chỉnh sửa chủ đề, tạo admin mới). 

Dự án áp dụng các tiêu chuẩn thiết kế web hiện đại (Rich Aesthetics) bao gồm: hiệu ứng kính mờ (glassmorphism), vi chuyển động sinh động (micro-animations), và đồng bộ hóa tức thì với MockAPI trực tuyến.

> 📢 **Bản quyền thuộc về**: **Project: QuizMaster - Developed by NHÓM 3-FIT-DNU**

---

## 🗺️ Mục lục (Table of Contents)
- [✨ Các Tính năng Nổi bật](#-các-tính-năng-nổi-bật)
- [🛠️ Công nghệ Sử dụng & Quy định](#️-công-nghệ-sử-dụng--quy-định)
- [📁 Cấu trúc Thư mục Dự án](#-cấu-trúc-thư-mục-dự-án)
- [🗄️ Kiến trúc Dữ liệu (MockAPI)](#️-kiến-trúc-dữ-liệu-mockapi)
- [🔒 Hệ thống Bảo mật & Phân quyền](#-hệ-thống-bảo-mật--phân-quyền)
- [🚀 Hướng dẫn Cài đặt & Chạy](#-hướng-dẫn-cài-đặt--chạy)
- [👥 Đội ngũ Phát triển & Bản quyền](#-đội-ngũ-phát-triển--bản-quyền)

---

## ✨ Các Tính năng Nổi bật

### 1. Phân hệ Học sinh (Student Portal)
- [x] **Xáo trộn ngẫu nhiên kép (Double Shuffle)**: Tự động đảo lộn thứ tự các câu hỏi và cả thứ tự phương án lựa chọn (A, B, C, D) mỗi khi làm bài để chống gian lận.
- [x] **Đồng hồ đếm ngược sinh động**: Có thanh tiến trình co giãn và tự động đổi màu (Xanh lá -> Vàng -> Đỏ khẩn cấp nhấp nháy liên tục khi thời gian dưới 20%). Tự động nộp bài khi hết giờ.
- [x] **Question Navigator (Question Palette)**: Bảng điều hướng dạng ô số, cho phép nhảy nhanh tới câu bất kỳ và tự đổi màu khi đã chọn đáp án.
- [x] **Review Mode (Chế độ xem lại)**: Khóa toàn bộ lựa chọn sau khi nộp, đánh dấu màu **Xanh lá** cho đáp án đúng, **Đỏ** cho đáp án chọn sai, và **Xanh nét đứt** cho đáp án đúng bị bỏ lỡ. Hiển thị báo cáo điểm số chi tiết trên thang 10.

### 2. Phân hệ Quản trị (Admin Portal)
- [x] **Quản lý chủ đề thi**: Tạo mới hoàn toàn chủ đề thi (POST) hoặc Chỉnh sửa (PUT) Tên chủ đề, mô tả và giới hạn thời gian (giây) trực quan.
- [x] **Quản lý câu hỏi (CRUD)**: Thêm, sửa, xóa câu hỏi lồng trực tiếp bên trong chủ đề thông qua Modal Form chuyên nghiệp.
- [x] **Live Search (Tìm kiếm tức thời)**: Bộ lọc ký tự trực tiếp trên Client siêu tốc, tìm kiếm tức thì theo từ khóa trong câu hỏi hoặc phương án chọn mà không tốn băng thông gọi API.
- [x] **👑 Tạo quản trị viên nội bộ**: Cơ chế chỉ có tài khoản Admin đang đăng nhập mới được quyền tạo thêm tài khoản Admin mới.

### 3. Trải nghiệm UI/UX
- [x] **Dark Mode toàn diện**: Chuyển đổi giao diện Sáng/Tối mượt mà chỉ qua một nút nhấn.
- [x] **Responsive Grid 2x2**: 4 đáp án thi hiển thị gọn gàng trên **2 cột x 2 dòng** trên màn hình lớn, và tự co về 1 cột trên di động.
- [x] **Hiệu ứng trượt Fade-Up**: Các thành phần trượt nhẹ nhàng khi hiển thị tạo cảm giác cao cấp.
- [x] **#globalSpinner**: Lớp phủ mờ backdrop-filter blur quay logo xoay tròn đẹp mắt trong suốt quá trình Fetch API.

---

## 🛠️ Công nghệ Sử dụng & Quy định

Hệ thống được lập trình tuân thủ nghiêm ngặt các quy định công nghệ sau:
* **Mã nguồn**: 100% Vanilla JavaScript (ES6+), cấu trúc module rạch ròi, hướng tới hiệu năng thuần.
* **Giao diện**: Bootstrap 5 (CDN) kết hợp Vanilla CSS tùy biến nâng cao (không dùng Tailwind CSS).
* **Kết nối dữ liệu**: Fetch API nguyên bản của trình duyệt (không dùng Axios).
* **Thư viện cấm**: Tuyệt đối **KHÔNG** sử dụng React, Vue, Angular, TypeScript, Tailwind CSS, Axios, SweetAlert2.
* **Quy chuẩn mã nguồn**: Chú thích dòng chữ thương hiệu `"Project: QuizMaster - Developed by NHÓM 3-FIT-DNU"` ở đầu tất cả các file mã nguồn `.html`, `.css`, `.js`.

---

## 📁 Cấu trúc Thư mục Dự án

```text
QuizMaster/
│
├── index.html          # Trang chủ & Khu vực làm bài của Học sinh
├── admin.html          # Trang quản trị, CRUD câu hỏi, Live Search & Tạo Admin mới
│
├── css/
│   └── style.css       # CSS Variables, Dark Mode, Animations, Card Custom Radio & Grid 2x2
│
├── js/
│   ├── api.js          # Module kết nối Fetch API & Tự động bật/tắt Global Spinner
│   ├── utils.js        # Dark Mode toggler, sessionStorage, Fisher-Yates shuffle
│   ├── main.js         # Core logic thi cử, đếm ngược, tính điểm & Review Mode
│   └── admin.js        # Core logic quản trị, Phân quyền bảo mật, CRUD & Live Search
│
└── README.md           # Tài liệu hướng dẫn sử dụng chuyên nghiệp (Tệp này)
```

---

## 🗄️ Kiến trúc Dữ liệu (MockAPI)

Nhằm tối ưu hóa giới hạn nghiêm ngặt **2 Resources** của MockAPI Free, dự án áp dụng kiến trúc mảng lồng thông minh. Mọi thao tác Thêm, Sửa, Xóa câu hỏi sẽ được xử lý cục bộ trên mảng `questions` ở Client trước, sau đó gửi yêu cầu `PUT /topics/:id` để đồng bộ hóa đè lên MockAPI.

* **API Endpoint gốc**: `https://69f9a6d5c509a40d3aa2efcf.mockapi.io/api/v1`

### 1. Resource `/users` (Tài khoản người dùng)
<details>
<summary>📂 Nhấp vào đây để xem chi tiết Cấu trúc JSON của User</summary>

```json
{
  "id": "1",
  "username": "student1",
  "password": "password123",
  "fullName": "Nguyễn Văn A",
  "role": "student" // Hoặc 'admin'
}
```
</details>

### 2. Resource `/topics` (Chủ đề thi & Ngân hàng câu hỏi lồng)
<details>
<summary>📂 Nhấp vào đây để xem chi tiết Cấu trúc JSON của Topic</summary>

```json
{
  "id": "1",
  "name": "Lập trình Front-End nâng cao",
  "description": "Chủ đề bao quát kiến thức chuyên sâu về DOM, CSS Grid/Flexbox và Fetch API.",
  "timeLimit": 600, // Thời gian làm bài tính bằng giây
  "questions": [
    {
      "id": "q_1716893452112_432",
      "questionText": "Thuộc tính nào dùng để tạo bố cục lưới trong CSS3?",
      "options": [
        "A. display: flex",
        "B. display: grid",
        "C. display: block",
        "D. display: inline"
      ],
      "correctAnswer": "B. display: grid"
    }
  ]
}
```
</details>

---

## 🔒 Hệ thống Bảo mật & Phân quyền

Hệ thống được thiết kế với cơ chế phòng thủ nhiều lớp phía Client:
1. **Chặn truy cập trái phép tức thời (Zero Flickering Redirect)**: Một đoạn mã JavaScript được nhúng trực tiếp tại thẻ `<head>` của `admin.html`. Khi người dùng truy cập trực tiếp bằng đường dẫn, script này sẽ thực thi lập tức trước khi phân tích DOM. Nếu phát hiện chưa đăng nhập hoặc role không phải `admin`, hệ thống sẽ đưa ra cảnh báo và lập tức đẩy về `index.html` (không xảy ra hiện tượng lộ giao diện quản trị dù chỉ 1 mili giây).
2. **Khóa đăng ký tự thăng cấp**: Biểu mẫu Đăng ký ngoài trang chủ đã bị loại bỏ ô chọn role. Tất cả tài khoản tự tạo đều mặc định nhận quyền hạn `student`.
3. **Mô hình tạo Admin phân cấp**: Chỉ khi Quản trị viên thực tế đăng nhập an toàn vào phân hệ quản trị, họ mới có thể nhấn nút **`👑 Tạo Admin Mới`** để tạo thêm tài khoản admin cấp dưới.

---

## 🚀 Hướng dẫn Cài đặt & Chạy

1. **Tải mã nguồn**: Clone hoặc tải trực tiếp mã nguồn về máy tính.
   ```bash
   git clone https://github.com/your-username/QuizMaster.git
   ```
2. **Chạy ứng dụng**:
   - Mở trực tiếp tệp `index.html` bằng bất kỳ trình duyệt hiện đại nào.
   - *Khuyên dùng*: Sử dụng phần mở rộng **Live Server** trên VS Code hoặc cài đặt server tĩnh gọn nhẹ bằng Node.js để có trải nghiệm mượt mà nhất.
     ```bash
     npx serve .
     ```
3. **Trải nghiệm tài khoản mẫu**:
   - **Tài khoản Học sinh**: Bạn có thể đăng ký tài khoản học sinh bất kỳ trực tiếp trên màn hình chính.
   - **Tài khoản Quản trị viên (Admin)**: Đăng nhập bằng tài khoản admin mẫu có sẵn trên hệ thống của bạn, hoặc tự tạo tài khoản Admin mới thông qua nút chức năng tạo admin chuyên dụng trong trang quản trị.

---

## 👥 Đội ngũ Phát triển & Bản quyền

Dự án được hoàn thành xuất sắc và đồng bộ hóa tối ưu bởi **NHÓM 3-FIT-DNU**:
* **Trường**: Đại học Đại Nam (DNU)
* **Khoa**: Công nghệ Thông tin & Thiết kế Phần mềm (FIT)
* **Môn học**: Thiết kế & Lập trình Front-End nâng cao
* **Bản quyền**: © 2026 NHÓM 3-FIT-DNU. Mọi quyền được bảo lưu.

---
<p align="center">
  Developed with ❤️ by Group 3 FIT-DNU
</p>
