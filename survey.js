/*!
 * แบบประเมินการใช้งานสั้น 2 คำถาม — ไฟล์กลาง ทุกระบบของโรงเรียนปากช่องใช้ร่วมกัน
 * https://pcschool-dev.github.io/dsds/survey.js
 *
 * ปกติไม่ต้องใส่เอง: sysmenu.js (1.6.0+) นับวันที่ผู้ใช้เปิดระบบไว้ในเครื่อง แล้วโหลดไฟล์นี้เมื่อถึงรอบ
 *   - ถามครั้งแรกเมื่อเปิดระบบนั้นมาแล้ว 3 วัน (ไม่นับวันซ้ำ)
 *   - 1.2.0 ถามให้น้อยลง: ตอบแล้ว = ไม่ถามระบบนั้นอีก 1 ปี (หรือแอดมินตั้งรอบใหม่ที่นานกว่า) ;
 *     "ไว้ทีหลัง"/กากบาท = เว้นอย่างน้อย 30 วัน และครบ 2 ครั้งแล้วเลิกถามระบบนั้น 1 ปี ;
 *     เครื่องเดียวกันถามได้ไม่เกิน 1 ระบบ ต่อ 30 วัน (ใช้หลายระบบก็ไม่โดนถามถี่) ; ไม่ถามในเบราว์เซอร์ในแอป LINE/FB/IG
 *   - ไม่ขึ้นทับหน้าต่างอื่นของระบบ และไม่ขึ้นก่อนผู้ใช้กดรับทราบการแจ้งข้อมูลส่วนบุคคล
 * ปิดในระบบหนึ่ง: <script src=".../sysmenu.js" data-survey="off"> ; เปิดเองจากโค้ด: DSDSSurvey.open('doc')
 *
 * คำถามและคำตอบอยู่ที่ Apps Script "ระบบประเมินการใช้งาน DSDS" (ENDPOINT) + ชีตของโรงเรียน ไม่ใช้ฐานข้อมูลของระบบใด
 *   แก้คำถาม (ชุดกลาง * หรือเฉพาะระบบ) ตั้งรอบการถาม และดูสรุปผล: ENDPOINT?page=admin
 * ENDPOINT ว่าง = ปิดแบบประเมินทั้งหมด
 * ไม่ส่งชื่อ อีเมล หรือข้อมูลระบุตัวตน — ส่งเฉพาะ รหัสระบบ บทบาท (ถ้าระบบบอก) รหัสสุ่มของเครื่อง และคำตอบ
 */
