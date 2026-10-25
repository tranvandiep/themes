/**
 * ==============================================================================
 * Gozic Theme Toolbar & Universal Device Simulator Library
 * File: themes/libs/theme-toolbar.js
 * 
 * Thư viện dùng chung tiêu chuẩn cho mọi giao diện PC & Mobile trong dự án themes:
 * - Hỗ trợ switch mượt mà qua lại giữa 3 chế độ:
 *   1. Bản PC (Desktop View full-width)
 *   2. Khung Mobile (Smartphone Simulator tự động co giãn vừa vặn mọi màn hình laptop)
 *   3. Mobile Full (Mobile View toàn màn hình PC không khung)
 * - Tự động nhận diện theme, trang hiện tại, sinh dropdown đổi trang nhanh (Trang chủ, Danh mục, Chi tiết, Giỏ hàng, Liên hệ, Tin tức,...)
 * - Tạo mã QR động tự động cập nhật theo trang để khách quét camera điện thoại trải nghiệm ngay trên thiết bị thật.
 * - Quy chuẩn dùng chung: Mọi trang PC hoặc Mobile chỉ cần nhúng 1 dòng:
 *   <script src="../../libs/theme-toolbar.js" data-theme-name="EcoCook Smart Kitchen" defer></script>
 * ==============================================================================
 */
