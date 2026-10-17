/*!
 * หน้าเตือน "โปรดเปิดด้วยเบราว์เซอร์ภายนอก" ของโรงเรียนปากช่อง (ทีม DSDS) — ไฟล์กลางไฟล์เดียว ทุกเว็บดึงไปใช้
 * https://pcschool-dev.github.io/dsds/fbgate.js
 *
 * ทำไม: เบราว์เซอร์ในแอป Facebook / Instagram / Messenger เปิดเว็บแอป Apps Script ไม่ขึ้น (หน้าขาว)
 *       ไฟล์นี้ตรวจจาก userAgent แล้วขึ้นหน้าเตือนเต็มจอ: ปุ่มเปิดใน Chrome (Android) / Safari (iPhone) + คัดลอกลิงก์ + วิดีโอสอน
 *       เปิดในเบราว์เซอร์ปกติ (รวม ?fbclid= ที่ติดมาจากลิงก์ Facebook) = ไม่ทำอะไรเลย
 *
 * ใส่ในเว็บ (บรรทัดเดียว ไว้ใน <head> หรือต้น <body> — ไม่ใส่ defer เพื่อให้ตัดสินก่อนโค้ดของหน้า):
 *   <script src="https://pcschool-dev.github.io/dsds/fbgate.js"></script>
 *
 * หน้าครอบที่โหลด iframe / มีทางสำรองพาไป /exec เต็มแท็บ ควรข้ามการโหลดเมื่อถูกกั้น (ไม่งั้นทางสำรองพาออกไปหน้าขาว):
 *   if (window.DSDSFbGate && DSDSFbGate.blocked) { ...ไม่ต้องโหลดแอป... }
 *
 * ตัวเลือก (attribute ของ <script>):
 *   data-auto    "0" = Android ไม่ต้องลองพาไป Chrome เอง (ค่าเริ่มต้นลองหนึ่งครั้ง)
 *   data-accent  สีหลัก (ปุ่ม/ไอคอน) เช่น "#7a2e3a"   data-grad  สีแถบหัว เช่น "linear-gradient(135deg,#7a2e3a,#a3485a)"
 * ทดสอบในเบราว์เซอร์ปกติ: ต่อ ?fbgate=1 (หน้าตาแบบ iPhone) หรือ ?fbgate=android ท้าย URL
 */
