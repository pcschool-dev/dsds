/*!
 * แบบประเมินการใช้งานสั้น 2 คำถาม — ไฟล์กลาง ทุกระบบของโรงเรียนปากช่องใช้ร่วมกัน
 * https://pcschool-dev.github.io/dsds/survey.js
 *
 * ปกติไม่ต้องใส่เอง: sysmenu.js (1.6.0+) นับวันที่ผู้ใช้เปิดระบบไว้ในเครื่อง แล้วโหลดไฟล์นี้เมื่อถึงรอบ
 *   - ถามครั้งแรกเมื่อเปิดระบบนั้นมาแล้ว 3 วัน (ไม่นับวันซ้ำ) จากนั้นถามซ้ำทุก 60 วัน ; กด "ไว้ทีหลัง" = ถามใหม่ใน 7 วัน
 *   - ไม่ขึ้นทับหน้าต่างอื่นของระบบ และไม่ขึ้นก่อนผู้ใช้กดรับทราบการแจ้งข้อมูลส่วนบุคคล
 * ปิดในระบบหนึ่ง: <script src=".../sysmenu.js" data-survey="off"> ; เปิดเองจากโค้ด: DSDSSurvey.open('doc')
 *
 * คำตอบส่งเข้า Google Form ของโรงเรียน (FORM ข้างล่าง) ไม่ใช้ฐานข้อมูลของระบบใด ดูสรุปผลได้ที่แท็บ "คำตอบ" ของฟอร์ม
 * FORM.id ว่าง = ปิดแบบประเมินทั้งหมด (ยังไม่ถามใคร)
 * ไม่ส่งชื่อ อีเมล หรือข้อมูลระบุตัวตน — ส่งเฉพาะ รหัสระบบ บทบาท (ครู/นักเรียน ถ้าระบบบอก) คะแนน คำตอบ และข้อเสนอแนะที่พิมพ์เอง
 */
