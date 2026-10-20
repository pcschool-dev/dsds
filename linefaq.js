/* ปุ่ม "สอบถาม / ข่าวสาร LINE" ลอยมุมจอ สำหรับใส่ทุกระบบของโรงเรียนปากช่อง
 * ใส่บรรทัดเดียวท้าย <body>:
 *   <script src="https://pcschool-dev.github.io/dsds/linefaq.js" defer></script>
 * ปุ่มชี้ไปหน้าลิงก์ถาวร ซึ่งเลือก OA ที่ยังว่างให้เอง (OA เต็มก็ไม่ต้องแก้ระบบ)
 * ตั้งค่าได้ก่อนโหลดสคริปต์: window.LINEFAQ = { position: 'left', hide: false } */
(function () {
  if (window.__lineFaqLoaded) return; window.__lineFaqLoaded = true;
  var cfg = window.LINEFAQ || {};
  if (cfg.hide) return;
  var PAGE = cfg.page || 'https://pcschool-dev.github.io/dsds/line.html';
  function mount() {
    var a = document.createElement('a');
    a.href = PAGE; a.target = '_blank'; a.rel = 'noopener';
    a.setAttribute('aria-label', 'สอบถามและรับข่าวสารทาง LINE');
    a.innerHTML = '<span style="display:grid;place-items:center;width:26px;height:26px;border-radius:7px;background:#fff;color:#06C755;font:800 9px sans-serif">LINE</span>' +
      '<span>สอบถาม / ข่าวสาร</span>';
    var side = cfg.position === 'left' ? 'left' : 'right';
    a.style.cssText = 'position:fixed;bottom:calc(16px + env(safe-area-inset-bottom,0px));' + side + ':16px;z-index:2147483000;' +
      'display:flex;align-items:center;gap:8px;padding:8px 14px 8px 8px;border-radius:999px;background:#06C755;color:#fff;' +
      'font:600 14px/1 "Sarabun",system-ui,sans-serif;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.18)';
    document.body.appendChild(a);
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
