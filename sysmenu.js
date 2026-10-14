/*!
 * เมนูรวมระบบของโรงเรียนปากช่อง (ทีม DSDS) — ไฟล์กลางไฟล์เดียว ทุกเว็บแอปดึงไปใช้
 * https://pcschool-dev.github.io/dsds/sysmenu.js
 *
 * ใส่ในเว็บแอป (บรรทัดเดียว):
 *   <script src="https://pcschool-dev.github.io/dsds/sysmenu.js" data-current="doc" defer></script>
 *
 * ตัวเลือก (ใส่เป็น attribute ของ <script>):
 *   data-current  รหัสระบบที่กำลังใช้อยู่ (ดู SYSTEMS ข้างล่าง) -> ขึ้นบนสุด ป้าย "ใช้อยู่"
 *   data-grad     สีหัวแผง เช่น "linear-gradient(135deg,#7a2e3a,#a3485a)"   (ค่าเริ่มต้น = ครามของระบบรับหนังสือ)
 *   data-accent   สีหลัก (ไอคอนระบบที่ใช้อยู่ ป้าย ปุ่มลอย) เช่น "#7a2e3a"
 *   data-fab      ปุ่มลอยเมื่อหน้าไม่มีปุ่มของตัวเอง: top-right (ค่าเริ่มต้น) | top-left | bottom-right | bottom-left | off
 *
 * ปุ่มเปิดเมนูของระบบเอง: ใส่ data-sysmenu ที่ปุ่มไหนก็ได้ (กี่ปุ่มก็ได้) เช่น
 *   <button type="button" data-sysmenu aria-label="ระบบอื่นของโรงเรียน"><i class="bi bi-list"></i></button>
 * มีปุ่มแบบนี้ในหน้าแล้ว -> ไม่สร้างปุ่มลอย
 * เรียกจากโค้ด: DSDSMenu.open() / DSDSMenu.close()
 *
 *   data-admin    "1" = แสดงลิงก์ "จัดการรายการระบบ" ท้ายแผง (หรือเรียก DSDSMenu.setAdmin(true) หลังรู้ว่าผู้ใช้เป็นแอดมิน)
 *
 * รายการระบบ: อ่านจาก Google Sheet "รายการระบบ DSDS" (SHEET_ID ข้างล่าง) — ทีม DSDS แก้ในชีตได้เลย ไม่ต้องแก้ไฟล์นี้
 *   ชีตต้องเปิด "ทุกคนที่มีลิงก์ดูได้" ; สิทธิ์แก้ = คนที่ได้รับแชร์เป็นผู้แก้ไข (ลิงก์ "จัดการรายการระบบ" แค่พาไปชีต ไม่ได้ให้สิทธิ์)
 *   จำรายการล่าสุดไว้ในเครื่อง (localStorage) เปิดแผงได้ทันที แล้วอ่านชีตใหม่เบื้องหลังทุก 5 นาที
 *   อ่านชีตไม่ได้ + ไม่เคยจำไว้ -> ใช้ GROUPS/SYSTEMS/REQUEST ข้างล่างเป็นรายการสำรอง
 */