(function () {
  'use strict';
  if (window.DSDSSurvey) return;

  // ===== ตั้งค่า Google Form =====
  // id = ส่วน /forms/d/e/<id>/ ของลิงก์ฟอร์ม ; entry = เลข entry.xxxx ของแต่ละช่อง (ดูจาก "รับลิงก์ที่กรอกข้อมูลไว้ล่วงหน้า")
  var FORM = {
    id: '',
    entry: { sys: '', role: '', score: '', again: '', note: '' }
  };
  var AGAIN = ['ใช้ต่อแน่นอน', 'อาจจะใช้', 'ไม่ใช้ ถ้าไม่บังคับ'];
  var FACES = [['bi-emoji-frown', 'แย่'], ['bi-emoji-expressionless', 'พอใช้'], ['bi-emoji-neutral', 'ปานกลาง'], ['bi-emoji-smile', 'ดี'], ['bi-emoji-heart-eyes', 'ดีมาก']];
  var ICONS_CSS = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css';
  var KEY = 'dsds.survey.';   // + รหัสระบบ -> { next: เวลาที่ถามได้อีกครั้ง (ms) }
  var DAY = 864e5, AGAIN_DAYS = 60, LATER_DAYS = 7;

  function ready() { return !!(FORM.id && FORM.entry.score && FORM.entry.again); }
  function get(id) { try { return JSON.parse(localStorage.getItem(KEY + (id || '_')) || 'null') || {}; } catch (e) { return {}; } }
  function put(id, v) { try { localStorage.setItem(KEY + (id || '_'), JSON.stringify(v)); } catch (e) {} }
  function due(id) { return ready() && (get(id).next || 0) <= Date.now(); }

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
    '.dss-step2 { margin-top: 12px; }',
    '.dss-note { width: 100%; margin-top: 10px; min-height: 40px; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 12px; font: inherit; font-size: .85rem; resize: vertical; background: #fff; color: inherit; }',
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

  function send(o) {
    var f = new URLSearchParams(), E = FORM.entry;
    if (E.sys) f.append('entry.' + E.sys, o.sys);
    if (E.role) f.append('entry.' + E.role, o.role || '-');
    f.append('entry.' + E.score, String(o.score));
    f.append('entry.' + E.again, o.again);
    if (E.note && o.note) f.append('entry.' + E.note, o.note.slice(0, 1000));
    // Google Form ไม่ตอบกลับข้ามโดเมน -> no-cors (ส่งได้แต่อ่านผลไม่ได้)
    try {
      return fetch('https://docs.google.com/forms/d/e/' + encodeURIComponent(FORM.id) + '/formResponse', { method: 'POST', mode: 'no-cors', body: f });
    } catch (e) { return Promise.reject(e); }
  }

  var card = null, watch = null, waitN = 0;
  function remove() {
    if (watch) { clearInterval(watch); watch = null; }
    if (!card) return;
    var c = card; card = null;
    c.classList.remove('is-in');
    setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 250);
  }
  function later(id) { put(id, { next: Date.now() + LATER_DAYS * DAY }); remove(); }

  function open(id, role, force) {
    id = String(id || '_');
    if (card || !ready()) return false;
    if (!force && busy()) { if (waitN++ < 200) setTimeout(function () { open(id, role); }, 1500); return false; }
    ensureStyle();
    var st = { score: 0, again: '' };
    card = document.createElement('div'); card.className = 'dss-card dsm-ext'; card.setAttribute('role', 'region'); card.setAttribute('aria-label', 'แบบประเมินการใช้งาน');
    card.innerHTML = '<button type="button" class="dss-x" data-dss="later" aria-label="ไว้ทีหลัง"><i class="bi bi-x-lg"></i></button>' +
      '<div class="dss-k"><span class="dss-nw">ช่วยเราปรับปรุง ' + esc(sysName(id)) + '</span> · <span class="dss-nw">2 คำถาม ไม่ระบุชื่อ</span></div>' +
      '<div class="dss-q">ระบบนี้ช่วยให้งานของคุณง่ายขึ้นแค่ไหน</div>' +
      '<div class="dss-faces">' + FACES.map(function (f, i) {
        return '<button type="button" class="dss-face" data-score="' + (i + 1) + '" aria-pressed="false"><i class="bi ' + f[0] + '" aria-hidden="true"></i>' + f[1] + '</button>';
      }).join('') + '</div>' +
      '<div class="dss-step2"><div class="dss-q">ถ้าไม่บังคับใช้ คุณจะยังใช้ระบบนี้ต่อไหม</div>' +
      '<div class="dss-opts">' + AGAIN.map(function (a) { return '<button type="button" class="dss-opt" data-again="' + esc(a) + '" aria-pressed="false">' + esc(a) + '</button>'; }).join('') + '</div>' +
      '<textarea class="dss-note" rows="1" maxlength="1000" placeholder="อยากให้ปรับอะไร (ไม่บังคับ)"></textarea></div>' +
      '<div class="dss-act"><button type="button" class="dss-btn" data-dss="later">ไว้ทีหลัง</button>' +
      '<button type="button" class="dss-btn is-main" data-dss="send" disabled>ส่ง</button></div>';
    function sync() {
      card.querySelectorAll('[data-score]').forEach(function (b) { var on = +b.getAttribute('data-score') === st.score; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
      card.querySelectorAll('[data-again]').forEach(function (b) { var on = b.getAttribute('data-again') === st.again; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
      card.querySelector('[data-dss="send"]').disabled = !(st.score && st.again);
    }
    card.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('button'); if (!t || !card) return;
      if (t.hasAttribute('data-score')) { st.score = +t.getAttribute('data-score'); sync(); return; }
      if (t.hasAttribute('data-again')) { st.again = t.getAttribute('data-again'); sync(); return; }
      var k = t.getAttribute('data-dss');
      if (k === 'later') { later(id); return; }
      if (k === 'send' && st.score && st.again) {
        var note = (card.querySelector('.dss-note').value || '').trim();
        put(id, { next: Date.now() + AGAIN_DAYS * DAY, last: Date.now() });
        send({ sys: id, role: role, score: st.score, again: st.again, note: note }).catch(function () {});
        card.innerHTML = '<div class="dss-thanks"><i class="bi bi-check-circle-fill" aria-hidden="true"></i>ขอบคุณครับ คำตอบของคุณช่วยให้ระบบดีขึ้น</div>';
        setTimeout(remove, 2200);
      }
    });
    (document.body || document.documentElement).appendChild(card);
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (card) card.classList.add('is-in'); }); });
    watch = setInterval(function () { if (card) card.style.visibility = busy() ? 'hidden' : ''; }, 1500);
    return true;
  }

  window.DSDSSurvey = {
    open: function (id, role) { return open(id, role, true); },
    maybe: function (id, role) { return due(id) ? open(id, role) : false; },
    due: due, ready: ready, version: '1.0.0'
  };
})();
