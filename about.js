/*!
 * กล่อง "เกี่ยวกับงาน DSDS / ติดต่อทีมงาน" — ไฟล์กลางไฟล์เดียว ทุกระบบของโรงเรียนปากช่องใช้หน้าตาเดียวกัน
 * https://pcschool-dev.github.io/dsds/about.js
 * ต้นแบบ = AboutDsds ในระบบรับหนังสือราชการ (DOC)
 *
 * ปกติไม่ต้องใส่เอง: เมนูรวม sysmenu.js (1.4.0+) มีปุ่ม "ติดต่อทีมงาน DSDS" ท้ายแผง กดแล้วโหลดไฟล์นี้ให้
 * อยากเปิดจากปุ่มของระบบเอง: ใส่ data-dsds-about ที่ปุ่ม หรือเรียก DSDSAbout.open()
 *   (ถ้ายังไม่โหลด about.js เรียก DSDSMenu.about() แทน — sysmenu โหลดให้)
 *
 * แถว "สถานะ LINE" ต่อระบบ — ระบบบอกเองว่าผู้ใช้คนนี้เชื่อม LINE ของระบบนั้นแล้วหรือยัง (ไม่บอก = ไม่แสดงแถว)
 *   window.DSDS_ABOUT = { line: function () { ... } }          // ตั้งก่อนโหลดก็ได้
 *   DSDSAbout.set({ line: function () { ... } })              // หรือตั้งทีหลัง (หลังล็อกอิน)
 *   ฟังก์ชันถูกเรียกทุกครั้งที่เปิดกล่อง คืนค่า:
 *     null / undefined                          -> ไม่แสดงแถว (ยังไม่ล็อกอิน / ระบบนี้ไม่มี LINE)
 *     { linked: true,  text: 'มีงานถึงคุณเมื่อไร LINE แจ้งทันที' }
 *     { linked: false, text: 'รับแจ้งเตือนทาง LINE', sub: 'คุณยังไม่ได้เชื่อม …', connect: function () { เปิดขั้นตอนเชื่อมของระบบ } }
 * หน้าสโลแกน (เต็มจอ ~2.6 วิ แล้วเฟด แตะข้ามได้): sysmenu เรียกเองครั้งแรกของวัน (จำต่อเว็บ) ;
 *   หลังออกจากระบบ ให้ระบบเรียก DSDSMenu.splash() (หรือ DSDSAbout.splash({force:true})) ; ปิดในระบบนั้น: DSDS_ABOUT = { splash: false }
 *   ตัวเลือกอื่นใน set(): tip (ข้อความเคล็ดลับแจ้งปัญหาท้ายกล่อง ต่อระบบ) , contact (ลิงก์ LINE ติดต่อ แทนค่าเริ่มต้น)
 */