(function () {
  'use strict';
  if (window.DSDSMenu) return;   // โหลดซ้ำ -> ใช้ตัวเดิม

  // ===== รายการระบบ (แก้ที่นี่ที่เดียว) =====
  var GROUPS = [
    { id: 'saraban', name: 'งานสารบรรณ', tone: 'indigo' },
    { id: 'teach', name: 'งานครูและการเรียนการสอน', tone: 'teal' },
    { id: 'admit', name: 'งานรับนักเรียน', tone: 'amber' },
    { id: 'account', name: 'บัญชีผู้ใช้', tone: 'slate' },   
  ];
  var SYSTEMS = [
    { id: 'doc', group: 'saraban', icon: 'bi-envelope-paper', name: 'ระบบรับหนังสือราชการ', desc: 'รับหนังสือ เสนอ สั่งการ', url: 'https://pcschool-dev.github.io/doc/' },
    { id: 'senddoc', group: 'saraban', icon: 'bi-send', name: 'ระบบบันทึกหนังสือราชการ', desc: 'ออกเลขหนังสือ ส่งหนังสือ', url: 'https://pcschool-dev.github.io/senddoc' },
    { id: 'ask', group: 'teach', icon: 'bi-clipboard-check', name: 'ระบบประเมินครูผู้สอน', desc: 'นักเรียนประเมินการสอนของครู', url: 'https://pcschool-dev.github.io/ask/' },
    { id: 'check', group: 'teach', icon: 'bi-check2-square', name: 'ระบบเช็กชื่อ | คะแนน', desc: 'เช็กชื่อเข้าเรียน บันทึกคะแนน', url: 'https://pcschool-dev.github.io/check/' },
    { id: 'homework', group: 'teach', icon: 'bi-journal-text', name: 'ระบบส่งการบ้านนักเรียน', desc: 'สั่งงาน รับงาน ตรวจงานออนไลน์', url: 'https://pcschool-dev.github.io/homework/' },
    { id: 'regpc', group: 'admit', icon: 'bi-mortarboard', name: 'ระบบรับสมัครนักเรียน', desc: 'สมัครเรียน ยืนยันสิทธิ์ รายงานตัว', url: 'https://pcschool-dev.github.io/regpc' },
    { id: 'admin', group: 'admit', icon: 'bi-people', name: 'ระบบจัดการรับสมัครนักเรียน', desc: 'สำหรับเจ้าหน้าที่รับสมัคร', url: 'https://pcschool-dev.github.io/admin/' },
    { id: 'account', group: 'account', icon: 'bi-person-circle', name: 'บัญชีผู้ใช้ โรงเรียนปากช่อง', desc: 'บัญชีเดียว เข้าได้ทุกระบบ', url: 'https://pcschool-dev.github.io/account'}
     ];
  var REQUEST = { icon: 'bi-lightbulb', name: 'ขอพัฒนาเว็บแอปใช้งาน', desc: 'มีงานที่อยากให้เป็นระบบออนไลน์? แจ้งทีม DSDS',
    url: 'https://script.google.com/a/macros/pcschool.ac.th/s/AKfycbyK4gl3CxqnsRSB2FdYPJo7Nv2jQe5L_7ObjIkjfk-dxOzlRj8-lwtZFq-FCBRQFB_-Og/exec' };
  var SHEET_ID = '1MjY_5Uvw2Mgyb2ejG5sBb-mBnqaCJ79xVwI9s7aN5XA';
  var SHEET_EDIT = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/edit';
  var TONES = { 'คราม': 'indigo', 'เขียว': 'teal', 'ส้ม': 'amber', 'เทา': 'slate', 'ชมพู': 'pink', 'ฟ้า': 'sky' };
  var CACHE_KEY = 'dsm-list-v1', CACHE_TTL = 5 * 60 * 1000;
  var LOGO = 'https://lh5.googleusercontent.com/d/1Q28ttbihnvUUF-kEBwdEj04kVyQ8h0n-';
  var ICONS_CSS = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css';

  // ===== ตัวเลือกจาก <script> =====
  var me = document.currentScript || (function () {
    var s = document.querySelectorAll('script[src*="sysmenu.js"]'); return s[s.length - 1];
  })();
  function opt(k, d) { var v = me && me.getAttribute('data-' + k); return v == null || v === '' ? d : v; }
  var CURRENT = opt('current', '');
  var GRAD = opt('grad', 'linear-gradient(135deg, #4f46e5 0%, #2563eb 55%, #38bdf8 120%)');
  var ACCENT = opt('accent', '#4338ca');
  var FAB = opt('fab', 'top-right');
  var ADMIN = opt('admin', '') === '1';
  // ค่าสีมาจาก attribute ที่เจ้าของระบบเขียนเอง แต่ก็กันไว้ไม่ให้หลุดออกจากค่า CSS
  function cssSafe(v) { return String(v).replace(/[;{}<>]/g, ''); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var CSS = [
    '.dsm-root, .dsm-root * { box-sizing: border-box; }',
    '.dsm-root { --dsm-grad: ' + cssSafe(GRAD) + '; --dsm-accent: ' + cssSafe(ACCENT) + '; font-family: inherit; }',
    '.dsm-scrim { position: fixed; inset: 0; z-index: 2147483000; background: rgba(15,23,42,.5); opacity: 0; pointer-events: none; transition: opacity .22s; }',
    '.dsm-panel { position: fixed; top: 0; right: 0; bottom: 0; z-index: 2147483001; width: min(360px, 90vw); background: #f4f6fb; color: #0f172a;',
    '  display: flex; flex-direction: column; box-shadow: -16px 0 40px rgba(15,23,42,.28); text-align: left; line-height: 1.4; font-size: 16px;',
    '  transform: translateX(105%); visibility: hidden; transition: transform .28s cubic-bezier(.2,.9,.3,1), visibility 0s .28s; }',
    'html.dsm-open, html.dsm-open body { overflow: hidden; }',
    'html.dsm-open .dsm-scrim { opacity: 1; pointer-events: auto; }',
    'html.dsm-open .dsm-panel { transform: none; visibility: visible; transition: transform .28s cubic-bezier(.2,.9,.3,1); }',
    '.dsm-head { position: relative; display: flex; align-items: center; gap: 12px; padding: 18px 16px 16px; padding-top: calc(18px + env(safe-area-inset-top, 0px));',
    '  color: #fff; background: var(--dsm-grad); overflow: hidden; }',
    '.dsm-head::after { content: ""; position: absolute; width: 160px; height: 160px; border-radius: 50%; right: -50px; top: -70px; background: rgba(255,255,255,.14); pointer-events: none; }',
    '.dsm-logo { width: 46px; height: 46px; flex: none; border-radius: 14px; background: rgba(255,255,255,.95); display: inline-flex; align-items: center; justify-content: center;',
    '  color: var(--dsm-accent); font-size: 1.3rem; box-shadow: 0 6px 16px rgba(15,23,42,.18); overflow: hidden; }',
    '.dsm-logo img { width: 100%; height: 100%; object-fit: contain; padding: 5px; display: block; }',
    '.dsm-htx { flex: 1; min-width: 0; }',
    '.dsm-title { font-weight: 700; font-size: 1.06rem; line-height: 1.3; margin: 0; color: #fff; }',
    '.dsm-sub { font-size: .78rem; opacity: .9; margin-top: 2px; }',
    '.dsm-close { position: relative; z-index: 1; width: 38px; height: 38px; flex: none; padding: 0; margin: 0; border: 0; border-radius: 12px; cursor: pointer;',
    '  background: rgba(255,255,255,.18); color: #fff; font-size: 1rem; display: inline-flex; align-items: center; justify-content: center; transition: background .15s; }',
    '.dsm-close:hover { background: rgba(255,255,255,.3); }',
    '.dsm-close:focus-visible { outline: 3px solid rgba(255,255,255,.6); outline-offset: 2px; }',
    '.dsm-body { flex: 1; overflow-y: auto; overscroll-behavior: contain; padding: 6px 14px 16px; }',
    '.dsm-sec { font-size: .74rem; font-weight: 600; color: #64748b; letter-spacing: .02em; margin: 16px 4px 7px; }',
    '.dsm-group { background: #fff; border: 1px solid #e6ebf3; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 2px rgba(15,23,42,.04); }',
    '.dsm-item, .dsm-req { display: flex; align-items: center; gap: 12px; padding: 11px 12px; color: #0f172a !important; text-decoration: none !important; }',
    '.dsm-item + .dsm-item { border-top: 1px solid #eef1f6; }',
    'a.dsm-item { transition: background .15s; }',
    'a.dsm-item:hover, a.dsm-item:focus-visible { background: #f6f8fd; outline: none; }',
    'a.dsm-item:focus-visible { box-shadow: inset 0 0 0 2px rgba(79,70,229,.45); }',
    '.dsm-ic { width: 40px; height: 40px; flex: none; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 1.18rem;',
    '  background: var(--dsm-bg); color: var(--dsm-fg); }',
    '.dsm-indigo { --dsm-bg: #eef2ff; --dsm-fg: #4338ca; }',
    '.dsm-teal { --dsm-bg: #e6f6f3; --dsm-fg: #0f766e; }',
    '.dsm-amber { --dsm-bg: #fff4e0; --dsm-fg: #b45309; }',
    '.dsm-slate { --dsm-bg: #eef1f6; --dsm-fg: #475569; }',
    '.dsm-pink { --dsm-bg: #fdecf3; --dsm-fg: #be185d; }',
    '.dsm-sky { --dsm-bg: #e6f4fd; --dsm-fg: #0369a1; }',
    '.dsm-item.is-soon { cursor: default; }',
    '.dsm-item.is-soon .dsm-ic, .dsm-item.is-soon .dsm-tx { opacity: .55; }',
    '.dsm-soon { flex: none; font-size: .7rem; font-weight: 600; color: #92400e; background: #fef3c7; border-radius: 999px; padding: 2px 9px; }',
    '.dsm-admin { display: inline-flex; align-items: center; gap: 6px; font-weight: 600; color: var(--dsm-accent) !important; text-decoration: none !important; }',
    '.dsm-admin:hover { text-decoration: underline !important; }',
    '.dsm-tx { min-width: 0; flex: 1; display: flex; flex-direction: column; line-height: 1.35; }',
    '.dsm-tx b { font-weight: 600; font-size: .92rem; }',
    '.dsm-tx small { font-size: .76rem; color: #64748b; }',
    '.dsm-go { flex: none; color: #b6c0cf; font-size: .9rem; transition: transform .15s, color .15s; }',
    'a.dsm-item:hover .dsm-go { color: var(--dsm-accent); transform: translate(2px, -2px); }',
    '.dsm-item.is-current { background: linear-gradient(90deg, #f1f3fb, #fff); }',
    '.dsm-item.is-current .dsm-ic { background: var(--dsm-grad); color: #fff; box-shadow: 0 4px 10px rgba(15,23,42,.18); }',
    '.dsm-here { flex: none; font-size: .7rem; font-weight: 600; color: var(--dsm-accent); background: #fff; border: 1px solid currentColor; border-radius: 999px; padding: 1px 9px; }',
    '.dsm-req { margin-top: 18px; border-radius: 16px; border: 1px solid #fde3a7; background: linear-gradient(135deg, #fffbeb, #fff7e6); transition: border-color .15s, box-shadow .15s; }',
    '.dsm-req:hover { border-color: #f6c35b; box-shadow: 0 6px 16px rgba(180,83,9,.12); }',
    '.dsm-req .dsm-ic { --dsm-bg: #fde68a; --dsm-fg: #92400e; }',
    '.dsm-req:hover .dsm-go { transform: translateX(3px); color: #b45309; }',
    '.dsm-foot { flex: none; text-align: center; font-size: .72rem; color: #94a3b8; padding: 8px 12px; padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));',
    '  border-top: 1px solid #e6ebf3; background: #fff; }',
    '.dsm-fab { position: fixed; z-index: 2147482000; width: 42px; height: 42px; padding: 0; margin: 0; border-radius: 13px; cursor: pointer;',
    '  border: 1.5px solid rgba(255,255,255,.9); background: var(--dsm-grad); color: #fff; font-size: 1.4rem; line-height: 1;',
    '  display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 6px 18px rgba(15,23,42,.25); transition: transform .12s, box-shadow .15s; }',
    '.dsm-fab:hover { box-shadow: 0 8px 22px rgba(15,23,42,.32); }',
    '.dsm-fab:active { transform: scale(.95); }',
    '.dsm-fab:focus-visible { outline: 3px solid rgba(79,70,229,.4); outline-offset: 2px; }',
    '.dsm-fab.top-right { top: calc(12px + env(safe-area-inset-top, 0px)); right: 12px; }',
    '.dsm-fab.top-left { top: calc(12px + env(safe-area-inset-top, 0px)); left: 12px; }',
    '.dsm-fab.bottom-right { bottom: calc(16px + env(safe-area-inset-bottom, 0px)); right: 16px; }',
    '.dsm-fab.bottom-left { bottom: calc(16px + env(safe-area-inset-bottom, 0px)); left: 16px; }',
    '@media print { .dsm-root, .dsm-fab, [data-sysmenu] { display: none !important; } }'
  ].join('\n');

  function itemHtml(s, tone, current) {
    if (current) {
      return '<div class="dsm-item is-current dsm-' + tone + '" aria-current="page">' +
        '<span class="dsm-ic"><i class="bi ' + esc(s.icon) + '"></i></span>' +
        '<span class="dsm-tx"><b>' + esc(s.name) + '</b><small>คุณอยู่ที่ระบบนี้</small></span>' +
        '<span class="dsm-here">ใช้อยู่</span></div>';
    }
    if (s.soon) {
      return '<div class="dsm-item is-soon dsm-' + tone + '">' +
        '<span class="dsm-ic"><i class="bi ' + esc(s.icon) + '"></i></span>' +
        '<span class="dsm-tx"><b>' + esc(s.name) + '</b><small>' + esc(s.desc) + '</small></span>' +
        '<span class="dsm-soon">เร็ว ๆ นี้</span></div>';
    }
    return '<a class="dsm-item dsm-' + tone + '" href="' + esc(s.url) + '" target="_blank" rel="noopener">' +
      '<span class="dsm-ic"><i class="bi ' + esc(s.icon) + '"></i></span>' +
      '<span class="dsm-tx"><b>' + esc(s.name) + '</b><small>' + esc(s.desc) + '</small></span>' +
      '<i class="bi bi-arrow-up-right dsm-go" aria-hidden="true"></i></a>';
  }

  // ===== ข้อมูลที่แสดง: รายการสำรองในไฟล์ -> แทนด้วยชีต (ผ่านแคชในเครื่อง) =====
  var DATA = {
    groups: GROUPS.map(function (g) { return { id: g.id, name: g.name, tone: g.tone }; }),
    systems: SYSTEMS.slice(), request: REQUEST
  };
  var okUrl = function (u) { return /^https:\/\/[^\s"'<>]+$/.test(String(u || '')); };
  var okIcon = function (i) { return /^bi-[a-z0-9-]+$/.test(String(i || '')) ? i : 'bi-app'; };

  function bodyHtml() {
    var toneOf = {}; DATA.groups.forEach(function (g) { toneOf[g.id] = g.tone; });
    var cur = null; DATA.systems.forEach(function (s) { if (s.id === CURRENT) cur = s; });
    var h = '';
    if (cur) h += '<div class="dsm-sec">กำลังใช้งาน</div><div class="dsm-group">' + itemHtml(cur, toneOf[cur.group] || 'indigo', true) + '</div>';
    DATA.groups.forEach(function (g) {
      var list = DATA.systems.filter(function (s) { return s.group === g.id && s !== cur; });
      if (!list.length) return;
      h += '<div class="dsm-sec">' + esc(g.name) + '</div><div class="dsm-group">' +
        list.map(function (s) { return itemHtml(s, g.tone, false); }).join('') + '</div>';
    });
    var R = DATA.request;
    if (R && okUrl(R.url)) {
      h += '<a class="dsm-req" href="' + esc(R.url) + '" target="_blank" rel="noopener">' +
        '<span class="dsm-ic"><i class="bi ' + esc(okIcon(R.icon)) + '"></i></span>' +
        '<span class="dsm-tx"><b>' + esc(R.name) + '</b><small>' + esc(R.desc) + '</small></span>' +
        '<i class="bi bi-chevron-right dsm-go" aria-hidden="true"></i></a>';
    }
    return h;
  }
  function subText() { return DATA.systems.filter(function (s) { return !s.soon; }).length + ' ระบบ · ทีม DSDS'; }
  function footHtml() {
    return ADMIN ? '<a class="dsm-admin" href="' + SHEET_EDIT + '" target="_blank" rel="noopener"><i class="bi bi-pencil-square"></i>จัดการรายการระบบ (Google Sheet)</a>'
                 : 'ลิงก์ทุกระบบเปิดในแท็บใหม่';
  }
  function panelHtml() {
    return '<div class="dsm-scrim" data-dsm-close></div>' +
      '<aside class="dsm-panel" id="dsmPanel" role="dialog" aria-modal="true" aria-labelledby="dsmTitle" aria-hidden="true">' +
      '<div class="dsm-head"><div class="dsm-logo"><img src="' + LOGO + '" alt="" onerror="this.parentNode.innerHTML=\'&lt;i class=&quot;bi bi-grid-3x3-gap-fill&quot;&gt;&lt;/i&gt;\'"></div>' +
      '<div class="dsm-htx"><div class="dsm-title" id="dsmTitle">ระบบของโรงเรียนปากช่อง</div>' +
      '<div class="dsm-sub">' + esc(subText()) + '</div></div>' +
      '<button type="button" class="dsm-close" data-dsm-close aria-label="ปิด"><i class="bi bi-x-lg"></i></button></div>' +
      '<div class="dsm-body">' + bodyHtml() + '</div>' +
      '<div class="dsm-foot">' + footHtml() + '</div></aside>';
  }
  function rerender() {
    if (!root) return;
    root.querySelector('.dsm-body').innerHTML = bodyHtml();
    root.querySelector('.dsm-sub').textContent = subText();
    root.querySelector('.dsm-foot').innerHTML = footHtml();
  }

  // ----- อ่านชีตผ่าน gviz (JSONP — ใช้ได้ในหน้าของ Apps Script ที่ fetch ข้ามโดเมนไม่ได้) -----
  var seq = 0;
  function loadSheet(name, done) {
    var cb = '__dsmSheet' + (++seq) + '_' + Date.now(), sc = document.createElement('script'), fin = false;
    function end(v) { if (fin) return; fin = true; try { delete window[cb]; } catch (e) { window[cb] = undefined; } if (sc.parentNode) sc.parentNode.removeChild(sc); done(v); }
    window[cb] = function (res) {
      try {
        if (!res || res.status === 'error' || !res.table) return end(null);
        var cols = res.table.cols.map(function (c) { return String(c.label || '').trim(); });
        end(res.table.rows.map(function (r) {
          var o = {}; cols.forEach(function (k, i) { var c = r.c && r.c[i]; o[k] = c && c.v != null ? c.v : ''; }); return o;
        }));
      } catch (e) { end(null); }
    };
    sc.onerror = function () { end(null); };
    setTimeout(function () { end(null); }, 8000);
    sc.src = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?headers=1&tqx=responseHandler:' + cb + '&sheet=' + encodeURIComponent(name);
    document.head.appendChild(sc);
  }
  function fromSheet(rows, conf) {
    var list = (rows || []).map(function (r) {
      return { order: Number(r['ลำดับ']) || 9999, id: String(r['รหัส'] || '').trim(), group: String(r['กลุ่ม'] || '').trim() || 'อื่น ๆ',
        tone: TONES[String(r['สีกลุ่ม'] || '').trim()] || '', name: String(r['ชื่อระบบ'] || '').trim(), desc: String(r['คำอธิบาย'] || '').trim(),
        icon: okIcon(String(r['ไอคอน'] || '').trim()), url: String(r['ลิงก์'] || '').trim(), status: String(r['สถานะ'] || '').trim() };
    }).filter(function (s) { return s.name && s.status !== 'ซ่อน'; });
    list.forEach(function (s) { s.soon = s.status === 'เร็ว ๆ นี้' || s.status === 'เร็วๆนี้'; });
    list = list.filter(function (s) { return s.soon || okUrl(s.url); });
    if (!list.length) return null;
    list.sort(function (a, b) { return a.order - b.order; });
    var groups = [], seen = {}, cycle = ['indigo', 'teal', 'amber', 'slate', 'pink', 'sky'];
    list.forEach(function (s) {
      if (!seen[s.group]) { seen[s.group] = 1; groups.push({ id: s.group, name: s.group, tone: s.tone || cycle[groups.length % cycle.length] }); }
    });
    var kv = {}; (conf || []).forEach(function (r) { kv[String(r['หัวข้อ'] || '').trim()] = String(r['ค่า'] || '').trim(); });
    var req = { icon: REQUEST.icon, name: kv['ชื่อปุ่มขอพัฒนา'] || REQUEST.name, desc: kv['คำอธิบายปุ่มขอพัฒนา'] || REQUEST.desc,
      url: okUrl(kv['ลิงก์ปุ่มขอพัฒนา']) ? kv['ลิงก์ปุ่มขอพัฒนา'] : REQUEST.url };
    return { groups: groups, systems: list.map(function (s) {
      return { id: s.id, group: s.group, icon: s.icon, name: s.name, desc: s.desc, url: s.url, soon: s.soon };
    }), request: req };
  }
  function store(get, v) {
    try { if (get) return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); localStorage.setItem(CACHE_KEY, JSON.stringify(v)); } catch (e) {}
    return null;
  }
  var loading = false, fetchedAt = 0;
  function refresh(force) {
    if (loading || (!force && Date.now() - fetchedAt < CACHE_TTL)) return;
    loading = true;
    loadSheet('ระบบ', function (rows) {
      loadSheet('ตั้งค่า', function (conf) {
        loading = false;
        var d = rows && fromSheet(rows, conf);
        if (!d) return;   // อ่านไม่ได้ -> คงรายการเดิม (แคช/สำรอง)
        fetchedAt = Date.now();
        DATA = d; store(false, { at: fetchedAt, data: d }); rerender();
      });
    });
  }
  (function () {
    var c = store(true);
    if (c && c.data && c.data.systems && c.data.systems.length) { DATA = c.data; fetchedAt = c.at || 0; }
  })();

  var root = null, lastOpener = null;
  function ensure() {
    if (root) return;
    if (!document.querySelector('link[href*="bootstrap-icons"]')) {
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = ICONS_CSS; document.head.appendChild(l);
    }
    var st = document.createElement('style'); st.id = 'dsm-style'; st.textContent = CSS; document.head.appendChild(st);
    root = document.createElement('div'); root.className = 'dsm-root'; root.innerHTML = panelHtml();
    document.body.appendChild(root);
  }
  function setExpanded(v) {
    document.querySelectorAll('[data-sysmenu], .dsm-fab').forEach(function (b) { b.setAttribute('aria-expanded', v ? 'true' : 'false'); });
  }
  function open(opener) {
    ensure();
    lastOpener = opener || document.activeElement;
    document.documentElement.classList.add('dsm-open');
    refresh(false);
    root.querySelector('.dsm-panel').setAttribute('aria-hidden', 'false');
    setExpanded(true);
    setTimeout(function () { var c = root.querySelector('.dsm-close'); if (c) c.focus(); }, 50);
  }
  function close() {
    if (!root || !document.documentElement.classList.contains('dsm-open')) return;
    document.documentElement.classList.remove('dsm-open');
    root.querySelector('.dsm-panel').setAttribute('aria-hidden', 'true');
    setExpanded(false);
    if (lastOpener && lastOpener.focus) { try { lastOpener.focus(); } catch (e) {} }
  }

  // กดปุ่มที่มี data-sysmenu (รวมปุ่มที่หน้าเว็บสร้างทีหลัง) / ปุ่มปิด / พื้นมืด
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target : null;
    if (!t) return;
    var b = t.closest('[data-sysmenu], .dsm-fab');
    if (b) { e.preventDefault(); open(b); return; }
    if (t.closest('[data-dsm-close]')) { e.preventDefault(); close(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  function init() {
    ensure();
    refresh(false);
    document.querySelectorAll('[data-sysmenu]').forEach(function (b) {
      b.setAttribute('aria-controls', 'dsmPanel'); b.setAttribute('aria-expanded', 'false');
      if (!b.getAttribute('aria-label')) b.setAttribute('aria-label', 'ระบบอื่นของโรงเรียน');
    });
    if (FAB !== 'off' && !document.querySelector('[data-sysmenu]')) {
      var f = document.createElement('button');
      f.type = 'button'; f.className = 'dsm-fab dsm-root ' + (/^(top|bottom)-(left|right)$/.test(FAB) ? FAB : 'top-right');
      f.title = 'ระบบอื่นของโรงเรียน'; f.setAttribute('aria-label', 'ระบบอื่นของโรงเรียน');
      f.setAttribute('aria-controls', 'dsmPanel'); f.setAttribute('aria-expanded', 'false');
      f.innerHTML = '<i class="bi bi-list"></i>';
      document.body.appendChild(f);
    }
  }

  window.DSDSMenu = {
    open: function () { open(); }, close: close, refresh: function () { refresh(true); },
    setAdmin: function (v) { ADMIN = !!v; rerender(); },
    get systems() { return DATA.systems.slice(); }, version: '1.1.0'
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