(function () {
  'use strict';
  if (window.DSDSFbGate) return;

  var BASE = 'https://pcschool-dev.github.io/dsds/';
  var VIDEO = BASE + 'fbgate.mp4';
  var LOGO = 'https://lh5.googleusercontent.com/d/1Q28ttbihnvUUF-kEBwdEj04kVyQ8h0n-';

  var me = document.currentScript || (function () {
    var s = document.querySelectorAll('script[src*="fbgate.js"]'); return s[s.length - 1];
  })();
  var opt = function (k) { return me ? me.getAttribute('data-' + k) : null; };

  var ua = navigator.userAgent || '';
  var force = '';
  try { force = new URLSearchParams(location.search).get('fbgate') || ''; } catch (e) { }
  var inApp = /FBAN|FBAV|FB_IAB|FBIOS|FB4A|Instagram|Messenger/i.test(ua) || !!force;
  window.DSDSFbGate = { blocked: inApp, version: '1.2.0' };
  if (!inApp) return;

  var isAndroid = force ? force === 'android' : /Android/i.test(ua);
  var url = new URL(location.href);
  url.searchParams.delete('fbclid');
  url.searchParams.delete('fbgate');
  var cleanUrl = url.toString();
  var openUrl = isAndroid
    // intent:// = เบราว์เซอร์หลักของเครื่อง (ส่วนใหญ่ Chrome) ; ไม่มีแอปรับ -> fallback ลิงก์เดิม
    ? 'intent://' + url.host + url.pathname + url.search +
      '#Intent;scheme=https;action=android.intent.action.VIEW;S.browser_fallback_url=' + encodeURIComponent(cleanUrl) + ';end'
    // x-safari-https:// = เปิดใน Safari (iOS 17 ขึ้นไป) ; รุ่นเก่ากดแล้วไม่เกิดอะไร -> ใช้เมนู ⋯ หรือคัดลอกลิงก์
    : 'x-safari-' + cleanUrl;

  // ชุดสี/แบบหน้าตา: data-theme="maroon" (ค่าเริ่มต้น เลือดหมู-ทอง) | "red" | "navy" | "clean" | "bold" | "indigo" (ทดสอบ: ?fbtheme=)
  var THEMES = {
    indigo: { acc: '#4338ca', grad: 'linear-gradient(135deg,#312e81 0%,#4338ca 55%,#6366f1 100%)', soft: '#eef2ff', line: '#c7d2fe', glow: 'rgba(67,56,202,.45)', bg: '#f1f4fb', css: '' },
    // ก: หัวแดงเข้มไล่สี + เส้นทอง การ์ดขาวลอย
    red: { acc: '#b91c1c', grad: 'linear-gradient(135deg,#6b0f14 0%,#a3141c 50%,#d42a2a 100%)', soft: '#fef2f2', line: '#fecaca', glow: 'rgba(185,28,28,.4)', bg: '#faf5f5', css: '' },
    // กรมท่า-ขาว: น้ำเงินเข้มแบบหน่วยงานราชการ + เส้นทอง
    navy: { acc: '#1e3a8a', grad: 'linear-gradient(135deg,#0b1f4d 0%,#1e3a8a 55%,#2f56b0 100%)', soft: '#eff4ff', line: '#c9d7f5', glow: 'rgba(30,58,138,.4)', bg: '#f4f6fb', css: '' },
    // เลือดหมู-ทอง: แดงเลือดหมูสุภาพ ปุ่มหลักเลือดหมู ขอบ/เลขขั้นตอนสีทอง
    maroon: { acc: '#7a1f2b', grad: 'linear-gradient(135deg,#3f0d14 0%,#6e1824 55%,#94303b 100%)', soft: '#fbf3e4', line: '#ecd29c', glow: 'rgba(122,31,43,.38)', bg: '#faf7f2',
      css: '#dsds-fbgate li b.n{background:#fbf3e4;color:#8a6414;border:1px solid #ecd29c}' +
        '#dsds-fbgate .c{color:#7a1f2b}' +
        '#dsds-fbgate .ic{color:#a57a1d}' },
    // ข: พื้นขาวสะอาด แถบแดงบาง ๆ ด้านบน โลโก้ใหญ่กลางจอ
    clean: { acc: '#c8102e', grad: '#fff', soft: '#fff1f2', line: '#fecdd3', glow: 'rgba(200,16,46,.28)', bg: '#fff',
      css: '#dsds-fbgate .top{color:#7f1d1d;padding:30px 20px 18px;border-top:6px solid #c8102e}' +
        '#dsds-fbgate .top:after{left:20%;right:20%;height:1px;background:#fecdd3}' +
        '#dsds-fbgate .brand{flex-direction:column;gap:8px;font-size:15px;color:#7f1d1d}' +
        '#dsds-fbgate .brand img{width:72px;height:72px;box-shadow:none;padding:0}' +
        '#dsds-fbgate .card{margin-top:0;box-shadow:none;padding-top:8px}' +
        '#dsds-fbgate .ic{display:none}' +
        '#dsds-fbgate h1{color:#9f1239}' +
        '#dsds-fbgate .why{background:#fff1f2;border-color:#fecdd3;color:#9f1239}' +
        '#dsds-fbgate .vid{background:#fff7f7;border-top:1px solid #fde2e4;padding:18px 0 4px;max-width:none}' },
    // ค: แดงเต็มจอ ตัวหนังสือขาว การ์ดขาวกลางจอ
    bold: { acc: '#c1121f', grad: 'transparent', soft: '#fff1f2', line: '#fecdd3', glow: 'rgba(0,0,0,.25)', bg: 'linear-gradient(170deg,#7a0c14 0%,#b3131e 45%,#dc2f2f 100%) fixed',
      css: '#dsds-fbgate .top{padding:22px 20px 100px}' +
        '#dsds-fbgate .top:after{display:none}' +
        '#dsds-fbgate .card{box-shadow:0 24px 50px -16px rgba(0,0,0,.45)}' +
        '#dsds-fbgate .vid h2{color:#fff}' +
        '#dsds-fbgate .phone{background:#fff;padding:7px}' +
        '#dsds-fbgate .ft{color:rgba(255,255,255,.8)}' }
  };
  var tname = '';
  try { tname = new URLSearchParams(location.search).get('fbtheme') || ''; } catch (e) { }
  var TH = THEMES[tname] || THEMES[opt('theme')] || THEMES.maroon;
  var ACC = opt('accent') || TH.acc;
  var GRAD = opt('grad') || TH.grad;
  // iPhone: ปุ่มเปิดใน Chrome อีกทาง (googlechromes:// = แอป Chrome ; ไม่มีในเครื่อง = กดแล้วไม่เกิดอะไร ยังมีปุ่ม Safari)
  var chromeUrl = isAndroid ? '' : 'googlechromes://' + url.host + url.pathname + url.search + url.hash;

  var CSS = '' +
    'html.dsds-fb,html.dsds-fb body{overflow:hidden!important;height:100%!important;margin:0!important}' +
    'html.dsds-fb body>*:not(#dsds-fbgate){display:none!important}' +
    '#dsds-fbgate{position:fixed;inset:0;z-index:2147483647;overflow-y:auto;-webkit-overflow-scrolling:touch;' +
      'font-family:"Sarabun","Noto Sans Thai",-apple-system,"Segoe UI",sans-serif;color:#0f172a;-webkit-font-smoothing:antialiased;--acc:' + ACC + ';--soft:' + TH.soft + ';--line:' + TH.line + ';--glow:' + TH.glow + ';background:' + TH.bg + '}' +
    '#dsds-fbgate *{box-sizing:border-box}' +
    '#dsds-fbgate .top{background:' + GRAD + ';padding:20px 20px 96px;color:#fff;text-align:center;position:relative;overflow:hidden}' +
    '#dsds-fbgate .top:after{content:"";position:absolute;left:-10%;right:-10%;bottom:-1px;height:3px;background:linear-gradient(90deg,transparent,#fbbf24,transparent);opacity:.9}' +
    '#dsds-fbgate .brand{display:inline-flex;align-items:center;gap:10px;font-size:14px;font-weight:600;letter-spacing:.2px;opacity:.95}' +
    '#dsds-fbgate .brand img{width:34px;height:34px;border-radius:50%;background:#fff;padding:3px;object-fit:contain;box-shadow:0 2px 8px rgba(0,0,0,.18)}' +
    '#dsds-fbgate .card{position:relative;max-width:400px;margin:-60px auto 0;background:#fff;border-radius:22px;padding:26px 22px 22px;' +
      'box-shadow:0 18px 40px -12px rgba(30,41,99,.28),0 2px 6px rgba(30,41,99,.06);text-align:center}' +
    '#dsds-fbgate .ic{width:64px;height:64px;margin:-58px auto 12px;border-radius:20px;background:#fff;display:flex;align-items:center;justify-content:center;' +
      'box-shadow:0 10px 24px -8px var(--glow);color:var(--acc)}' +
    '#dsds-fbgate h1{font-size:22px;line-height:1.45;margin:0;font-weight:700}' +
    '#dsds-fbgate .en{color:#64748b;font-size:14px;margin:2px 0 10px}' +
    '#dsds-fbgate .why{display:flex;gap:10px;align-items:flex-start;text-align:left;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;' +
      'border-radius:14px;padding:10px 12px;font-size:14px;line-height:1.55;margin:4px 0 18px}' +
    '#dsds-fbgate .why svg{flex:none;margin-top:2px}' +
    '#dsds-fbgate .btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;border-radius:14px;font:inherit;cursor:pointer;' +
      'text-decoration:none;-webkit-tap-highlight-color:transparent;transition:transform .12s,box-shadow .12s}' +
    '#dsds-fbgate .btn:active{transform:scale(.98)}' +
    '#dsds-fbgate .p{padding:14px;background:var(--acc);color:#fff;font-weight:700;font-size:17px;box-shadow:0 10px 22px -10px var(--acc)}' +
    '#dsds-fbgate .c{margin-top:10px;padding:12px;background:var(--soft);color:var(--acc);border:1.5px solid var(--line);font-weight:700;font-size:16px}' +
    '#dsds-fbgate .c small{font-weight:400;color:#64748b;font-size:13px}' +
    '#dsds-fbgate .s{margin-top:10px;padding:12px;background:#fff;color:#334155;border:1.5px solid #e2e8f0;font-weight:600;font-size:15px}' +
    '#dsds-fbgate .s.ok{border-color:#86efac;background:#f0fdf4;color:#15803d}' +
    '#dsds-fbgate .or{display:flex;align-items:center;gap:10px;color:#94a3b8;font-size:13px;margin:20px 0 12px}' +
    '#dsds-fbgate .or:before,#dsds-fbgate .or:after{content:"";flex:1;height:1px;background:#e2e8f0}' +
    '#dsds-fbgate ol{list-style:none;margin:0;padding:0;text-align:left}' +
    '#dsds-fbgate li{display:flex;gap:12px;align-items:center;padding:9px 0;font-size:15px;line-height:1.45}' +
    '#dsds-fbgate li+li{border-top:1px dashed #e2e8f0}' +
    '#dsds-fbgate li b.n{flex:none;width:28px;height:28px;border-radius:50%;background:var(--soft);color:var(--acc);display:flex;align-items:center;justify-content:center;font-size:14px}' +
    '#dsds-fbgate kbd{font:inherit;font-weight:700;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;padding:0 6px}' +
    '#dsds-fbgate .vid{max-width:400px;margin:18px auto 0;text-align:center}' +
    '#dsds-fbgate .vid h2{font-size:15px;color:#475569;font-weight:600;margin:0 0 10px;display:flex;align-items:center;justify-content:center;gap:6px}' +
    '#dsds-fbgate .phone{width:232px;margin:0 auto;padding:8px;border-radius:34px;background:#0f172a;box-shadow:0 20px 40px -16px rgba(15,23,42,.5)}' +
    '#dsds-fbgate video{display:block;width:100%;border-radius:27px;background:#000}' +
    '#dsds-fbgate .ft{text-align:center;color:#94a3b8;font-size:12px;padding:20px 16px 28px;line-height:1.6}';

  var SVG = {
    ext: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M19 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"/></svg>',
    warn: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>',
    compass: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3z"/></svg>',
    chrome: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="M21.17 8H12"/><path d="M3.95 6.06 8.54 14"/><path d="M10.88 21.94 15.46 14"/></svg>',
    copy: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    check: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    play: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'
  };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  function mount() {
    if (document.getElementById('dsds-fbgate')) return;
    var head = document.head || document.documentElement;
    if (!document.querySelector('link[href*="family=Sarabun"]')) {
      var f = document.createElement('link'); f.rel = 'stylesheet';
      f.href = 'https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap'; head.appendChild(f);
    }
    var st = document.createElement('style'); st.textContent = CSS + TH.css; head.appendChild(st);
    document.documentElement.classList.add('dsds-fb');
    var app = isAndroid ? 'Chrome' : 'Safari';
    var menu = isAndroid ? '⋮' : '⋯';
    var box = document.createElement('div');
    box.id = 'dsds-fbgate'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'โปรดเปิดด้วยเบราว์เซอร์ภายนอก');
    box.innerHTML =
      '<div class="top"><div class="brand"><img src="' + LOGO + '" alt="">โรงเรียนปากช่อง</div></div>' +
      '<div class="card">' +
        '<div class="ic">' + SVG.ext + '</div>' +
        '<h1>โปรดเปิดด้วยเบราว์เซอร์ภายนอก</h1>' +
        '<div class="en">Please open in an external browser</div>' +
        '<div class="why">' + SVG.warn + '<span>เบราว์เซอร์ในแอป Facebook เปิดเว็บนี้ไม่ได้ (ขึ้นหน้าขาว) — เปิดใน ' + (chromeUrl ? 'Safari หรือ Chrome' : app) + ' แล้วใช้งานได้ตามปกติ</span></div>' +
        '<a class="btn p" id="dsfg-open" href="' + esc(openUrl) + '">' + SVG.compass + 'เปิดใน ' + app + '</a>' +
        (chromeUrl ? '<a class="btn c" id="dsfg-chrome" href="' + esc(chromeUrl) + '">' + SVG.chrome + '<span>เปิดใน Chrome <small>(ถ้ามีในเครื่อง)</small></span></a>' : '') +
        '<button type="button" class="btn s" id="dsfg-copy">' + SVG.copy + '<span>คัดลอกลิงก์</span></button>' +
        '<div class="or">ถ้ากดแล้วไม่ไป ทำเองได้ 3 ขั้น</div>' +
        '<ol>' +
          '<li><b class="n">1</b><span>แตะ <kbd>' + menu + '</kbd> มุมขวาบนของจอ</span></li>' +
          '<li><b class="n">2</b><span>เลือก <b>เปิดในเบราว์เซอร์ภายนอก</b><br><small style="color:#64748b">Open in external browser</small></span></li>' +
          '<li><b class="n">3</b><span>เว็บเปิดใน ' + app + ' ใช้งานได้ตามปกติ</span></li>' +
        '</ol>' +
      '</div>' +
      '<div class="vid"><h2>' + SVG.play + 'ดูวิธีทำ (15 วินาที)</h2><div class="phone">' +
        '<video src="' + VIDEO + '" autoplay muted loop playsinline aria-label="วิดีโอสอนเปิดในเบราว์เซอร์ภายนอก"></video></div></div>' +
      '<div class="ft">งานพัฒนาและบริการระบบดิจิทัลโรงเรียน (DSDS)</div>';
    document.body.appendChild(box);
    var v = box.querySelector('video'); v.muted = true; try { v.play(); } catch (e) { }
    var cp = document.getElementById('dsfg-copy');
    cp.onclick = function () {
      var done = function () { cp.classList.add('ok'); cp.innerHTML = SVG.check + '<span>คัดลอกแล้ว — วางในช่องที่อยู่ของ ' + app + '</span>'; };
      var ask = function () { window.prompt('คัดลอกลิงก์นี้', cleanUrl); };
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(cleanUrl).then(done, ask);
        else ask();
      } catch (e) { ask(); }
    };
    // Android: ลองพาไป Chrome เองหนึ่งครั้ง (บางเครื่อง Facebook ยอม) ไม่ได้ก็ยังมีปุ่มให้กด ; ไม่ทำตอนทดสอบด้วย ?fbgate=
    if (isAndroid && !force && opt('auto') !== '0') setTimeout(function () { location.href = openUrl; }, 600);
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
