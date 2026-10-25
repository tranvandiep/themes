/**
 * Gozic Mobile Theme Viewer & Standard Topbar (Thanh Chuẩn Mobile)
 * Tự động mô phỏng giao diện điện thoại (Smartphone Simulator) khi người dùng mở trang Mobile trên PC Desktop.
 * - Tự động phát hiện màn hình PC (>= 768px) để đóng khung thiết bị kèm thanh điều khiển chuẩn.
 * - Tự động co giãn (auto-scale) để vừa vặn trọn vẹn 100% màn hình laptop/PC, không bị cắt đáy.
 * - Khi mở trên thiết bị di động thật (< 768px): Hiển thị 100% full-screen tự nhiên, không khung.
 * - Mọi theme mới chỉ cần nhúng 1 dòng: <script src="../../assets/js/mobile-view.js" defer></script>
 */
(function () {
  'use strict';

  // 1. Kiểm tra điều kiện:
  // - Nếu đã nằm trong iframe (ví dụ đang được nhúng trong modal preview hoặc simulator khác): không lặp lại
  if (window.self !== window.top) return;

  var currentUrl = window.location.href;
  var urlObj = new URL(currentUrl);

  // - Nếu có cờ ?raw=1 hoặc ?embedded=1 (yêu cầu xem thuần hoặc nhúng iframe): bỏ qua
  if (urlObj.searchParams.get('raw') === '1' || urlObj.searchParams.get('embedded') === '1') {
    return;
  }

  // - Kiểm tra kích thước màn hình PC (>= 768px)
  var isDesktop = window.innerWidth >= 768;
  if (!isDesktop) return;

  // 2. Chặn flash giao diện cũ trên PC trong khi khởi tạo Simulator
  var hideStyle = document.createElement('style');
  hideStyle.id = 'mv-hide-style';
  hideStyle.innerHTML = 'html { visibility: hidden !important; background: #070a12 !important; }';
  document.head.appendChild(hideStyle);

  // 3. Khởi tạo Simulator khi DOM sẵn sàng
  function initSimulator() {
    // URL tải trong iframe của điện thoại (kèm cờ ?embedded=1 để không kích hoạt lại simulator)
    var iframeUrl = new URL(currentUrl);
    iframeUrl.searchParams.set('embedded', '1');
    var cleanIframeUrl = iframeUrl.toString();

    // Link bản PC tương ứng (thay /mobile/ thành /pc/)
    var pcUrl = currentUrl.includes('/mobile/') ? currentUrl.replace('/mobile/', '/pc/') : null;

    // Link về Kho Theme (tìm đường dẫn index.html phù hợp)
    var backUrl = currentUrl.includes('/themes/') 
      ? currentUrl.substring(0, currentUrl.indexOf('/themes/') + 8) + 'index.html'
      : '../../index.html';

    // Tên trang & Rút gọn tên Theme (tránh dài quá gây vỡ header)
    var rawTitle = document.title || 'Mobile Theme Preview';
    var cleanTitle = rawTitle.split(/[-:|–]/)[0].trim();
    if (!cleanTitle || cleanTitle.length < 3) cleanTitle = 'Gozic Theme';

    // Tên file hiện tại (ví dụ: home.html, category.html,...)
    var currentFile = window.location.pathname.split('/').pop() || 'home.html';

    // Danh sách các trang chuẩn của theme
    var pages = [
      { name: 'Trang Chủ', file: 'home.html' },
      { name: 'Danh Mục Sản Phẩm', file: 'category.html' },
      { name: 'Chi Tiết Sản Phẩm', file: 'detail.html' },
      { name: 'Giỏ Hàng', file: 'cart.html' },
      { name: 'Liên Hệ & Showroom', file: 'contact.html' },
      { name: 'Tin Tức / Blog', file: 'news.html' },
      { name: 'Chi Tiết Bài Viết', file: 'post.html' }
    ];

    document.title = cleanTitle + ' - [Mobile View]';

    var simulatorHTML = `
      <div id="mvRoot">
        <!-- THANH CHUẨN (STANDARD TOPBAR) -->
        <header id="mvHeader">
          <!-- Cột Trái: Logo & Điều hướng về kho -->
          <div class="mv-left">
            <a href="${backUrl}" class="mv-btn mv-btn-back" title="Quay lại Kho Theme Gozic">
              <i class="bi bi-arrow-left"></i>
              <span>Kho Theme</span>
            </a>
            <div class="mv-brand-group">
              <span class="mv-brand-logo"><span class="logo-g">G</span><span class="logo-ozic">ozic</span></span>
              <span class="mv-sep">/</span>
              <span class="mv-theme-name" title="${rawTitle}">${cleanTitle}</span>
            </div>
          </div>

          <!-- Cột Giữa: Bộ chọn thiết bị & Xoay màn hình -->
          <div class="mv-center">
            <div class="mv-segmented-group">
              <button type="button" class="mv-seg-btn active" data-w="393" data-h="852" data-radius="50" data-name="iPhone" title="iPhone 16 Pro (393 × 852 px)">
                <i class="bi bi-phone"></i>
                <span>iPhone</span>
              </button>
              <button type="button" class="mv-seg-btn" data-w="430" data-h="932" data-radius="54" data-name="iPhone Plus" title="iPhone 16 Plus / Pro Max (430 × 932 px)">
                <i class="bi bi-phone-fill"></i>
                <span>Plus</span>
              </button>
              <button type="button" class="mv-seg-btn" data-w="412" data-h="915" data-radius="42" data-name="Galaxy" title="Android / Galaxy (412 × 915 px)">
                <i class="bi bi-android2"></i>
                <span>Galaxy</span>
              </button>
              <button type="button" class="mv-seg-btn" data-w="768" data-h="1024" data-radius="36" data-name="iPad" title="Tablet / iPad (768 × 1024 px)">
                <i class="bi bi-tablet"></i>
                <span>Tablet</span>
              </button>
            </div>

            <!-- Nút Xoay Ngang / Dọc -->
            <button type="button" class="mv-icon-btn" id="mvRotateBtn" title="Xoay thiết bị ngang / dọc">
              <i class="bi bi-arrow-repeat"></i>
            </button>
          </div>

          <!-- Cột Phải: Bộ chọn trang, Xem PC, Quét QR, Fullscreen & CTA -->
          <div class="mv-right">
            <!-- Dropdown chọn trang nhanh (Dark Styled) -->
            <div class="mv-page-picker">
              <i class="bi bi-compass mv-picker-icon"></i>
              <select id="mvPageSelect" class="mv-select" title="Chọn trang mẫu để xem nhanh">
                ${pages.map(function (p) {
                  var isSelected = currentFile.toLowerCase() === p.file.toLowerCase() ? 'selected' : '';
                  return '<option value="' + p.file + '" ' + isSelected + '>' + p.name + '</option>';
                }).join('')}
              </select>
              <i class="bi bi-chevron-down mv-picker-arrow"></i>
            </div>

            <!-- Nút chuyển sang bản PC (nếu có) -->
            ${pcUrl ? `
              <a href="${pcUrl}" class="mv-btn mv-btn-pc" title="Xem giao diện chuẩn máy tính PC">
                <i class="bi bi-laptop"></i>
                <span>Bản PC</span>
              </a>
            ` : ''}

            <!-- Nút Quét mã QR xem trên điện thoại thật -->
            <button type="button" class="mv-btn mv-btn-qr" id="mvQrOpenBtn" title="Quét mã QR để mở trực tiếp trên điện thoại">
              <i class="bi bi-qr-code-scan"></i>
              <span class="mv-btn-label">Quét QR</span>
            </button>

            <!-- Nút Xem toàn màn hình (Tắt khung giả lập) -->
            <a href="${currentUrl}${currentUrl.includes('?') ? '&' : '?'}raw=1" class="mv-icon-btn" title="Toàn màn hình (không khung)">
              <i class="bi bi-arrows-fullscreen"></i>
            </a>

            <!-- Nút Liên Hệ Tư Vấn -->
            <a href="https://gozic.vn/lien-he" class="mv-btn mv-btn-cta" target="_self" title="Liên hệ chuyên gia Gozic tư vấn">
              <i class="bi bi-chat-dots-fill"></i>
              <span>Tư Vấn</span>
            </a>
          </div>
        </header>

        <!-- KHUNG MÔ PHỎNG SMARTPHONE (STAGE CANVAS) -->
        <main id="mvStage">
          <div id="mvDeviceContainer">
            <!-- Thân máy điện thoại cao cấp -->
            <div id="mvPhoneBody" class="mv-phone-body">
              <!-- Cạnh viền kim loại & Nút vật lý mô phỏng -->
              <div class="mv-hardware-btn mv-btn-volume-up"></div>
              <div class="mv-hardware-btn mv-btn-volume-down"></div>
              <div class="mv-hardware-btn mv-btn-power"></div>

              <!-- Màn hình điện thoại -->
              <div class="mv-phone-screen">
                <!-- Dynamic Island / Loa thoại trên đỉnh -->
                <div class="mv-notch">
                  <div class="mv-notch-camera"></div>
                  <div class="mv-notch-speaker"></div>
                </div>

                <!-- Iframe hiển thị chính xác trang web mobile -->
                <iframe id="mvIframe" src="${cleanIframeUrl}" title="Gozic Mobile Preview"></iframe>

                <!-- Vạch Home Indicator bo tròn ở đáy -->
                <div class="mv-home-indicator"></div>
              </div>
            </div>

            <!-- Badge kích thước thiết bị -->
            <div id="mvDimensionBadge">
              <i class="bi bi-aspect-ratio"></i>
              <span id="mvDimensionText">393 × 852 px (iPhone)</span>
            </div>
          </div>
        </main>

        <!-- MODAL QUÉT MÃ QR CODE TRẢI NGHIỆM THẬT -->
        <div id="mvQrModal" class="mv-modal-backdrop">
          <div class="mv-modal-card">
            <div class="mv-modal-header">
              <div class="mv-modal-title">
                <i class="bi bi-qr-code-scan text-accent"></i>
                <span>Trải Nghiệm Trên Điện Thoại Thật</span>
              </div>
              <button type="button" class="mv-modal-close" id="mvQrCloseBtn"><i class="bi bi-x-lg"></i></button>
            </div>
            <div class="mv-modal-body">
              <div class="mv-qr-box">
                <img id="mvQrImage" src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(currentUrl)}" alt="Mã QR xem trên điện thoại" />
              </div>
              <p class="mv-qr-desc">
                Mở ứng dụng <strong>Camera</strong> hoặc <strong>Zalo</strong> trên điện thoại để quét mã QR và trải nghiệm giao diện trực tiếp trên màn hình cảm ứng thật.
              </p>
              <div class="mv-qr-link-box">
                <input type="text" id="mvQrLinkInput" value="${currentUrl}" readonly />
                <button type="button" id="mvCopyBtn" class="mv-btn-copy"><i class="bi bi-clipboard"></i> Sao Chép</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // CSS Styling chuẩn hóa cao cấp, chống tràn, hỗ trợ mọi kích cỡ màn hình
    var simulatorCSS = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@600;700;800&display=swap');
      @import url('https://fastly.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');

      *, *::before, *::after {
        box-sizing: border-box !important;
      }

      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
        background: #070a12 !important;
        color: #f1f5f9 !important;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        visibility: visible !important;
      }

      #mvRoot {
        display: flex;
        flex-direction: column;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
      }

      /* ==========================================================================
         THANH CHUẨN (STANDARD TOPBAR) - GỌN GÀNG, SANG TRỌNG
         ========================================================================== */
      #mvHeader {
        height: 52px;
        background: rgba(10, 14, 23, 0.96);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        z-index: 1000;
        flex-shrink: 0;
        gap: 12px;
      }

      .mv-left, .mv-center, .mv-right {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }

      /* Logo & Brand */
      .mv-brand-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .mv-brand-logo {
        font-family: 'Outfit', sans-serif;
        font-weight: 800;
        font-size: 18px;
        letter-spacing: -0.5px;
        display: flex;
        align-items: center;
      }
      .mv-brand-logo .logo-g { color: #10b981; }
      .mv-brand-logo .logo-ozic { color: #ffffff; }

      .mv-sep {
        color: rgba(255, 255, 255, 0.25);
        font-weight: 300;
        font-size: 13px;
      }

      .mv-theme-name {
        font-size: 13.5px;
        font-weight: 600;
        color: #e2e8f0;
        white-space: nowrap;
        max-width: 220px;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Buttons Common */
      .mv-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 9px;
        font-size: 12.5px;
        font-weight: 600;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.05);
        color: #e2e8f0;
        white-space: nowrap;
        height: 32px;
      }

      .mv-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
      }

      .mv-btn-back {
        background: rgba(255, 255, 255, 0.06);
        color: #94a3b8;
      }
      .mv-btn-back:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #ffffff;
      }

      .mv-btn-pc {
        background: rgba(56, 189, 248, 0.12);
        border-color: rgba(56, 189, 248, 0.3);
        color: #38bdf8;
      }
      .mv-btn-pc:hover {
        background: rgba(56, 189, 248, 0.22);
        color: #ffffff;
      }

      .mv-btn-qr {
        background: rgba(245, 158, 11, 0.12);
        border-color: rgba(245, 158, 11, 0.3);
        color: #f59e0b;
      }
      .mv-btn-qr:hover {
        background: rgba(245, 158, 11, 0.22);
        color: #ffffff;
      }

      .mv-btn-cta {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border: none;
        color: #ffffff !important;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
      }
      .mv-btn-cta:hover {
        box-shadow: 0 6px 16px rgba(16, 185, 129, 0.5);
      }

      .mv-icon-btn {
        width: 32px;
        height: 32px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 9px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.05);
        color: #94a3b8;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
        font-size: 13.5px;
      }
      .mv-icon-btn:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #ffffff;
      }

      /* Segmented Device Controls */
      .mv-segmented-group {
        display: flex;
        background: rgba(0, 0, 0, 0.45);
        padding: 3px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      .mv-seg-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        border-radius: 7px;
        border: none;
        background: transparent;
        color: #94a3b8;
        font-size: 11.5px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
        height: 26px;
      }

      .mv-seg-btn:hover {
        color: #ffffff;
      }

      .mv-seg-btn.active {
        background: #1e293b;
        color: #10b981;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
      }

      /* Custom Page Picker Dropdown (Khắc phục triệt để lỗi nền trắng native) */
      .mv-page-picker {
        position: relative;
        display: flex;
        align-items: center;
      }
      .mv-picker-icon {
        position: absolute;
        left: 10px;
        font-size: 13px;
        color: #10b981;
        pointer-events: none;
        z-index: 2;
      }
      .mv-picker-arrow {
        position: absolute;
        right: 10px;
        font-size: 10px;
        color: #94a3b8;
        pointer-events: none;
        z-index: 2;
      }
      .mv-select {
        -webkit-appearance: none !important;
        -moz-appearance: none !important;
        appearance: none !important;
        background: #151d30 !important;
        border: 1px solid rgba(255, 255, 255, 0.14) !important;
        color: #f8fafc !important;
        font-family: 'Inter', sans-serif !important;
        font-size: 12px !important;
        font-weight: 600 !important;
        padding: 5px 28px 5px 30px !important;
        border-radius: 9px !important;
        outline: none !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        height: 32px !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2) !important;
      }
      .mv-select:hover {
        border-color: rgba(16, 185, 129, 0.5) !important;
        background: #1a233a !important;
      }
      .mv-select:focus {
        border-color: #10b981 !important;
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important;
      }
      .mv-select option {
        background: #0f172a !important;
        color: #f8fafc !important;
        padding: 8px !important;
      }

      /* Responsive Header Breakpoints (Chống tràn khi màn hình nhỏ) */
      @media (max-width: 1320px) {
        .mv-theme-name {
          max-width: 140px;
        }
        .mv-btn-label {
          display: none;
        }
      }
      @media (max-width: 1150px) {
        .mv-theme-name, .mv-sep {
          display: none;
        }
      }
      @media (max-width: 950px) {
        .mv-btn-pc {
          display: none;
        }
      }

      /* ==========================================================================
         STAGE CANVAS & SMARTPHONE BEZEL MOCKUP
         ========================================================================== */
      #mvStage {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #070a12;
        background-image: radial-gradient(rgba(255, 255, 255, 0.07) 1.2px, transparent 1.2px);
        background-size: 24px 24px;
        overflow: hidden;
        padding: 12px;
        position: relative;
      }

      #mvDeviceContainer {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        margin: auto;
        transition: transform 0.2s ease, margin 0.2s ease;
      }

      .mv-phone-body {
        position: relative;
        width: 393px;
        height: 852px;
        background: #141a27;
        border: 11px solid #1a2233;
        border-radius: 50px;
        box-shadow: 
          0 0 0 1px rgba(255, 255, 255, 0.12),
          0 25px 70px -15px rgba(0, 0, 0, 0.9),
          0 10px 25px rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transform-origin: center center;
        transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.3s ease;
      }

      /* Hardware Buttons (Nút âm lượng & Nút nguồn) */
      .mv-hardware-btn {
        position: absolute;
        background: #2b364e;
        border-radius: 4px;
      }
      .mv-btn-volume-up {
        left: -14px;
        top: 115px;
        width: 3px;
        height: 52px;
      }
      .mv-btn-volume-down {
        left: -14px;
        top: 180px;
        width: 3px;
        height: 52px;
      }
      .mv-btn-power {
        right: -14px;
        top: 135px;
        width: 3px;
        height: 75px;
      }

      /* Screen Area */
      .mv-phone-screen {
        position: relative;
        width: 100%;
        height: 100%;
        background: #ffffff;
        border-radius: 38px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      /* Dynamic Island */
      .mv-notch {
        position: absolute;
        top: 9px;
        left: 50%;
        transform: translateX(-50%);
        width: 115px;
        height: 27px;
        background: #000000;
        border-radius: 20px;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 14px;
        gap: 6px;
        pointer-events: none;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
      }
      .mv-notch-camera {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: #0f172a;
        border: 1px solid #1e293b;
      }
      .mv-notch-speaker {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: #1e293b;
      }

      /* Iframe */
      #mvIframe {
        width: 100%;
        height: 100%;
        border: none;
        background: #ffffff;
        flex: 1;
      }

      /* Home Indicator */
      .mv-home-indicator {
        position: absolute;
        bottom: 7px;
        left: 50%;
        transform: translateX(-50%);
        width: 130px;
        height: 4.5px;
        background: rgba(0, 0, 0, 0.25);
        border-radius: 10px;
        z-index: 10;
        pointer-events: none;
      }

      /* Dimension Badge */
      #mvDimensionBadge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 600;
        color: #94a3b8;
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.08);
        padding: 3px 10px;
        border-radius: 999px;
      }

      /* ==========================================================================
         QR CODE MODAL
         ========================================================================== */
      .mv-modal-backdrop {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(8px);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        padding: 20px;
      }
      .mv-modal-backdrop.show {
        display: flex;
      }

      .mv-modal-card {
        background: #0f172a;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 20px;
        width: 100%;
        max-width: 380px;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
        animation: mvModalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes mvModalIn {
        from { opacity: 0; transform: scale(0.92); }
        to { opacity: 1; transform: scale(1); }
      }

      .mv-modal-header {
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .mv-modal-title {
        font-size: 14.5px;
        font-weight: 700;
        color: #ffffff;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .mv-modal-close {
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 16px;
        cursor: pointer;
        padding: 4px;
      }
      .mv-modal-close:hover {
        color: #ffffff;
      }

      .mv-modal-body {
        padding: 24px 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .mv-qr-box {
        background: #ffffff;
        padding: 12px;
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        margin-bottom: 16px;
      }
      .mv-qr-box img {
        width: 190px;
        height: 190px;
        display: block;
      }

      .mv-qr-desc {
        font-size: 13px;
        color: #94a3b8;
        line-height: 1.5;
        margin: 0 0 16px 0;
      }
      .mv-qr-desc strong {
        color: #10b981;
      }

      .mv-qr-link-box {
        display: flex;
        width: 100%;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        overflow: hidden;
      }
      .mv-qr-link-box input {
        flex: 1;
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 12px;
        padding: 8px 10px;
        outline: none;
      }
      .mv-btn-copy {
        background: #10b981;
        border: none;
        color: #ffffff;
        font-size: 12px;
        font-weight: 600;
        padding: 8px 12px;
        cursor: pointer;
        white-space: nowrap;
      }
      .mv-btn-copy:hover {
        background: #059669;
      }
    `;

    // Chèn HTML & CSS vào trang
    document.body.innerHTML = simulatorHTML;
    var styleTag = document.createElement('style');
    styleTag.innerHTML = simulatorCSS;
    document.head.appendChild(styleTag);

    // Gỡ bỏ style chặn flash
    if (hideStyle && hideStyle.parentNode) {
      hideStyle.parentNode.removeChild(hideStyle);
    }

    // 4. Bắt các sự kiện tương tác trên Thanh Chuẩn & Tự Động Co Giãn (Auto-scale)
    var phoneBody = document.getElementById('mvPhoneBody');
    var deviceContainer = document.getElementById('mvDeviceContainer');
    var iframe = document.getElementById('mvIframe');
    var segButtons = document.querySelectorAll('.mv-seg-btn');
    var dimensionText = document.getElementById('mvDimensionText');
    var pageSelect = document.getElementById('mvPageSelect');
    var rotateBtn = document.getElementById('mvRotateBtn');
    var qrModal = document.getElementById('mvQrModal');
    var qrOpenBtn = document.getElementById('mvQrOpenBtn');
    var qrCloseBtn = document.getElementById('mvQrCloseBtn');
    var copyBtn = document.getElementById('mvCopyBtn');
    var qrLinkInput = document.getElementById('mvQrLinkInput');

    var currentW = 393;
    var currentH = 852;
    var currentRadius = 50;
    var currentName = 'iPhone';
    var isLandscape = false;

    // Tự động tính toán scale để điện thoại luôn vừa vặn 100% trong khung nhìn máy tính
    function updateScale() {
      var stage = document.getElementById('mvStage');
      if (!stage || !phoneBody) return;

      var availH = stage.clientHeight - 40; // trừ phần padding và badge
      var availW = stage.clientWidth - 40;
      var targetW = (isLandscape ? currentH : currentW) + 22; // cộng viền bezel
      var targetH = (isLandscape ? currentW : currentH) + 22;

      var scaleH = availH / targetH;
      var scaleW = availW / targetW;
      var scale = Math.min(1, scaleH, scaleW);

      if (scale < 1) {
        phoneBody.style.transform = 'scale(' + scale.toFixed(3) + ')';
        var heightDiff = (targetH * (1 - scale)) / 2;
        if (deviceContainer) {
          deviceContainer.style.marginTop = '-' + Math.round(heightDiff * 0.8) + 'px';
          deviceContainer.style.marginBottom = '-' + Math.round(heightDiff * 0.8) + 'px';
        }
      } else {
        phoneBody.style.transform = 'none';
        if (deviceContainer) {
          deviceContainer.style.marginTop = '0';
          deviceContainer.style.marginBottom = '0';
        }
      }
    }

    function applyDimensions() {
      var w = isLandscape ? currentH : currentW;
      var h = isLandscape ? currentW : currentH;
      phoneBody.style.width = w + 'px';
      phoneBody.style.height = h + 'px';
      phoneBody.style.borderRadius = currentRadius + 'px';
      dimensionText.textContent = w + ' × ' + h + ' px (' + currentName + (isLandscape ? ' - Ngang' : '') + ')';
      updateScale();
    }

    // Chuyển đổi thiết bị (iPhone, Plus, Galaxy, Tablet)
    segButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        segButtons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentW = parseInt(btn.getAttribute('data-w'), 10);
        currentH = parseInt(btn.getAttribute('data-h'), 10);
        currentRadius = parseInt(btn.getAttribute('data-radius'), 10);
        currentName = btn.getAttribute('data-name');
        applyDimensions();
      });
    });

    // Nút Xoay thiết bị
    rotateBtn.addEventListener('click', function () {
      isLandscape = !isLandscape;
      applyDimensions();
    });

    // Lắng nghe resize cửa sổ để luôn vừa vặn
    window.addEventListener('resize', updateScale);

    // Chuyển trang nhanh từ Dropdown
    pageSelect.addEventListener('change', function () {
      var targetFile = pageSelect.value;
      var newUrl = new URL(targetFile, window.location.href);
      newUrl.searchParams.set('embedded', '1');
      iframe.src = newUrl.toString();

      // Cập nhật URL trình duyệt (history)
      var cleanStateUrl = new URL(targetFile, window.location.href).toString();
      window.history.pushState(null, '', cleanStateUrl);
      qrLinkInput.value = cleanStateUrl;
      document.getElementById('mvQrImage').src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(cleanStateUrl);
    });

    // QR Modal logic
    qrOpenBtn.addEventListener('click', function () {
      qrModal.classList.add('show');
    });
    qrCloseBtn.addEventListener('click', function () {
      qrModal.classList.remove('show');
    });
    qrModal.addEventListener('click', function (e) {
      if (e.target === qrModal) qrModal.classList.remove('show');
    });

    // Copy link button
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(qrLinkInput.value).then(function () {
        var originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="bi bi-check2"></i> Đã Chép!';
        setTimeout(function () {
          copyBtn.innerHTML = originalText;
        }, 2000);
      });
    });

    // Khởi tạo scale ngay lần đầu
    setTimeout(updateScale, 50);
  }

  // Khởi động khi DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSimulator);
  } else {
    initSimulator();
  }
})();
