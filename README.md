# Gozic Themes Platform

Kho giao diện website chuyên nghiệp, hiện đại, chuẩn SEO 2026 tích hợp sẵn hệ sinh thái bán hàng POS và quản lý kho.

## 🚀 Cấu trúc dự án

- `index.html`: Cổng Theme Store trung tâm với Left Menu Sidebar, bộ lọc ngành nghề đa dạng và Live Preview Modal.
- `libs/theme-toolbar.js`: **Thư Viện Dùng Chung Tiêu Chuẩn (Universal Theme Toolbar & Device Simulator)**:
  - Tự động hoạt động cho cả 3 chế độ xem:
    1. **Bản PC (Desktop View)**: Docked topbar cố định ở đỉnh, hỗ trợ bộ tab segmented chuyển đổi tức thì sang Khung Mobile hoặc Mobile Full, đổi nhanh giữa 7 trang chuẩn, quét QR xem trên điện thoại thật và CTA tư vấn.
    2. **Khung Mobile (Smartphone Simulator)**: Đóng khung giao diện smartphone cao cấp (iPhone 16 Pro, Plus, Galaxy, Tablet) kèm thanh điều khiển chuẩn, tự động co giãn 100% vừa khít màn hình laptop không bị cắt đáy, nút xoay ngang/dọc, nút chuyển sang Bản PC, nút Mobile Full và tạo mã QR động.
    3. **Mobile Full (Toàn màn hình không khung trên PC)**: Mở bằng cờ `?raw=1`, docked topbar cố định ở đỉnh giúp switch ngược lại Bản PC hoặc Khung Mobile cực kỳ tiện lợi.
    4. **Thiết bị di động thật (< 768px)**: Tự động nhận diện và hiển thị 100% full-screen tự nhiên không khung.
  - **Quy chuẩn nhúng duy nhất cho mọi theme mới (cả PC và Mobile)**:
    ```html
    <script src="../../libs/theme-toolbar.js" data-theme-name="Tên Theme Của Bạn" defer></script>
    ```
- `assets/js/mobile-view.js`: Legacy wrapper tự động chuyển tiếp sang `libs/theme-toolbar.js` để tương thích ngược 100%.
- `theme01/`: Theme EcoCook Smart Kitchen (Chuỗi thiết bị bếp & gia dụng thông minh Châu Âu):
  - `index.html`: Cổng lựa chọn xem bản PC / Mobile
  - `pc/`: Toàn bộ 7 trang giao diện chuẩn máy tính (`home.html`, `category.html`, `detail.html`, `cart.html`, `contact.html`, `news.html`, `post.html`)
  - `mobile/`: Toàn bộ 7 trang giao diện chuẩn di động tối ưu cảm ứng (`home.html`, `category.html`, `detail.html`, `cart.html`, `contact.html`, `news.html`, `post.html`)

## 🌐 Trải nghiệm trực tuyến

- Kho Theme Gozic: [https://themes.gozic.vn](https://themes.gozic.vn)
- Demo PC View: [https://themes.gozic.vn/theme01/pc/home.html](https://themes.gozic.vn/theme01/pc/home.html)
- Demo Smartphone Simulator: [https://themes.gozic.vn/theme01/mobile/home.html](https://themes.gozic.vn/theme01/mobile/home.html)
- Demo Mobile Full: [https://themes.gozic.vn/theme01/mobile/home.html?raw=1](https://themes.gozic.vn/theme01/mobile/home.html?raw=1)