(function () {
  'use strict';

  // Tránh nạp trùng lặp
  if (window.__THEME_TOOLBAR_INITIALIZED__) return;
  window.__THEME_TOOLBAR_INITIALIZED__ = true;

  // Nếu đang nằm trong iframe (nhúng trong modal preview hoặc simulator khác): không hiển thị toolbar lặp lại
  if (window.self !== window.top) return;

  var currentUrl = window.location.href;
  var urlObj = new URL(currentUrl);
  var pathname = window.location.pathname;

  // Nhận diện chế độ
  var isPcPage = pathname.includes('/pc/');
  var isMobilePage = pathname.includes('/mobile/');
  var isRaw = urlObj.searchParams.get('raw') === '1';
  var isDesktop = window.innerWidth >= 768;

  // Nếu mở trên điện thoại thật (< 768px) và là trang mobile: để hiển thị 100% full-screen tự nhiên, không khung
  if (!isDesktop && isMobilePage) return;

  // Xác định chế độ xem hiện tại
  var viewMode = 'pc';
  if (isMobilePage) {
    viewMode = isRaw ? 'mobile-full' : 'mobile-frame';
  }

  // Chặn flash giao diện cũ trên PC đối với chế độ mobile-frame
  var hideStyle = null;
  if (viewMode === 'mobile-frame') {
    hideStyle = document.createElement('style');
    hideStyle.id = 'theme-toolbar-pre-style';
    hideStyle.innerHTML = 'html { visibility: hidden !important; background: #070a12 !important; }';
    document.head.appendChild(hideStyle);
  }

  function initToolbar() {
    // 1. Tên Theme
    var scriptEl = document.querySelector('script[src*="theme-toolbar.js"]') || document.currentScript;
    var cleanTitle = scriptEl ? scriptEl.getAttribute('data-theme-name') : null;

    if (!cleanTitle) {
      var metaTheme = document.querySelector('meta[name="theme-name"]');
      if (metaTheme && metaTheme.content) cleanTitle = metaTheme.content.trim();
    }
    if (!cleanTitle && pathname.includes('/theme01/')) {
      cleanTitle = 'EcoCook Smart Kitchen';
    }
    if (!cleanTitle) {
      var rawTitle = document.title || 'Theme Showcase';
      var parts = rawTitle.split(/[-:|–]/).map(function (s) { return s.trim(); }).filter(Boolean);
      cleanTitle = parts.find(function (p) { return /EcoCook|Kitchen|Theme|Store/i.test(p); }) || parts[0] || 'Gozic Theme';
    }

    // 2. Tên file hiện tại
    var currentFile = pathname.split('/').pop() || 'home.html';
    if (!currentFile.endsWith('.html')) currentFile = 'home.html';

    // 3. Đường dẫn về Kho Theme index.html
    var backUrl = currentUrl.includes('/themes/')
      ? currentUrl.substring(0, currentUrl.indexOf('/themes/') + 8) + 'index.html'
      : '../../index.html';

    // 4. Tính toán các URL chuyển đổi chế độ tương ứng
    var pcUrl = '';
    var mobileFrameUrl = '';
    var mobileFullUrl = '';

    if (isPcPage) {
      pcUrl = currentFile;
      mobileFrameUrl = '../mobile/' + currentFile;
      mobileFullUrl = '../mobile/' + currentFile + '?raw=1';
    } else if (isMobilePage) {
      pcUrl = '../pc/' + currentFile;
      mobileFrameUrl = currentFile;
      mobileFullUrl = currentFile + '?raw=1';
    } else {
      pcUrl = 'pc/home.html';
      mobileFrameUrl = 'mobile/home.html';
      mobileFullUrl = 'mobile/home.html?raw=1';
    }

    // URL QR Code (luôn hướng về trang mobile để quét trên điện thoại thật)
    var qrTargetUrl = new URL(mobileFrameUrl, currentUrl).toString();

    // 5. Danh sách 7 trang chuẩn của theme
    var pages = [
      { name: 'Trang Chủ', file: 'home.html' },
      { name: 'Danh Mục Sản Phẩm', file: 'category.html' },
      { name: 'Chi Tiết Sản Phẩm', file: 'detail.html' },
      { name: 'Giỏ Hàng', file: 'cart.html' },
      { name: 'Liên Hệ & Showroom', file: 'contact.html' },
      { name: 'Tin Tức / Blog', file: 'news.html' },
      { name: 'Chi Tiết Bài Viết', file: 'post.html' }
    ];

    // =========================================================================
    // CASE A: CHẾ ĐỘ MOBILE FRAME (SMARTPHONE SIMULATOR)
    // =========================================================================
    if (viewMode === 'mobile-frame') {
      var iframeUrl = new URL(currentUrl);
      iframeUrl.searchParams.set('embedded', '1');
      var cleanIframeUrl = iframeUrl.toString();

      document.title = cleanTitle + ' - [Mobile View]';

      var simulatorHTML = `
        <div id="mvRoot">
          <!-- THANH CHUẨN (STANDARD TOPBAR) -->
          <header id="themeToolbar">
            <!-- Cột Trái -->
            <div class="tb-left">
              <a href="${backUrl}" class="tb-btn tb-btn-back" target="_self" title="Quay lại Kho Theme Gozic">
                <i class="bi bi-arrow-left"></i>
                <span>Kho Theme</span>
              </a>
              <div class="tb-brand-group">
                <span class="tb-brand-logo"><span class="logo-g">G</span><span class="logo-ozic">ozic</span></span>
                <span class="tb-sep">/</span>
                <span class="tb-theme-name" title="${cleanTitle}">${cleanTitle}</span>
              </div>
            </div>

            <!-- Cột Giữa: Bộ chọn thiết bị & Nút Xoay -->
            <div class="tb-center">
              <div class="tb-segmented-group">
                <button type="button" class="tb-seg-btn active" data-w="393" data-h="852" data-radius="50" data-name="iPhone" title="iPhone 16 Pro (393 × 852 px)">
                  <i class="bi bi-phone"></i>
                  <span>iPhone</span>
                </button>
                <button type="button" class="tb-seg-btn" data-w="430" data-h="932" data-radius="54" data-name="iPhone Plus" title="iPhone 16 Plus / Max (430 × 932 px)">
                  <i class="bi bi-phone-fill"></i>
                  <span>Plus</span>
                </button>
                <button type="button" class="tb-seg-btn" data-w="412" data-h="915" data-radius="42" data-name="Galaxy" title="Android / Galaxy (412 × 915 px)">
                  <i class="bi bi-android2"></i>
                  <span>Galaxy</span>
                </button>
                <button type="button" class="tb-seg-btn" data-w="768" data-h="1024" data-radius="36" data-name="iPad" title="Tablet / iPad (768 × 1024 px)">
                  <i class="bi bi-tablet"></i>
                  <span>Tablet</span>
                </button>
              </div>

              <button type="button" class="tb-icon-btn" id="tbRotateBtn" title="Xoay thiết bị ngang / dọc">
                <i class="bi bi-arrow-repeat"></i>
              </button>
            </div>

            <!-- Cột Phải: Dropdown Trang, Bản PC, Quét QR, Mobile Full, Tư Vấn (Khớp 100% Ảnh Screenshot) -->
            <div class="tb-right">
              <!-- Dropdown Chọn Trang -->
              <div class="tb-page-picker">
                <i class="bi bi-compass tb-picker-icon"></i>
                <select id="tbPageSelect" class="tb-select" title="Chuyển nhanh giữa các trang">
                  ${pages.map(function (p) {
                    var isSelected = currentFile.toLowerCase() === p.file.toLowerCase() ? 'selected' : '';
                    return '<option value="' + p.file + '" ' + isSelected + '>' + p.name + '</option>';
                  }).join('')}
                </select>
                <i class="bi bi-chevron-down tb-picker-arrow"></i>
              </div>

              <!-- Nút Bản PC -->
              <a href="${pcUrl}" class="tb-btn tb-btn-mode" id="tbPcBtn" target="_self" title="Xem giao diện chuẩn máy tính PC">
                <i class="bi bi-laptop"></i>
                <span>Bản PC</span>
              </a>

              <!-- Nút Quét mã QR xem trên điện thoại thật -->
              <button type="button" class="tb-btn tb-btn-qr" id="tbQrOpenBtn" title="Quét mã QR để mở trực tiếp trên điện thoại">
                <i class="bi bi-qr-code-scan"></i>
                <span>Quét QR</span>
              </button>

              <!-- Nút Phóng to / Mobile Full toàn màn hình -->
              <a href="${mobileFullUrl}" class="tb-icon-btn" id="tbFullBtn" target="_self" title="Xem giao diện Mobile Full toàn màn hình">
                <i class="bi bi-arrows-fullscreen"></i>
              </a>

              <!-- Nút Liên Hệ Tư Vấn -->
              <a href="https://gozic.vn/lien-he" class="tb-btn tb-btn-cta" target="_self" title="Liên hệ chuyên gia Gozic tư vấn">
                <i class="bi bi-chat-dots-fill"></i>
                <span>Tư Vấn</span>
              </a>
            </div>
          </header>

          <!-- KHUNG MÔ PHỎNG SMARTPHONE -->
          <main id="mvStage">
            <div id="mvDeviceContainer">
              <div id="mvPhoneBody" class="mv-phone-body">
                <div class="mv-hardware-btn mv-btn-volume-up"></div>
                <div class="mv-hardware-btn mv-btn-volume-down"></div>
                <div class="mv-hardware-btn mv-btn-power"></div>

                <div class="mv-phone-screen">
                  <div class="mv-notch">
                    <div class="mv-notch-camera"></div>
                    <div class="mv-notch-speaker"></div>
                  </div>
                  <iframe id="mvIframe" src="${cleanIframeUrl}" title="Gozic Mobile Preview"></iframe>
                  <div class="mv-home-indicator"></div>
                </div>
              </div>

              <div id="mvDimensionBadge">
                <i class="bi bi-aspect-ratio"></i>
                <span id="mvDimensionText">393 × 852 px (iPhone)</span>
              </div>
            </div>
          </main>

          <!-- MODAL QR CODE -->
          <div id="tbQrModal" class="tb-modal-backdrop">
            <div class="tb-modal-card">
              <div class="tb-modal-header">
                <div class="tb-modal-title">
                  <i class="bi bi-qr-code-scan text-accent"></i>
                  <span>Trải Nghiệm Trên Điện Thoại Thật</span>
                </div>
                <button type="button" class="tb-modal-close" id="tbQrCloseBtn"><i class="bi bi-x-lg"></i></button>
              </div>
              <div class="tb-modal-body">
                <div class="tb-qr-box">
                  <img id="tbQrImage" src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrTargetUrl)}" alt="Mã QR xem trên điện thoại" />
                </div>
                <p class="tb-qr-desc">
                  Mở ứng dụng <strong>Camera</strong> hoặc <strong>Zalo</strong> trên điện thoại để quét mã QR và trải nghiệm trực tiếp trên điện thoại thật.
                </p>
                <div class="tb-qr-link-box">
                  <input type="text" id="tbQrLinkInput" value="${qrTargetUrl}" readonly />
                  <button type="button" id="tbCopyBtn" class="tb-btn-copy"><i class="bi bi-clipboard"></i> Sao Chép</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.innerHTML = simulatorHTML;
      injectStyles(true);

      if (hideStyle && hideStyle.parentNode) {
        hideStyle.parentNode.removeChild(hideStyle);
      }

      setupSimulatorLogic();
      setupQrLogic(qrTargetUrl);
      return;
    }

    // =========================================================================
    // CASE B: CHẾ ĐỘ BẢN PC HOẶC MOBILE FULL (DOCK THANH HEADER CỐ ĐỊNH TRÊN CÙNG)
    // =========================================================================
    var headerHTML = `
      <header id="themeToolbar" class="tb-docked">
        <!-- Cột Trái -->
        <div class="tb-left">
          <a href="${backUrl}" class="tb-btn tb-btn-back" target="_self" title="Quay lại Kho Theme Gozic">
            <i class="bi bi-arrow-left"></i>
            <span>Kho Theme</span>
          </a>
          <div class="tb-brand-group">
            <span class="tb-brand-logo"><span class="logo-g">G</span><span class="logo-ozic">ozic</span></span>
            <span class="tb-sep">/</span>
            <span class="tb-theme-name" title="${cleanTitle}">${cleanTitle}</span>
          </div>
        </div>

        <!-- Cột Giữa: Bộ Switcher qua lại giữa PC, Khung Mobile, Mobile Full -->
        <div class="tb-center">
          <div class="tb-mode-segmented">
            <a href="${pcUrl}" class="tb-mode-tab ${viewMode === 'pc' ? 'active' : ''}" target="_self" title="Xem giao diện chuẩn máy tính PC">
              <i class="bi bi-laptop"></i>
              <span>Bản PC</span>
            </a>
            <a href="${mobileFrameUrl}" class="tb-mode-tab ${viewMode === 'mobile-frame' ? 'active' : ''}" target="_self" title="Xem mô phỏng khung điện thoại Smartphone">
              <i class="bi bi-phone"></i>
              <span>Khung Mobile</span>
            </a>
            <a href="${mobileFullUrl}" class="tb-mode-tab ${viewMode === 'mobile-full' ? 'active' : ''}" target="_self" title="Xem giao diện Mobile toàn màn hình không khung">
              <i class="bi bi-arrows-fullscreen"></i>
              <span>Mobile Full</span>
            </a>
          </div>
        </div>

        <!-- Cột Phải: Dropdown Chọn Trang, Quét QR, CTA -->
        <div class="tb-right">
          <!-- Dropdown Chọn Trang Nhanh -->
          <div class="tb-page-picker">
            <i class="bi bi-compass tb-picker-icon"></i>
            <select id="tbPageSelect" class="tb-select" title="Chuyển nhanh giữa các trang của theme">
              ${pages.map(function (p) {
                var isSelected = currentFile.toLowerCase() === p.file.toLowerCase() ? 'selected' : '';
                return '<option value="' + p.file + '" ' + isSelected + '>' + p.name + '</option>';
              }).join('')}
            </select>
            <i class="bi bi-chevron-down tb-picker-arrow"></i>
          </div>

          <!-- Nút Quét QR -->
          <button type="button" class="tb-btn tb-btn-qr" id="tbQrOpenBtn" title="Quét mã QR để mở trực tiếp trên điện thoại">
            <i class="bi bi-qr-code-scan"></i>
            <span class="tb-btn-label">Quét QR</span>
          </button>

          <!-- Nút Tư Vấn Theme -->
          <a href="https://gozic.vn/lien-he" class="tb-btn tb-btn-cta" target="_self" title="Liên hệ chuyên gia Gozic tư vấn">
            <i class="bi bi-chat-dots-fill"></i>
            <span>Tư Vấn</span>
          </a>
        </div>
      </header>

      <!-- MODAL QR CODE -->
      <div id="tbQrModal" class="tb-modal-backdrop">
        <div class="tb-modal-card">
          <div class="tb-modal-header">
            <div class="tb-modal-title">
              <i class="bi bi-qr-code-scan text-accent"></i>
              <span>Trải Nghiệm Trên Điện Thoại Thật</span>
            </div>
            <button type="button" class="tb-modal-close" id="tbQrCloseBtn"><i class="bi bi-x-lg"></i></button>
          </div>
          <div class="tb-modal-body">
            <div class="tb-qr-box">
              <img id="tbQrImage" src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrTargetUrl)}" alt="Mã QR xem trên điện thoại" />
            </div>
            <p class="tb-qr-desc">
              Mở ứng dụng <strong>Camera</strong> hoặc <strong>Zalo</strong> trên điện thoại để quét mã QR và trải nghiệm trực tiếp trên điện thoại thật.
            </p>
            <div class="tb-qr-link-box">
              <input type="text" id="tbQrLinkInput" value="${qrTargetUrl}" readonly />
              <button type="button" id="tbCopyBtn" class="tb-btn-copy"><i class="bi bi-clipboard"></i> Sao Chép</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Chèn Toolbar vào đầu trang body
    var tempWrapper = document.createElement('div');
    tempWrapper.innerHTML = headerHTML;
    while (tempWrapper.firstChild) {
      document.body.insertBefore(tempWrapper.firstChild, document.body.firstChild);
    }

    injectStyles(false);
    setupDockedLogic(viewMode);
    setupQrLogic(qrTargetUrl);
  }

  // =========================================================================
  // LOGIC & EVENTS
  // =========================================================================
  function setupSimulatorLogic() {
    var phoneBody = document.getElementById('mvPhoneBody');
    var deviceContainer = document.getElementById('mvDeviceContainer');
    var iframe = document.getElementById('mvIframe');
    var segButtons = document.querySelectorAll('.tb-seg-btn');
    var dimensionText = document.getElementById('mvDimensionText');
    var pageSelect = document.getElementById('tbPageSelect');
    var rotateBtn = document.getElementById('tbRotateBtn');

    var currentW = 393;
    var currentH = 852;
    var currentRadius = 50;
    var currentName = 'iPhone';
    var isLandscape = false;

    // Tự động scale để không bao giờ bị cắt đáy trên màn hình nhỏ
    function updateScale() {
      var stage = document.getElementById('mvStage');
      if (!stage || !phoneBody) return;

      var availH = stage.clientHeight - 40;
      var availW = stage.clientWidth - 40;
      var targetW = (isLandscape ? currentH : currentW) + 22;
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
      if (dimensionText) {
        dimensionText.textContent = w + ' × ' + h + ' px (' + currentName + (isLandscape ? ' - Ngang' : '') + ')';
      }
      updateScale();
    }

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

    if (rotateBtn) {
      rotateBtn.addEventListener('click', function () {
        isLandscape = !isLandscape;
        applyDimensions();
      });
    }

    window.addEventListener('resize', updateScale);

    // Dropdown chọn trang trong Simulator
    if (pageSelect) {
      pageSelect.addEventListener('change', function () {
        var targetFile = pageSelect.value;
        var newUrl = new URL(targetFile, window.location.href);
        newUrl.searchParams.set('embedded', '1');
        iframe.src = newUrl.toString();

        var cleanStateUrl = new URL(targetFile, window.location.href).toString();
        window.history.pushState(null, '', cleanStateUrl);

        var qrInput = document.getElementById('tbQrLinkInput');
        if (qrInput) qrInput.value = cleanStateUrl;
        var qrImg = document.getElementById('tbQrImage');
        if (qrImg) qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(cleanStateUrl);

        var pcBtn = document.getElementById('tbPcBtn');
        if (pcBtn) pcBtn.href = '../pc/' + targetFile;
        var fullBtn = document.getElementById('tbFullBtn');
        if (fullBtn) fullBtn.href = targetFile + '?raw=1';
      });
    }

    // Khi người dùng bấm liên kết bên trong iframe: Tự động đồng bộ Topbar ngoài
    if (iframe) {
      iframe.addEventListener('load', function () {
        try {
          var iframePath = iframe.contentWindow.location.pathname;
          var iframeFile = iframePath.split('/').pop() || 'home.html';
          if (iframeFile.indexOf('.html') === -1) iframeFile = 'home.html';

          if (pageSelect) {
            pageSelect.value = iframeFile;
          }
          window.history.replaceState(null, '', iframeFile);

          var cleanStateUrl = new URL(iframeFile, window.location.href).toString();
          var qrInput = document.getElementById('tbQrLinkInput');
          if (qrInput) qrInput.value = cleanStateUrl;
          var qrImg = document.getElementById('tbQrImage');
          if (qrImg) qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(cleanStateUrl);

          var pcBtn = document.getElementById('tbPcBtn');
          if (pcBtn) pcBtn.href = '../pc/' + iframeFile;
          var fullBtn = document.getElementById('tbFullBtn');
          if (fullBtn) fullBtn.href = iframeFile + '?raw=1';
        } catch (e) {
          // Bỏ qua nếu cross-origin
        }
      });
    }

    setTimeout(updateScale, 50);
  }

  function setupDockedLogic(mode) {
    var pageSelect = document.getElementById('tbPageSelect');
    if (!pageSelect) return;

    pageSelect.addEventListener('change', function () {
      var targetFile = pageSelect.value;
      if (mode === 'mobile-full') {
        window.location.href = targetFile + '?raw=1';
      } else {
        window.location.href = targetFile;
      }
    });
  }

  function setupQrLogic(qrTargetUrl) {
    var qrModal = document.getElementById('tbQrModal');
    var qrOpenBtn = document.getElementById('tbQrOpenBtn');
    var qrCloseBtn = document.getElementById('tbQrCloseBtn');
    var copyBtn = document.getElementById('tbCopyBtn');
    var qrLinkInput = document.getElementById('tbQrLinkInput');

    if (!qrModal || !qrOpenBtn) return;

    qrOpenBtn.addEventListener('click', function () {
      qrModal.classList.add('show');
    });
    if (qrCloseBtn) {
      qrCloseBtn.addEventListener('click', function () {
        qrModal.classList.remove('show');
      });
    }
    qrModal.addEventListener('click', function (e) {
      if (e.target === qrModal) qrModal.classList.remove('show');
    });

    if (copyBtn && qrLinkInput) {
      copyBtn.addEventListener('click', function () {
        navigator.clipboard.writeText(qrLinkInput.value).then(function () {
          var originalText = copyBtn.innerHTML;
          copyBtn.innerHTML = '<i class="bi bi-check2"></i> Đã Chép!';
          setTimeout(function () {
            copyBtn.innerHTML = originalText;
          }, 2000);
        });
      });
    }
  }

  // =========================================================================
  // CSS STYLES INJECTION
  // =========================================================================
  function injectStyles(isSimulator) {
    var css = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@600;700;800&display=swap');
      @import url('https://fastly.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');

      /* =========================================================================
         THANH CHUẨN TOPBAR
         ========================================================================= */
      #themeToolbar {
        height: 50px !important;
        background: rgba(10, 14, 23, 0.96) !important;
        backdrop-filter: blur(20px) !important;
        -webkit-backdrop-filter: blur(20px) !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 0 16px !important;
        z-index: 999999 !important;
        flex-shrink: 0 !important;
        gap: 12px !important;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
        box-sizing: border-box !important;
      }

      #themeToolbar.tb-docked {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
      }

      /* Dịch chuyển các header gốc có fixed top-0 xuống dưới 50px để không bị che */
      body.tb-has-docked {
        padding-top: 50px !important;
      }
      header.fixed.top-0, .fixed.top-0:not(#themeToolbar), header.sticky.top-0 {
        top: 50px !important;
      }

      .tb-left, .tb-center, .tb-right {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        flex-shrink: 0 !important;
      }

      /* Brand */
      .tb-brand-group {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
      }
      .tb-brand-logo {
        font-family: 'Outfit', sans-serif !important;
        font-weight: 800 !important;
        font-size: 18px !important;
        letter-spacing: -0.5px !important;
        display: flex !important;
        align-items: center !important;
      }
      .tb-brand-logo .logo-g { color: #10b981 !important; }
      .tb-brand-logo .logo-ozic { color: #ffffff !important; }

      .tb-sep {
        color: rgba(255, 255, 255, 0.25) !important;
        font-weight: 300 !important;
        font-size: 13px !important;
      }
      .tb-theme-name {
        font-size: 13px !important;
        font-weight: 600 !important;
        color: #e2e8f0 !important;
        white-space: nowrap !important;
        max-width: 220px !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      /* Buttons Common */
      .tb-btn {
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        padding: 5px 12px !important;
        border-radius: 9px !important;
        font-size: 12px !important;
        font-weight: 600 !important;
        text-decoration: none !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        background: rgba(255, 255, 255, 0.05) !important;
        color: #e2e8f0 !important;
        white-space: nowrap !important;
        height: 32px !important;
        box-sizing: border-box !important;
      }
      .tb-btn:hover {
        background: rgba(255, 255, 255, 0.1) !important;
        color: #ffffff !important;
      }
      .tb-btn-back {
        background: rgba(255, 255, 255, 0.06) !important;
        color: #94a3b8 !important;
      }
      .tb-btn-back:hover {
        background: rgba(255, 255, 255, 0.12) !important;
        color: #ffffff !important;
      }
      .tb-btn-mode {
        background: rgba(56, 189, 248, 0.1) !important;
        border-color: rgba(56, 189, 248, 0.25) !important;
        color: #38bdf8 !important;
      }
      .tb-btn-mode:hover {
        background: rgba(56, 189, 248, 0.2) !important;
        color: #ffffff !important;
      }
      .tb-btn-qr {
        background: rgba(245, 158, 11, 0.12) !important;
        border-color: rgba(245, 158, 11, 0.3) !important;
        color: #f59e0b !important;
      }
      .tb-btn-qr:hover {
        background: rgba(245, 158, 11, 0.22) !important;
        color: #ffffff !important;
      }
      .tb-btn-cta {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
        border: none !important;
        color: #ffffff !important;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35) !important;
      }
      .tb-btn-cta:hover {
        box-shadow: 0 6px 16px rgba(16, 185, 129, 0.5) !important;
      }

      .tb-icon-btn {
        width: 32px !important;
        height: 32px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        border-radius: 9px !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        background: rgba(255, 255, 255, 0.05) !important;
        color: #94a3b8 !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        text-decoration: none !important;
        font-size: 13.5px !important;
      }
      .tb-icon-btn:hover {
        background: rgba(255, 255, 255, 0.12) !important;
        color: #ffffff !important;
      }

      /* Segmented Controls (Chuyển chế độ PC / Khung / Full) */
      .tb-mode-segmented {
        display: flex !important;
        background: rgba(0, 0, 0, 0.45) !important;
        padding: 3px !important;
        border-radius: 10px !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        gap: 2px !important;
      }
      .tb-mode-tab {
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        padding: 4px 12px !important;
        border-radius: 7px !important;
        border: none !important;
        background: transparent !important;
        color: #94a3b8 !important;
        font-size: 11.5px !important;
        font-weight: 600 !important;
        text-decoration: none !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        white-space: nowrap !important;
        height: 26px !important;
      }
      .tb-mode-tab:hover {
        color: #ffffff !important;
      }
      .tb-mode-tab.active {
        background: #1e293b !important;
        color: #10b981 !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35) !important;
      }

      /* Segmented Device Controls (Khi ở Simulator) */
      .tb-segmented-group {
        display: flex !important;
        background: rgba(0, 0, 0, 0.45) !important;
        padding: 3px !important;
        border-radius: 10px !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
      }
      .tb-seg-btn {
        display: inline-flex !important;
        align-items: center !important;
        gap: 5px !important;
        padding: 4px 10px !important;
        border-radius: 7px !important;
        border: none !important;
        background: transparent !important;
        color: #94a3b8 !important;
        font-size: 11.5px !important;
        font-weight: 600 !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        white-space: nowrap !important;
        height: 26px !important;
      }
      .tb-seg-btn:hover { color: #ffffff !important; }
      .tb-seg-btn.active {
        background: #1e293b !important;
        color: #10b981 !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35) !important;
      }

      /* Dropdown Chọn Trang */
      .tb-page-picker {
        position: relative !important;
        display: flex !important;
        align-items: center !important;
      }
      .tb-picker-icon {
        position: absolute !important;
        left: 10px !important;
        font-size: 13px !important;
        color: #10b981 !important;
        pointer-events: none !important;
        z-index: 2 !important;
      }
      .tb-picker-arrow {
        position: absolute !important;
        right: 10px !important;
        font-size: 10px !important;
        color: #94a3b8 !important;
        pointer-events: none !important;
        z-index: 2 !important;
      }
      .tb-select {
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
      .tb-select:hover {
        border-color: rgba(16, 185, 129, 0.5) !important;
        background: #1a233a !important;
      }
      .tb-select:focus {
        border-color: #10b981 !important;
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important;
      }
      .tb-select option {
        background: #0f172a !important;
        color: #f8fafc !important;
        padding: 8px !important;
      }

      /* QR Modal */
      .tb-modal-backdrop {
        position: fixed !important;
        top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
        background: rgba(0, 0, 0, 0.75) !important;
        backdrop-filter: blur(8px) !important;
        display: none;
        align-items: center !important;
        justify-content: center !important;
        z-index: 9999999 !important;
        padding: 20px !important;
      }
      .tb-modal-backdrop.show { display: flex !important; }
      .tb-modal-card {
        background: #0f172a !important;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
        border-radius: 20px !important;
        width: 100% !important;
        max-width: 380px !important;
        overflow: hidden !important;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7) !important;
        animation: tbModalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }
      @keyframes tbModalIn {
        from { opacity: 0; transform: scale(0.92); }
        to { opacity: 1; transform: scale(1); }
      }
      .tb-modal-header {
        padding: 16px 20px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
      }
      .tb-modal-title {
        font-size: 14.5px !important;
        font-weight: 700 !important;
        color: #ffffff !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
      }
      .tb-modal-close {
        background: transparent !important;
        border: none !important;
        color: #94a3b8 !important;
        font-size: 16px !important;
        cursor: pointer !important;
      }
      .tb-modal-close:hover { color: #ffffff !important; }
      .tb-modal-body {
        padding: 24px 20px !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        text-align: center !important;
      }
      .tb-qr-box {
        background: #ffffff !important;
        padding: 12px !important;
        border-radius: 16px !important;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
        margin-bottom: 16px !important;
      }
      .tb-qr-box img { width: 190px !important; height: 190px !important; display: block !important; }
      .tb-qr-desc { font-size: 13px !important; color: #94a3b8 !important; line-height: 1.5 !important; margin: 0 0 16px 0 !important; }
      .tb-qr-desc strong { color: #10b981 !important; }
      .tb-qr-link-box {
        display: flex !important;
        width: 100% !important;
        background: rgba(0, 0, 0, 0.4) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 10px !important;
        overflow: hidden !important;
      }
      .tb-qr-link-box input {
        flex: 1 !important;
        background: transparent !important;
        border: none !important;
        color: #94a3b8 !important;
        font-size: 12px !important;
        padding: 8px 10px !important;
        outline: none !important;
      }
      .tb-btn-copy {
        background: #10b981 !important;
        border: none !important;
        color: #ffffff !important;
        font-size: 12px !important;
        font-weight: 600 !important;
        padding: 8px 12px !important;
        cursor: pointer !important;
        white-space: nowrap !important;
      }
      .tb-btn-copy:hover { background: #059669 !important; }

      @media (max-width: 1320px) {
        .tb-theme-name { max-width: 130px !important; }
        .tb-btn-label { display: none !important; }
      }
      @media (max-width: 1100px) {
        .tb-theme-name, .tb-sep { display: none !important; }
      }
    `;

    // Nếu ở chế độ simulator, thêm CSS khung điện thoại và canvas
    if (isSimulator) {
      css += `
        #mvRoot {
          display: flex !important;
          flex-direction: column !important;
          width: 100vw !important;
          height: 100vh !important;
          overflow: hidden !important;
        }
        #mvStage {
          flex: 1 !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          background: #070a12 !important;
          background-image: radial-gradient(rgba(255, 255, 255, 0.07) 1.2px, transparent 1.2px) !important;
          background-size: 24px 24px !important;
          overflow: hidden !important;
          padding: 12px !important;
          position: relative !important;
        }
        #mvDeviceContainer {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          gap: 10px !important;
          margin: auto !important;
          transition: transform 0.2s ease, margin 0.2s ease !important;
        }
        .mv-phone-body {
          position: relative !important;
          width: 393px !important;
          height: 852px !important;
          background: #141a27 !important;
          border: 11px solid #1a2233 !important;
          border-radius: 50px !important;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12), 0 25px 70px -15px rgba(0, 0, 0, 0.9), 0 10px 25px rgba(0, 0, 0, 0.5) !important;
          display: flex !important;
          flex-direction: column !important;
          overflow: hidden !important;
          transform-origin: center center !important;
          transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.3s ease !important;
        }
        .mv-hardware-btn { position: absolute !important; background: #2b364e !important; border-radius: 4px !important; }
        .mv-btn-volume-up { left: -14px !important; top: 115px !important; width: 3px !important; height: 52px !important; }
        .mv-btn-volume-down { left: -14px !important; top: 180px !important; width: 3px !important; height: 52px !important; }
        .mv-btn-power { right: -14px !important; top: 135px !important; width: 3px !important; height: 75px !important; }
        .mv-phone-screen {
          position: relative !important;
          width: 100% !important;
          height: 100% !important;
          background: #ffffff !important;
          border-radius: 38px !important;
          overflow: hidden !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .mv-notch {
          position: absolute !important;
          top: 9px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          width: 115px !important;
          height: 27px !important;
          background: #000000 !important;
          border-radius: 20px !important;
          z-index: 10 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: flex-end !important;
          padding-right: 14px !important;
          gap: 6px !important;
          pointer-events: none !important;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3) !important;
        }
        .mv-notch-camera { width: 9px !important; height: 9px !important; border-radius: 50% !important; background: #0f172a !important; border: 1px solid #1e293b !important; }
        .mv-notch-speaker { width: 4px !important; height: 4px !important; border-radius: 50% !important; background: #1e293b !important; }
        #mvIframe { width: 100% !important; height: 100% !important; border: none !important; background: #ffffff !important; flex: 1 !important; }
        .mv-home-indicator {
          position: absolute !important;
          bottom: 7px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          width: 130px !important;
          height: 4.5px !important;
          background: rgba(0, 0, 0, 0.25) !important;
          border-radius: 10px !important;
          z-index: 10 !important;
          pointer-events: none !important;
        }
        #mvDimensionBadge {
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          color: #94a3b8 !important;
          background: rgba(15, 23, 42, 0.7) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          padding: 3px 10px !important;
          border-radius: 999px !important;
        }
      `;
    } else {
      document.body.classList.add('tb-has-docked');
    }

    var styleTag = document.createElement('style');
    styleTag.id = 'theme-toolbar-styles';
    styleTag.innerHTML = css;
    document.head.appendChild(styleTag);
  }

  // Khởi chạy khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToolbar);
  } else {
    initToolbar();
  }
})();
