/* ปุ่ม "สอบถาม / ข่าวสาร LINE" ลอยมุมจอ สำหรับใส่ทุกระบบของโรงเรียนปากช่อง
 * ใส่บรรทัดเดียวท้าย <body>:
 *   <script src="https://pcschool-dev.github.io/dsds/linefaq.js" defer></script>
 * ปุ่มชี้ไปหน้าลิงก์ถาวร ซึ่งเลือก OA ที่ยังว่างให้เอง (OA เต็มก็ไม่ต้องแก้ระบบ)
 * ตั้งค่าได้ก่อนโหลดสคริปต์: window.LINEFAQ = { position: 'left', hide: false }
 *
 * ไม่บังแถบเมนูล่าง: หาแถบที่ติดขอบล่างจอ (position fixed/sticky กว้างเกินครึ่งจอ) แล้วยกปุ่มขึ้นเหนือแถบเอง
 * — ระบบประเมินครู/HR/EMS บนมือถือมีแถบเมนูล่าง ปุ่มเคยทับเมนู "ภาพรวม/ผลของฉัน"
 * ปุ่ม × ย่อเหลือวงกลม LINE เล็ก ๆ (ยังกดถามได้) จำไว้ในเครื่องต่อเว็บ */
(function () {
  if (window.__lineFaqLoaded) return; window.__lineFaqLoaded = true;
  var cfg = window.LINEFAQ || {};
  if (cfg.hide) return;
  var PAGE = cfg.page || 'https://pcschool-dev.github.io/dsds/line.html';
  var KEY = 'dsds.linefaq.mini';
  var side = cfg.position === 'left' ? 'left' : 'right';
  var mini = false;
  try { mini = localStorage.getItem(KEY) === '1'; } catch (e) { }
  var LOGO = '<span style="display:grid;place-items:center;width:26px;height:26px;border-radius:7px;background:#fff;color:#06C755;font:800 9px sans-serif">LINE</span>';

  function mount() {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;bottom:calc(16px + env(safe-area-inset-bottom,0px));' + side + ':16px;z-index:2147483000;' +
      'display:flex;align-items:center;transition:bottom .2s';
    var a = document.createElement('a');
    a.href = PAGE; a.target = '_blank'; a.rel = 'noopener';
    a.setAttribute('aria-label', 'สอบถามและรับข่าวสารทาง LINE');
    var x = document.createElement('button');
    x.type = 'button'; x.textContent = '×';
    x.setAttribute('aria-label', 'ย่อปุ่ม LINE');
    x.style.cssText = 'margin-' + (side === 'right' ? 'left' : 'right') + ':-10px;width:28px;height:28px;border-radius:50%;border:2px solid #fff;' +
      'background:#1f2937;color:#fff;font:700 16px/1 system-ui,sans-serif;cursor:pointer;padding:0;box-shadow:0 2px 8px rgba(0,0,0,.25);' +
      'display:grid;place-items:center;order:' + (side === 'right' ? '2' : '0');
    a.style.order = '1';

    function render() {
      a.innerHTML = mini ? LOGO : LOGO + '<span>สอบถาม / ข่าวสาร</span>';
      a.title = mini ? 'สอบถาม / ข่าวสาร LINE' : '';
      a.style.cssText = 'order:1;display:flex;align-items:center;gap:8px;border-radius:999px;background:#06C755;color:#fff;' +
        'font:600 14px/1 "Sarabun",system-ui,sans-serif;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.18);' +
        (mini ? 'padding:8px' : 'padding:8px 14px 8px 8px');
      x.style.display = mini ? 'none' : 'grid';
    }
    x.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      mini = true; render(); lift();
      try { localStorage.setItem(KEY, '1'); } catch (er) { }
    });

    /* ความสูงของแถบที่ติดขอบล่างจอ (เมนูล่าง/แถบปุ่มบันทึก) — 0 = ไม่มี */
    function bottomBar() {
      var h = 0, vw = window.innerWidth, vh = window.innerHeight;
      var els = document.body.querySelectorAll('nav,footer,[class*="nav"],[class*="bar"],[class*="tab"],[class*="bottom"],[role="navigation"],[role="tablist"]');
      for (var i = 0; i < els.length && i < 400; i++) {
        var el = els[i];
        if (wrap.contains(el)) continue;
        var cs = getComputedStyle(el);
        if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        var r = el.getBoundingClientRect();
        if (r.width < vw * 0.5 || r.height < 24 || r.height > 160) continue;
        if (Math.abs(r.bottom - vh) > 4) continue;
        h = Math.max(h, vh - r.top);
      }
      return h;
    }
    function lift() {
      var h = bottomBar();
      wrap.style.bottom = h ? (h + 10) + 'px' : 'calc(16px + env(safe-area-inset-bottom,0px))';
    }

    render();
    wrap.appendChild(a); wrap.appendChild(x);
    document.body.appendChild(wrap);
    lift();
    // หน้าแอปสร้างเมนูล่างทีหลัง (หลังเข้าสู่ระบบ/สลับหน้า) — ตรวจซ้ำเป็นระยะแบบเบา ๆ
    window.addEventListener('resize', lift);
    [600, 1500, 4000].forEach(function (t) { setTimeout(lift, t); });
    setInterval(lift, 3000);
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