(function () {
  'use strict';
  if (window.DSDSAbout) return;

  var CONTACT = 'https://pcschool-dev.github.io/dsds/line.html';   // หน้าลิงก์ถาวร เลือก OA ที่ยังว่างให้เอง
  var ICONS_CSS = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css';
  var VISION = ['ระบบดิจิทัลไร้รอยต่อ', 'ใช้ง่าย', 'ทุกคนเข้าถึงได้', 'ลดกระดาษ', 'ลดภาระครู', 'และใช้ข้อมูลพัฒนาโรงเรียน'];
  var TIP = 'แจ้งปัญหาให้แก้ได้เร็ว: บอกว่ากำลังทำอะไรอยู่ แนบภาพหน้าจอ และบอกชื่อระบบที่ใช้';
  var cfg = {};
  (function (o) { if (o && typeof o === 'object') for (var k in o) cfg[k] = o[k]; })(window.DSDS_ABOUT);

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  var okUrl = function (u) { return /^https:\/\/[^\s"'<>]+$/.test(String(u || '')); };

  // ทุก selector อยู่ใต้ .dsa- กันชนกับ CSS ของระบบ ; dark ตาม html[data-theme|data-bs-theme] เหมือน sysmenu
  var D = 'html[data-theme="dark"] ', B = 'html[data-bs-theme="dark"] ';
  function dk(sel, rule) { return D + sel + ', ' + B + sel + ' { ' + rule + ' }'; }
  var CSS = [
    '.dsa-root, .dsa-root * { box-sizing: border-box; }',
    '.dsa-root { position: fixed; inset: 0; z-index: 2147483200; display: flex; align-items: center; justify-content: center; padding: 16px;',
    '  font-family: inherit; font-size: 16px; line-height: 1.4; text-align: center; }',
    '.dsa-scrim { position: absolute; inset: 0; background: rgba(15,23,42,.5); opacity: 0; transition: opacity .2s; }',
    '.dsa-box { position: relative; width: 100%; max-width: 460px; max-height: calc(100vh - 32px); overflow-y: auto; overscroll-behavior: contain;',
    '  background: #fff; color: #0f172a; border-radius: 20px; padding: 26px 22px 20px; box-shadow: 0 24px 60px rgba(15,23,42,.3);',
    '  transform: translateY(10px) scale(.98); opacity: 0; transition: transform .2s, opacity .2s; }',
    '.dsa-root.is-in .dsa-scrim { opacity: 1; } .dsa-root.is-in .dsa-box { transform: none; opacity: 1; }',
    '.dsa-x { position: absolute; top: 10px; right: 10px; width: 36px; height: 36px; border: 0; border-radius: 10px; background: transparent;',
    '  color: #94a3b8; font-size: 1rem; cursor: pointer; display: grid; place-items: center; }',
    '.dsa-x:hover, .dsa-x:focus-visible { background: #f1f5f9; color: #0f172a; outline: none; }',
    '.dsa-badge { width: 60px; height: 60px; border-radius: 50%; margin: 2px auto 14px; display: grid; place-items: center; color: #fff; font-size: 1.6rem;',
    '  background: linear-gradient(135deg, #3b82f6, #1d4ed8); box-shadow: 0 8px 20px rgba(59,130,246,.28); }',
    '.dsa-title { font-size: 1.22rem; font-weight: 800; line-height: 1.3; margin: 0; color: inherit; white-space: nowrap; }',   // บรรทัดเดียวเสมอ ; fitTitle ย่อตัวอักษรเมื่อจอแคบ
    '.dsa-sub { font-size: .86rem; color: #64748b; margin-top: 5px; line-height: 1.5; }',
    '.dsa-vision { margin: 14px 0 12px; padding: 11px 14px; border-radius: 13px; background: #eff6ff; border: 1px solid #bfdbfe;',
    '  color: #1e3a8a; font-weight: 700; font-size: .95rem; line-height: 1.55; }',
    '.dsa-vision > span { white-space: nowrap; }',
    '.dsa-vision small { display: block; font-size: .72rem; font-weight: 600; color: #64748b; margin-bottom: 2px; }',
    '.dsa-list { display: flex; flex-direction: column; gap: 7px; text-align: left; margin-bottom: 12px; }',
    '.dsa-item { display: flex; align-items: center; gap: 11px; width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 12px;',
    '  background: #fff; color: #0f172a !important; text-decoration: none !important; font: inherit; text-align: left; margin: 0; }',
    'button.dsa-item, a.dsa-item { cursor: pointer; }',
    'button.dsa-item:hover, a.dsa-item:hover, button.dsa-item:focus-visible, a.dsa-item:focus-visible { background: #eff6ff; border-color: #bfdbfe; outline: none; }',
    '.dsa-ic { flex: none; width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; color: #fff; font-size: 1.05rem;',
    '  background: linear-gradient(135deg, #4f46e5, #2563eb); }',
    '.dsa-line .dsa-ic { background: #06c755; }',
    '.dsa-ok .dsa-ic { background: #dcfce7; color: #16a34a; }',
    '.dsa-tx { min-width: 0; flex: 1; }',
    '.dsa-tx b { display: block; font-size: .92rem; font-weight: 600; }',
    '.dsa-tx small { display: block; font-size: .78rem; color: #64748b; line-height: 1.45; }',
    '.dsa-go { margin-left: auto; flex: none; color: #94a3b8; font-size: .85rem; }',
    '.dsa-note { display: flex; gap: 8px; text-align: left; font-size: .78rem; color: #64748b; line-height: 1.5;',
    '  padding: 10px 12px; border-radius: 12px; background: #f8fafc; margin-bottom: 14px; }',
    '.dsa-note > i { color: #94a3b8; margin-top: 1px; flex: none; }',
    '.dsa-close { min-width: 120px; min-height: 42px; padding: 0 22px; border: 0; border-radius: 12px; font: inherit; font-weight: 600;',
    '  background: #3b63e0; color: #fff; cursor: pointer; }',   // สีเดียวกับปุ่มปิดของ DOC
    '.dsa-close:focus-visible { outline: 3px solid rgba(37,99,235,.35); outline-offset: 2px; }',
    'html.dsa-open { overflow: hidden; }',
    '@media (prefers-reduced-motion: reduce) { .dsa-scrim, .dsa-box { transition: none; } }',
    dk('.dsa-scrim', 'background: rgba(0,0,0,.6);'),
    dk('.dsa-box', 'background: #161b24; color: #e8effc; box-shadow: 0 24px 60px rgba(0,0,0,.55);'),
    dk('.dsa-x:hover', 'background: #202631; color: #e8effc;'),
    dk('.dsa-sub', 'color: #acb4c0;'),
    dk('.dsa-vision', 'background: #202631; border-color: #2d3948; color: #8faff9;'),
    dk('.dsa-vision small', 'color: #acb4c0;'),
    dk('.dsa-item', 'background: #1b212b; border-color: #282f3a; color: #e8effc !important;'),
    dk('button.dsa-item:hover, ' + D + 'a.dsa-item:hover', 'background: #202631; border-color: #2d3948;'),
    dk('.dsa-tx small', 'color: #9aa6b8;'),
    dk('.dsa-line .dsa-ic', 'background: #20ac4d;'),
    dk('.dsa-ok .dsa-ic', 'background: #173a26; color: #4ade80;'),
    dk('.dsa-note', 'background: #1b212b; color: #9aa6b8;'),
    dk('.dsa-go', 'color: #5b6678;'),
    // ----- หน้าสโลแกน (splash) -----
    '.dsa-splash { position: fixed; inset: 0; z-index: 2147483300; display: flex; flex-direction: column; align-items: center; justify-content: center;',
    '  padding: 24px 20px; text-align: center; font-family: inherit; line-height: 1.4; cursor: pointer; -webkit-tap-highlight-color: transparent;',
    '  background: radial-gradient(120% 80% at 50% 0%, #e0ebff 0%, #f4f7fd 55%, #ffffff 100%); color: #0f172a; opacity: 1; transition: opacity .6s ease; }',
    '.dsa-splash.is-out { opacity: 0; pointer-events: none; }',
    '.dsa-splash > * { opacity: 0; transform: translateY(8px); animation: dsaUp .55s ease forwards; }',
    '.dsa-splash .dsa-badge { width: 76px; height: 76px; font-size: 2rem; margin-bottom: 18px; animation-delay: .05s; }',
    '.dsa-splash .dsa-title { font-size: 1.6rem; max-width: 100%; animation-delay: .18s; }',
    '.dsa-splash .dsa-sub { font-size: .9rem; max-width: 420px; animation-delay: .28s; }',
    '.dsa-splash .dsa-vision { max-width: 440px; margin: 20px 0 0; font-size: clamp(1rem, 4.2vw, 1.15rem); animation-delay: .45s; }',
    '.dsa-skip { position: absolute; bottom: calc(18px + env(safe-area-inset-bottom, 0px)); left: 0; right: 0; font-size: .75rem; color: #94a3b8; animation-delay: .9s !important; }',
    '@keyframes dsaUp { to { opacity: 1; transform: none; } }',
    '@media (prefers-reduced-motion: reduce) { .dsa-splash > * { animation: none; opacity: 1; transform: none; } .dsa-splash { transition-duration: .2s; } }',
    dk('.dsa-splash', 'background: radial-gradient(120% 80% at 50% 0%, #1c2740 0%, #10151e 60%, #0b0f16 100%); color: #e8effc;'),
    '@media print { .dsa-splash, .dsa-root { display: none !important; } }'
  ].join('\n');

  var root = null, lastFocus = null, act = null;

  function ensureStyle() {
    if (document.getElementById('dsa-style')) return;
    if (!document.querySelector('link[href*="bootstrap-icons"]')) {
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = ICONS_CSS; document.head.appendChild(l);
    }
    var st = document.createElement('style'); st.id = 'dsa-style'; st.textContent = CSS; document.head.appendChild(st);
  }
  function row(tag, attrs, cls, icon, t, sub, go) {
    return '<' + tag + ' ' + attrs + ' class="dsa-item' + (cls ? ' ' + cls : '') + '">' +
      '<span class="dsa-ic"><i class="bi ' + icon + '" aria-hidden="true"></i></span>' +
      '<span class="dsa-tx"><b>' + esc(t) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span>' +
      (go ? '<i class="bi ' + go + ' dsa-go" aria-hidden="true"></i>' : '') + '</' + tag + '>';
  }
  function lineState() {
    var f = cfg.line, v = null;
    try { v = typeof f === 'function' ? f() : f; } catch (e) { v = null; }
    return v && typeof v === 'object' ? v : null;
  }
  function html() {
    var contact = okUrl(cfg.contact) ? cfg.contact : CONTACT;
    var L = lineState(), lineRow = '';
    if (L && L.linked) {
      lineRow = row('div', '', 'dsa-ok', 'bi-check-lg', L.title || 'เชื่อม LINE แล้ว', L.text || 'มีเรื่องถึงคุณเมื่อไร LINE แจ้งทันที', '');
    } else if (L && typeof L.connect === 'function') {
      lineRow = row('button', 'type="button" data-dsa="line"', 'dsa-line', 'bi-bell-fill', L.text || 'รับแจ้งเตือนทาง LINE',
        L.sub || 'คุณยังไม่ได้เชื่อม — เชื่อมครั้งเดียวไม่ถึง 1 นาที มีเรื่องถึงคุณเมื่อไร LINE บอกทันที', 'bi-chevron-right');
    }
    return '<div class="dsa-scrim" data-dsa="close"></div>' +
      '<div class="dsa-box" role="dialog" aria-modal="true" aria-labelledby="dsaTitle">' +
      '<button type="button" class="dsa-x" data-dsa="close" aria-label="ปิด"><i class="bi bi-x-lg"></i></button>' +
      '<div class="dsa-badge"><i class="bi bi-cpu" aria-hidden="true"></i></div>' +
      '<h2 class="dsa-title" id="dsaTitle">งานพัฒนาและบริการระบบดิจิทัลโรงเรียน</h2>' +
      '<div class="dsa-sub">Digital System Development and Services in School (DSDS)</div>' +
      '<div class="dsa-vision"><small>เราตั้งใจทำให้…</small>' +
        VISION.map(function (w) { return '<span>' + w + '</span>'; }).join(' ') + '</div>' +   // วลีไม่ถูกตัดกลางคำ
      '<div class="dsa-list">' +
        row('a', 'href="' + esc(contact) + '" target="_blank" rel="noopener"', 'dsa-line', 'bi-line', 'ติดต่อ / ขอความช่วยเหลือ',
          'LINE งานพัฒนาและบริการระบบดิจิทัล · เรื่องเร่งด่วนตอบภายใน 1 วันทำการ', 'bi-box-arrow-up-right') +
        (window.DSDSMenu ? row('button', 'type="button" data-dsa="sys"', '', 'bi-grid-3x3-gap', 'ระบบอื่นของโรงเรียน',
          'รวมทุกระบบที่งานดิจิทัลดูแล ในเมนูเดียว', 'bi-chevron-right') : '') +
        lineRow +
      '</div>' +
      '<div class="dsa-note"><i class="bi bi-lightbulb" aria-hidden="true"></i><div>' + esc(cfg.tip || TIP) + '</div></div>' +
      '<button type="button" class="dsa-close" data-dsa="close">ปิด</button>' +
      '</div>';
  }

  // ชื่องานบรรทัดเดียว: ย่อตัวอักษรจนพอดีกล่อง (ไม่ต่ำกว่า 12px) — วัดจริงเพราะความกว้างฟอนต์ไทยต่างกันแต่ละระบบ
  function fitTitle(el) {
    if (!el) return;
    el.style.fontSize = '';
    var room = el.clientWidth, fs = parseFloat(getComputedStyle(el).fontSize);
    for (var i = 0; i < 8 && room > 0 && el.scrollWidth > room && fs > 12; i++) {
      fs = Math.max(12, Math.floor(fs * room / el.scrollWidth * 10) / 10 - .2);
      el.style.fontSize = fs + 'px';
    }
  }
  function fitAll() { if (root) fitTitle(root.querySelector('.dsa-title')); if (splashEl) fitTitle(splashEl.querySelector('.dsa-title')); }
  window.addEventListener('resize', fitAll);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);

  function close() {
    if (!root) return;
    var r = root; root = null;
    document.documentElement.classList.remove('dsa-open');
    document.removeEventListener('keydown', onKey, true);
    r.classList.remove('is-in');
    setTimeout(function () { if (r.parentNode) r.parentNode.removeChild(r); }, 200);
    var a = act, L = lineState(); act = null;
    if (a === 'line' && L && typeof L.connect === 'function') { try { L.connect(); } catch (e) {} return; }
    if (a === 'sys' && window.DSDSMenu) { window.DSDSMenu.open(); return; }
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }
  function onKey(e) {
    if (!root) return;
    if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
    if (e.key === 'Tab') {   // วนโฟกัสอยู่ในกล่อง
      var f = root.querySelectorAll('a[href],button'); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  function open() {
    if (root) return;
    if (window.DSDSMenu && window.DSDSMenu.close) window.DSDSMenu.close();
    ensureStyle();
    lastFocus = document.activeElement; act = null;
    root = document.createElement('div'); root.className = 'dsa-root'; root.innerHTML = html();
    root.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-dsa]'); if (!b) return;
      var k = b.getAttribute('data-dsa');
      if (k === 'line' || k === 'sys') act = k;
      close();
    });
    document.body.appendChild(root);
    fitTitle(root.querySelector('.dsa-title'));
    document.documentElement.classList.add('dsa-open');
    document.addEventListener('keydown', onKey, true);
    requestAnimationFrame(function () { if (root) { root.classList.add('is-in'); root.querySelector('.dsa-close').focus({ preventScroll: true }); } });
  }

  // ===== หน้าสโลแกน: ครั้งแรกของวัน (ต่อเว็บ) + หลังออกจากระบบ (ระบบเรียก splash({force:true})) แล้วเฟดหาย =====
  // PEND (sessionStorage): ยังโชว์ไม่ครบแต่หน้าเปลี่ยนไปก่อน (ออกจากระบบ -> หน้า login โหลดใหม่) -> หน้าถัดไปในแท็บเดิมโชว์ต่อ
  var DAY_KEY = 'dsds.splash.day', PEND = 'dsds.splash.pending', splashEl = null;
  function pend(v) { try { if (v) sessionStorage.setItem(PEND, '1'); else sessionStorage.removeItem(PEND); } catch (e) {} }
  function today() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function splash(o) {
    o = o || {};
    if (splashEl || cfg.splash === false) return false;
    var seen = null; try { seen = localStorage.getItem(DAY_KEY); } catch (e) {}
    if (!o.force && seen === today()) return false;
    try { localStorage.setItem(DAY_KEY, today()); } catch (e) {}
    pend(true);
    ensureStyle();
    var el = splashEl = document.createElement('div');
    el.className = 'dsa-splash'; el.setAttribute('role', 'status'); el.setAttribute('aria-label', 'งานพัฒนาและบริการระบบดิจิทัลโรงเรียน');
    el.innerHTML = '<div class="dsa-badge"><i class="bi bi-cpu" aria-hidden="true"></i></div>' +
      '<div class="dsa-title">งานพัฒนาและบริการระบบดิจิทัลโรงเรียน</div>' +
      '<div class="dsa-sub">Digital System Development and Services in School (DSDS)</div>' +
      '<div class="dsa-vision"><small>เราตั้งใจทำให้…</small>' + VISION.map(function (w) { return '<span>' + w + '</span>'; }).join(' ') + '</div>' +
      '<div class="dsa-skip">แตะเพื่อข้าม</div>';
    var done = false;
    function out() {
      if (done) return; done = true;
      pend(false);
      el.classList.add('is-out');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); if (splashEl === el) splashEl = null; }, 650);
    }
    el.addEventListener('click', out);
    document.addEventListener('keydown', function k(e) { document.removeEventListener('keydown', k, true); out(); }, true);
    (document.body || document.documentElement).appendChild(el);
    fitTitle(el.querySelector('.dsa-title'));
    // นับเวลาหลังหน้าโหลดเสร็จ (หน้า login มาครบอยู่ข้างใต้) ค้างพออ่านสโลแกนจบ แล้วเฟด .6 วิ
    var hold = Math.max(800, Number(o.ms) || 2800);
    if (document.readyState === 'complete') setTimeout(out, hold);
    else window.addEventListener('load', function () { setTimeout(out, hold); });
    return true;
  }

  // ปุ่มของระบบเองที่ใส่ data-dsds-about (รวมปุ่มที่สร้างทีหลัง)
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('[data-dsds-about]');
    if (b) { e.preventDefault(); open(); }
  });

  window.DSDSAbout = {
    open: open, close: close, splash: splash,
    set: function (o) { if (o && typeof o === 'object') for (var k in o) cfg[k] = o[k]; },
    version: '1.0.0'
  };
})();
