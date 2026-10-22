/*
 * ติดตั้งเป็นแอป (PWA) — ไฟล์กลางของทีม DSDS ใช้กับหน้าครอบทุกระบบบน pcschool-dev.github.io
 * หน้าครอบใส่ 3 บรรทัดใน <head> แล้วมี manifest.webmanifest + sw.js ของตัวเองข้างหน้า (sw.js ต้องอยู่ในโฟลเดอร์ระบบ):
 *   <link rel="manifest" href="manifest.webmanifest">
 *   <link rel="apple-touch-icon" href="/dsds/pwa/apple-touch-icon.png">
 *   <script src="/dsds/pwa.js" data-title="รับหนังสือ" defer></script>
 *
 * แถบชวนติดตั้งลอยล่างจอ ขึ้น 6 วิหลังหน้าโหลดเสร็จ (window load รอกรอบ Apps Script ด้วย) สูงจากขอบล่าง 88px ไม่ทับปุ่มลอย LINE สอบถาม/ข่าวสาร
 *   Android / Chrome / Edge บนคอม: beforeinstallprompt -> ปุ่ม "ติดตั้ง" เรียกหน้าต่างติดตั้งของเครื่อง
 *   iPhone / iPad: เว็บสั่งติดตั้งเองไม่ได้ -> ปุ่มเปิดวิธีทำ แชร์ > เพิ่มไปยังหน้าจอโฮม
 *   ไม่ขึ้นเมื่อ: เปิดจากแอปที่ติดตั้งแล้ว, เบราว์เซอร์ในแอป LINE/Facebook/Instagram, กด × แล้ว 30 วัน (แยกตามระบบ)
 *   แอปในกรอบสั่งติดตั้งเองได้ด้วย postMessage { tes:'pwa-install' } (เผื่อใส่ปุ่มในเมนูภายหลัง)
 * ไม่กระทบการอัปเดต: sw.js ไม่แคชหน้าระบบ ดึงจากเน็ตทุกครั้ง มีแค่หน้า "ไม่มีอินเทอร์เน็ต" ตอนเน็ตหลุด
 */
