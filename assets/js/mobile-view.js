/**
 * Legacy wrapper: Tự động chuyển tiếp sang thư viện dùng chung themes/libs/theme-toolbar.js
 * Giúp tương thích ngược hoàn hảo cho các trang còn gọi mobile-view.js
 */
(function() {
  if (window.__THEME_TOOLBAR_INITIALIZED__) return;
  var script = document.createElement('script');
  var isInTheme = window.location.pathname.includes('/theme');
  script.src = (isInTheme ? '../../' : '') + 'libs/theme-toolbar.js';
  script.defer = true;
  document.head.appendChild(script);
})();
