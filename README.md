# Gozic Themes Platform

Kho giao diện website chuyên nghiệp, hiện đại, chuẩn SEO 2026 tích hợp sẵn hệ sinh thái bán hàng POS và quản lý kho.

## 🚀 Cấu trúc dự án

- `index.html`: Cổng Theme Store trung tâm với Left Menu Sidebar, bộ lọc ngành nghề đa dạng và Live Preview Modal.
- `assets/js/mobile-view.js`: **Thanh Chuẩn & Bộ Giả Lập Smartphone Tự Động (Mobile Simulator)**.
  - Tự động đóng khung giao diện smartphone cao cấp (iPhone 16 Pro, Plus, Galaxy, Tablet) kèm thanh công cụ chuẩn khi mở trên máy tính PC (Kho theme, đổi trang nhanh, chuyển bản PC, tạo mã QR quét xem trên điện thoại thật).
  - Khi mở trên điện thoại thật: Hiển thị 100% full-screen tự nhiên.
  - **Quy chuẩn nhúng cho mọi theme mới**: Chỉ cần thêm 1 dòng vào `<head>` của các file mobile:
    ```html
    <script src="../../assets/js/mobile-view.js" defer></script>
    ```
- `theme01/`: Theme EcoCook Smart Kitchen (Chuỗi thiết bị bếp & gia dụng thông minh)
  - `index.html`: Cổng lựa chọn xem bản PC / Mobile
  - `pc/`: Toàn bộ 7 trang giao diện chuẩn máy tính (`home.html`, `category.html`, `detail.html`, `cart.html`, `contact.html`, `news.html`, `post.html`)
  - `mobile/`: Toàn bộ 7 trang giao diện chuẩn di động tối ưu cảm ứng (`home.html`, `category.html`, `detail.html`, `cart.html`, `contact.html`, `news.html`, `post.html`)

## 🌐 Trải nghiệm trực tuyến

- Kho Theme Gozic: [https://themes.gozic.vn](https://themes.gozic.vn)
- Demo Mobile trên PC: [https://themes.gozic.vn/theme01/mobile/home.html](https://themes.gozic.vn/theme01/mobile/home.html)