(function () {
  var me = document.currentScript || {};
  var title = (me.dataset && me.dataset.title) || 'ระบบนี้';
  var ua = navigator.userAgent;
  var inApp = /\bLine\/|FBAN|FBAV|Instagram/i.test(ua);
  var standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  var isIos = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var KEY = 'pwaSnooze:' + location.pathname;
  var deferred = null, loaded = false, shown = false, bar = null, sheet = null;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { }); });
  }
  if (standalone || inApp) return;

  function snoozed() {
    try { return Date.now() - Number(localStorage.getItem(KEY) || 0) < 30 * 864e5; } catch (e) { return false; }
  }

  var CSS = '#dsds-pwa{display:none;position:fixed;z-index:2147483000;left:50%;transform:translateX(-50%);' +
    'bottom:calc(88px + env(safe-area-inset-bottom));width:max-content;max-width:calc(100vw - 32px);box-sizing:border-box;' +
    'align-items:center;gap:10px;padding:8px 8px 8px 12px;background:#fff;color:#333;border-radius:14px;' +
    'box-shadow:0 6px 24px rgba(0,0,0,.18);font:14px/1.4 Sarabun,"Leelawadee UI",Thonburi,sans-serif}' +
    '#dsds-pwa.on{display:flex}#dsds-pwa img{width:32px;height:32px;border-radius:8px;flex:none}' +
    '#dsds-pwa .t{flex:1;min-width:0}#dsds-pwa small{display:block;color:#777;font-size:12px}' +
    '#dsds-pwa button,#dsds-pwa-ios button{font:inherit;cursor:pointer;border-radius:999px;flex:none}' +
    '#dsds-pwa .go{background:#1d4ed8;color:#fff;border:0;padding:7px 14px;font-weight:600}' +
    '#dsds-pwa .x{background:transparent;color:#888;border:0;width:32px;height:32px;font-size:20px;line-height:1}' +
    '#dsds-pwa-ios{display:none;position:fixed;inset:0;z-index:2147483001;background:rgba(0,0,0,.45);align-items:flex-end;' +
    'justify-content:center;font:15px/1.6 Sarabun,"Leelawadee UI",Thonburi,sans-serif}#dsds-pwa-ios.on{display:flex}' +
    '#dsds-pwa-ios>div{background:#fff;color:#333;width:100%;max-width:420px;border-radius:18px 18px 0 0;' +
    'padding:20px 20px calc(20px + env(safe-area-inset-bottom));box-sizing:border-box}' +
    '#dsds-pwa-ios ol{margin:8px 0 16px;padding-left:22px}#dsds-pwa-ios b{color:#1d4ed8}' +
    '#dsds-pwa-ios button{width:100%;padding:10px;border:1px solid #ccc;background:#fff}';

  function build() {
    if (bar) return;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    bar = document.createElement('div');
    bar.id = 'dsds-pwa'; bar.setAttribute('role', 'dialog'); bar.setAttribute('aria-label', 'ติดตั้งเป็นแอป');
    bar.innerHTML = '<img src="/dsds/pwa/icon-192.png" alt=""><div class="t"></div>' +
      '<button type="button" class="go">ติดตั้ง</button><button type="button" class="x" aria-label="ไม่ตอนนี้">×</button>';
    bar.querySelector('.t').innerHTML = 'ติดตั้ง <b></b> เป็นแอป<small>เปิดจากหน้าจอโฮมได้ทันที</small>';
    bar.querySelector('.t b').textContent = title;
    bar.querySelector('.go').onclick = install;
    bar.querySelector('.x').onclick = function () {
      bar.classList.remove('on');
      try { localStorage.setItem(KEY, String(Date.now())); } catch (e) { }
    };
    sheet = document.createElement('div');
    sheet.id = 'dsds-pwa-ios'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-label', 'วิธีติดตั้งบน iPhone/iPad');
    sheet.innerHTML = '<div><strong>ติดตั้งบน iPhone / iPad</strong><ol>' +
      '<li>แตะปุ่ม <b>แชร์</b> (สี่เหลี่ยมมีลูกศรชี้ขึ้น) ที่แถบล่างหรือบนของ Safari</li>' +
      '<li>เลื่อนลงแล้วแตะ <b>เพิ่มไปยังหน้าจอโฮม</b></li>' +
      '<li>แตะ <b>เพิ่ม</b> มุมขวาบน ไอคอนโรงเรียนจะอยู่บนหน้าจอโฮม</li></ol>' +
      '<button type="button">เข้าใจแล้ว</button></div>';
    sheet.querySelector('button').onclick = function () { sheet.classList.remove('on'); };
    sheet.onclick = function (e) { if (e.target === sheet) sheet.classList.remove('on'); };
    document.body.appendChild(bar); document.body.appendChild(sheet);
  }

  function maybeShow() {
    if (shown || !loaded || !(deferred || isIos) || snoozed()) return;
    shown = true;
    setTimeout(function () { build(); bar.classList.add('on'); }, 6000); // ให้ผู้ใช้เห็นหน้าระบบก่อน ค่อยชวน
  }

  function install() {
    build();
    bar.classList.remove('on');
    if (deferred) {
      deferred.prompt();
      deferred.userChoice.finally(function () { deferred = null; });
    } else if (isIos) {
      sheet.classList.add('on');
    }
  }

  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; maybeShow(); });
  window.addEventListener('appinstalled', function () { deferred = null; if (bar) bar.classList.remove('on'); });
  window.addEventListener('load', function () { loaded = true; maybeShow(); });
  window.addEventListener('message', function (ev) {
    if (ev.data && ev.data.tes === 'pwa-install' && /\.googleusercontent\.com$/.test(String(ev.origin))) install();
  });
  window.DSDSPwa = { install: install };
})();