(function () {
  'use strict';
  if (window.DSDSSurvey) return;

  // ===== ตัวรับคำตอบ: Apps Script "ระบบประเมินการใช้งาน DSDS" (แก้คำถาม/ดูผลที่ ENDPOINT?page=admin) =====
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbxodfuQ_rhYaMsgJoICuPYR-p9h9av2XpOd4xJwkDSOz5l1qn-iuES9hWDhv1Mby5HmvA/exec';   // ลิงก์ /exec ของ web app ; ว่าง = ปิดแบบประเมินทั้งหมด
  var ICONS_CSS = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css';
  var KEY = 'dsds.survey.';   // + รหัสระบบ -> { next: เวลาที่ถามได้อีกครั้ง (ms) } ; dsds.survey.cfg = ค่าตั้งล่าสุดจากชีต (sysmenu ใช้)
  var DAY = 864e5, FACE_IC = ['bi-emoji-frown', 'bi-emoji-expressionless', 'bi-emoji-neutral', 'bi-emoji-smile', 'bi-emoji-heart-eyes'];

  function ready() { return /^https:\/\/script\.google\.com\/.+\/exec$/.test(ENDPOINT); }
  function get(id) { try { return JSON.parse(localStorage.getItem(KEY + (id || '_')) || 'null') || {}; } catch (e) { return {}; } }
  function put(id, v) { try { localStorage.setItem(KEY + (id || '_'), JSON.stringify(v)); } catch (e) {} }
  var GAP = 30 * DAY, LATER_MIN = 30, LATER_MAX = 2, DONE_DAYS = 365;   // 1.2.0 ถามให้น้อยลง (ค่าขั้นต่ำ ไม่ว่าแอดมินจะตั้งเท่าไร)
  var INAPP = /\bLine\/|FBAN|FBAV|FB_IAB|Instagram|BytedanceWebview|musical_ly|TikTok|MicroMessenger|KAKAOTALK/i;
  function lastAny() { try { return Number(localStorage.getItem(KEY + 'last')) || 0; } catch (e) { return 0; } }
  function due(id) {
    if (!ready() || INAPP.test(navigator.userAgent || '')) return false;
    if (Date.now() - lastAny() < GAP) return false;   // เพิ่งถามระบบใดระบบหนึ่งในเครื่องนี้ไปแล้ว
    return (get(id).next || 0) <= Date.now();
  }
  function cid() {   // รหัสสุ่มประจำเครื่อง ใช้นับจำนวนคนตอบโดยไม่รู้ว่าเป็นใคร
    var k = KEY + 'cid', v = null; try { v = localStorage.getItem(k); } catch (e) {}
    if (!v) { v = (Date.now().toString(36) + Math.random().toString(36).slice(2, 10)).slice(0, 20); try { localStorage.setItem(k, v); } catch (e) {} }
    return v;
  }
  // JSONP (ใช้ได้ทั้งหน้า Firebase/GitHub และหน้าใน iframe ของ Apps Script)
  var seq = 0;
  function jsonp(params, done) {
    var cb = '__dsdsSv' + (++seq) + Date.now().toString(36), sc = document.createElement('script'), fin = false;
    function end(v) { if (fin) return; fin = true; try { delete window[cb]; } catch (e) { window[cb] = undefined; } if (sc.parentNode) sc.parentNode.removeChild(sc); done(v); }
    window[cb] = function (d) { end(d); };
    var q = Object.keys(params).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); }).join('&');
    sc.src = ENDPOINT + '?' + q + '&cb=' + cb; sc.onerror = function () { end(null); };
    setTimeout(function () { end(null); }, 20000);
    document.head.appendChild(sc);
  }

  var D = 'html[data-theme="dark"] ', B = 'html[data-bs-theme="dark"] ';
  function dk(sel, rule) { return sel.split(',').map(function (s) { s = s.trim(); return D + s + ', ' + B + s; }).join(', ') + ' { ' + rule + ' }'; }
  var BRAND = '#8a2432';
  var CSS = [
    '.dss-card, .dss-card * { box-sizing: border-box; }',
    '.dss-card { position: fixed; left: 12px; right: 12px; bottom: calc(12px + env(safe-area-inset-bottom, 0px)); z-index: 2147483100; margin: 0 auto; max-width: 460px;',
    '  display: block !important; padding: 16px 18px 14px; border-radius: 18px; background: #fff; color: #0f172a; text-align: left; font-family: inherit; font-size: 16px; line-height: 1.5;',
    '  border: 1px solid #e2e8f0; box-shadow: 0 16px 40px rgba(15,23,42,.22); transform: translateY(16px); opacity: 0; transition: transform .25s, opacity .25s; }',
    '.dss-card.is-in { transform: none; opacity: 1; }',
    '.dss-x { position: absolute; top: 8px; right: 8px; width: 34px; height: 34px; border: 0; border-radius: 10px; background: transparent; color: #94a3b8; cursor: pointer; display: grid; place-items: center; font-size: .95rem; }',
    '.dss-x:hover, .dss-x:focus-visible { background: #f1f5f9; color: #0f172a; outline: none; }',
    '.dss-k { font-size: .75rem; color: #64748b; margin: 0 36px 2px 0; }',
    '.dss-nw { white-space: nowrap; }',
    '.dss-body { max-height: min(60vh, 520px); overflow-y: auto; overscroll-behavior: contain; margin-right: -6px; padding-right: 6px; }',
    '.dss-qb + .dss-qb { margin-top: 12px; }',
    '.dss-opt-l { font-weight: 400; font-size: .78rem; color: #94a3b8; }',
    '.dss-q { font-size: .95rem; font-weight: 700; margin: 0 0 10px; padding-right: 30px; }',
    '.dss-faces { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-bottom: 4px; }',
    '.dss-face { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 8px 2px 6px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff;',
    '  color: #475569; font: inherit; font-size: .72rem; cursor: pointer; }',
    '.dss-face i { font-size: 1.45rem; line-height: 1; }',
    '.dss-face:hover, .dss-face:focus-visible { border-color: #e6b3bc; outline: none; }',
    '.dss-face.is-on { border-color: ' + BRAND + '; background: #fbeef0; color: ' + BRAND + '; font-weight: 700; }',
    '.dss-opts { display: flex; flex-wrap: wrap; gap: 6px; }',
    '.dss-opt { min-height: 38px; padding: 0 14px; border: 1px solid #e2e8f0; border-radius: 999px; background: #fff; color: #0f172a; font: inherit; font-size: .85rem; cursor: pointer; }',
    '.dss-opt:hover, .dss-opt:focus-visible { border-color: #e6b3bc; outline: none; }',
    '.dss-opt.is-on { border-color: ' + BRAND + '; background: #fbeef0; color: ' + BRAND + '; font-weight: 700; }',
        '.dss-note { width: 100%; min-height: 40px; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 12px; font: inherit; font-size: .85rem; resize: vertical; background: #fff; color: inherit; }',
    '.dss-act { display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px; }',
    '.dss-btn { min-height: 38px; padding: 0 18px; border-radius: 999px; font: inherit; font-size: .85rem; font-weight: 600; cursor: pointer; border: 1px solid #e2e8f0; background: #fff; color: #0f172a; }',
    '.dss-btn.is-main { background: ' + BRAND + '; border-color: ' + BRAND + '; color: #fff; }',
    '.dss-btn[disabled] { opacity: .45; cursor: default; }',
    '.dss-thanks { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: .95rem; }',
    '.dss-thanks i { color: #16a34a; font-size: 1.3rem; }',
    '@media (prefers-reduced-motion: reduce) { .dss-card { transition: none; } }',
    '@media print { .dss-card { display: none !important; } }',
    dk('.dss-card', 'background: #161b24; color: #e8effc; border-color: #282f3a; box-shadow: 0 24px 60px rgba(0,0,0,.55);'),
    dk('.dss-k', 'color: #9aa6b8;'),
    dk('.dss-face, .dss-opt, .dss-btn, .dss-note', 'background: #1b212b; border-color: #2d3948; color: #e8effc;'),
    dk('.dss-face.is-on, .dss-opt.is-on', 'background: #3a1d24; border-color: #e58a9b; color: #f0a3b0;'),
    dk('.dss-btn.is-main', 'background: #a3384a; border-color: #a3384a; color: #fff;'),
    dk('.dss-x:hover', 'background: #202631; color: #e8effc;')
  ].join('\n');
  function ensureStyle() {
    if (document.getElementById('dss-style')) return;
    if (!document.querySelector('link[href*="bootstrap-icons"]')) {
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = ICONS_CSS; document.head.appendChild(l);
    }
    var st = document.createElement('style'); st.id = 'dss-style'; st.textContent = CSS; document.head.appendChild(st);
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function sysName(id) {
    try { var P = window.DSDSPrivacy && window.DSDSPrivacy.systems(); if (P && P[id]) return P[id].name; } catch (e) {}
    try { var L = window.DSDSMenu && window.DSDSMenu.systems; for (var i = 0; L && i < L.length; i++) if (L[i].id === id) return L[i].name; } catch (e) {}
    return 'ระบบนี้';
  }
  var BUSY = '[role="dialog"], [aria-modal="true"], dialog[open], .modal.show, .swal2-container, .sheet-bg, .modal-bg, .dsa-splash, .dsa-root, .dsp-root, .dsp-card, .dsm-panel[aria-hidden="false"]';
  function busy() {
    var els = document.querySelectorAll(BUSY);
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.closest('.dss-card')) continue;
      if ((e.offsetWidth || e.offsetHeight) && getComputedStyle(e).visibility !== 'hidden') return true;
    }
    return false;
  }

  var card = null, watch = null, waitN = 0;
  function remove() {
    if (watch) { clearInterval(watch); watch = null; }
    if (!card) return;
    var c = card; card = null;
    c.classList.remove('is-in');
    setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 250);
  }
  var CFG = { first: 3, repeat: 60, later: 7 };
  function later(id) {
    var n = (get(id).laters || 0) + 1;
    put(id, { next: Date.now() + (n >= LATER_MAX ? DONE_DAYS : Math.max(LATER_MIN, CFG.later)) * DAY, laters: n });
    remove();
  }

  // ดึงชุดคำถาม (เบื้องหลัง) -> ได้แล้วค่อยขึ้นการ์ด ผู้ใช้ไม่ต้องรอ
  function open(id, role, force) {
    id = String(id || '_');
    if (card || !ready()) return false;
    jsonp({ a: 'q', sys: id }, function (d) {
      if (!d || !d.ok || !d.qs || !d.qs.length) return;
      if (d.cfg) { CFG = { first: +d.cfg.first || 3, repeat: +d.cfg.repeat || 60, later: +d.cfg.later || 7 }; try { localStorage.setItem(KEY + 'cfg', JSON.stringify(CFG)); } catch (e) {} }
      show(id, role, d.qs, force);
    });
    return true;
  }
  function qHtml(q, i) {
    var h = '<div class="dss-qb" data-q="' + i + '"><div class="dss-q">' + esc(q.text) + (q.req ? '' : ' <span class="dss-opt-l">(ไม่บังคับ)</span>') + '</div>';
    if (q.type === 'scale') {
      var lb = q.opts && q.opts.length === 5 ? q.opts : ['แย่', 'พอใช้', 'ปานกลาง', 'ดี', 'ดีมาก'];
      h += '<div class="dss-faces">' + lb.map(function (l, k) { return '<button type="button" class="dss-face" data-v="' + (k + 1) + '" aria-pressed="false"><i class="bi ' + FACE_IC[k] + '" aria-hidden="true"></i>' + esc(l) + '</button>'; }).join('') + '</div>';
    } else if (q.type === 'choice') {
      h += '<div class="dss-opts">' + (q.opts || []).map(function (o) { return '<button type="button" class="dss-opt" data-v="' + esc(o) + '" aria-pressed="false">' + esc(o) + '</button>'; }).join('') + '</div>';
    } else {
      h += '<textarea class="dss-note" rows="1" maxlength="1000" placeholder="พิมพ์คำตอบ"></textarea>';
    }
    return h + '</div>';
  }
  function show(id, role, qs, force) {
    if (card) return;
    if (!force && busy()) { if (waitN++ < 200) setTimeout(function () { show(id, role, qs); }, 1500); return; }
    ensureStyle();
    var ans = {};
    card = document.createElement('div'); card.className = 'dss-card dsm-ext'; card.setAttribute('role', 'region'); card.setAttribute('aria-label', 'แบบประเมินการใช้งาน');
    card.innerHTML = '<button type="button" class="dss-x" data-dss="later" aria-label="ไว้ทีหลัง"><i class="bi bi-x-lg"></i></button>' +
      '<div class="dss-k"><span class="dss-nw">ช่วยเราปรับปรุง ' + esc(sysName(id)) + '</span> · <span class="dss-nw">' + qs.length + ' คำถาม ไม่ระบุชื่อ</span></div>' +
      '<div class="dss-body">' + qs.map(qHtml).join('') + '</div>' +
      '<div class="dss-act"><button type="button" class="dss-btn" data-dss="later">ไว้ทีหลัง</button>' +
      '<button type="button" class="dss-btn is-main" data-dss="send" disabled>ส่ง</button></div>';
    function sync() {
      card.querySelectorAll('.dss-qb').forEach(function (b) {
        var q = qs[+b.getAttribute('data-q')];
        b.querySelectorAll('[data-v]').forEach(function (x) { var on = String(ans[q.id]) === x.getAttribute('data-v'); x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on); });
      });
      card.querySelector('[data-dss="send"]').disabled = !qs.every(function (q) { return !q.req || (ans[q.id] != null && String(ans[q.id]).trim() !== ''); });
    }
    card.addEventListener('input', function (e) {
      var b = e.target.closest('.dss-qb'); if (!b) return;
      ans[qs[+b.getAttribute('data-q')].id] = e.target.value.trim(); sync();
    });
    card.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('button'); if (!t || !card) return;
      var b = t.closest('.dss-qb');
      if (b && t.hasAttribute('data-v')) { var q = qs[+b.getAttribute('data-q')]; ans[q.id] = q.type === 'scale' ? +t.getAttribute('data-v') : t.getAttribute('data-v'); sync(); return; }
      var k = t.getAttribute('data-dss');
      if (k === 'later') { later(id); return; }
      if (k === 'send' && !t.disabled) {
        put(id, { next: Date.now() + Math.max(DONE_DAYS, CFG.repeat) * DAY, last: Date.now(), done: 1 });
        jsonp({ a: 's', sys: id, role: role || '-', cid: cid(), ans: JSON.stringify(ans) }, function () {});
        card.innerHTML = '<div class="dss-thanks"><i class="bi bi-check-circle-fill" aria-hidden="true"></i>ขอบคุณครับ คำตอบของคุณช่วยให้ระบบดีขึ้น</div>';
        setTimeout(remove, 2200);
      }
    });
    try { localStorage.setItem(KEY + 'last', String(Date.now())); } catch (e) {}   // นับว่าเครื่องนี้ถูกถามแล้ว (ทุกระบบรอ 30 วัน)
    (document.body || document.documentElement).appendChild(card);
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (card) card.classList.add('is-in'); }); });
    watch = setInterval(function () { if (card) card.style.visibility = busy() ? 'hidden' : ''; }, 1500);
  }

  window.DSDSSurvey = {
    open: function (id, role) { return open(id, role, true); },
    maybe: function (id, role) { return due(id) ? open(id, role) : false; },
    due: due, ready: ready, version: '1.2.0'
  };
})();
