/*!
 * กล่อง "ความเป็นส่วนตัวและความปลอดภัยข้อมูล" (PDPA) — ไฟล์กลางไฟล์เดียว ทุกระบบของโรงเรียนปากช่องใช้ร่วมกัน
 * https://pcschool-dev.github.io/dsds/privacy.js
 *
 * ปกติไม่ต้องใส่เอง: sysmenu.js (1.6.0+) โหลดไฟล์นี้ให้
 *   - ครั้งแรกที่ผู้ใช้เปิดระบบ (ต่อระบบ ต่อเครื่อง) -> การ์ดแจ้งด้านล่าง "รับทราบ" / "อ่านรายละเอียด"
 *   - ปุ่ม "ความเป็นส่วนตัวและข้อมูล" ท้ายแผงเมนู ☰ -> กล่องรายละเอียดของระบบนั้น
 * เรียกจากโค้ด: DSDSPrivacy.open('doc') / DSDSPrivacy.notice('doc') ; ปุ่มของระบบเอง: ใส่ data-dsds-privacy
 * ปิดการ์ดแจ้งในระบบที่มีหน้ายินยอมของตัวเองแล้ว: <script src=".../sysmenu.js" data-privacy="off">
 *
 * เนื้อหาแต่ละระบบอยู่ใน SYS ข้างล่าง (รหัสเดียวกับคอลัมน์ "รหัส" ในชีตรายการระบบ DSDS)
 * แก้เนื้อหาแล้วอยากให้ทุกคนเห็นการ์ดแจ้งใหม่อีกครั้ง -> เพิ่ม VERSION
 * ไม่อ่าน/เขียนฐานข้อมูลใด ๆ — จำการกด "รับทราบ" ไว้ในเครื่อง (localStorage) เท่านั้น
 */
(function () {
  'use strict';
  if (window.DSDSPrivacy) return;

  var VERSION = '2569-1';   // เปลี่ยนเมื่อเนื้อหาเปลี่ยนสาระ -> ทุกคนเห็นการ์ดแจ้งอีกครั้ง
  var UPDATED = '15 พฤศจิกายน 2569';
  var PAGE = 'https://pcschool-dev.github.io/dsds/privacy.html';
  var CONTACT = 'https://pcschool-dev.github.io/dsds/line.html';
  var ICONS_CSS = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css';
  var KEY = 'dsds.pdpa.';

  // ===== เนื้อหาต่อระบบ =====
  // data = ข้อมูลที่เก็บ ; use = ใช้ทำอะไร ; where = เก็บที่ไหน ; who = ใครเห็น ; keep = เก็บนานเท่าไร ; owner = ฝ่ายที่ดูแลข้อมูล (ขอแก้ไขข้อมูลที่นี่)
  var SYS = {
    doc: {
      name: 'ระบบรับหนังสือราชการ',
      data: ['ชื่อ-สกุล ตำแหน่ง กลุ่มงาน อีเมล และบัญชี LINE ที่คุณเชื่อมเอง', 'หนังสือราชการ ไฟล์แนบ การเสนอ การสั่งการ และลายมือชื่อ', 'ประวัติการเข้าใช้ (เวลา, IP, อุปกรณ์) และการเข้าสู่ระบบไม่สำเร็จ'],
      use: 'รับ-ส่ง เสนอ และสั่งการหนังสือราชการ แจ้งเตือนงานถึงคุณ และตรวจสอบความปลอดภัยของบัญชี',
      where: 'Google Firebase / Google Cloud ของโรงเรียน ไฟล์แนบอยู่ใน Shared Drive ของโรงเรียน',
      who: 'ผู้รับตามที่ส่งถึง ผู้บริหารตามสายงาน หนังสือลับหรือจำกัดผู้รับ เห็นเฉพาะผู้ที่มีสิทธิ์ และผู้ดูแลระบบ',
      keep: 'หนังสือเก็บตามระเบียบงานสารบรรณ ประวัติการเข้าใช้เก็บไว้เพื่อตรวจสอบความปลอดภัย',
      owner: 'งานสารบรรณ'
    },
    hr: {
      name: 'ระบบข้อมูลบุคลากร',
      data: ['ข้อมูลส่วนตัวและการทำงาน เช่น เลขประจำตัวประชาชน ตำแหน่ง วิทยฐานะ ประวัติรับราชการ เงินเดือน ใบอนุญาตประกอบวิชาชีพ', 'เวลาเข้า-ออกงาน การลา และการไปราชการ'],
      use: 'งานทะเบียนประวัติบุคลากร ทำคำสั่ง สรุปเวลาปฏิบัติราชการ และแจ้งเตือนใบอนุญาตใกล้หมดอายุ',
      where: 'Google Firebase / Google Cloud ของโรงเรียน',
      who: 'เจ้าของข้อมูลเห็นข้อมูลของตนเอง งานบุคคลและผู้บริหารตามสิทธิ์ การส่งออกข้อมูลต้องยืนยันรหัสผ่านซ้ำ ระบุเหตุผล และถูกบันทึกทุกครั้ง ข้อมูลส่วนบุคคลไม่ถูกส่งให้ AI ประมวลผล',
      keep: 'ตลอดระยะเวลาที่ปฏิบัติงาน และตามระเบียบการเก็บทะเบียนประวัติข้าราชการ',
      owner: 'งานบุคคล'
    },
    ems: {
      name: 'ระบบเช็คชื่อและคะแนน (EMS)',
      data: ['นักเรียน: ชื่อ-สกุล เลขประจำตัว ห้องเรียน การมาเรียน คะแนน', 'ครู: ตารางสอน การลา การไปราชการ การลงเวลา (และพิกัดเฉพาะตอนลงเวลาที่ใช้พิกัด)', 'ผู้ปกครอง: ใช้เลขประจำตัวนักเรียนกับเลขประจำตัวประชาชน 4 หลักท้าย เพื่อผูกบัญชีกับบุตรหลาน', 'ประวัติการใช้งาน (เวลา, IP, อุปกรณ์)'],
      use: 'บันทึกการมาเรียนและคะแนน สรุปผลให้ครูและผู้ปกครอง จัดสอนแทน และตรวจสอบความปลอดภัย',
      where: 'Google Firebase ของโรงเรียน สำรองข้อมูลทุกคืนไว้ใน Google Drive (เก็บ 30 ชุดล่าสุด)',
      who: 'ครูเห็นเฉพาะวิชาและห้องที่สอนหรือดูแล ผู้ปกครองเห็นเฉพาะบุตรหลานที่ผูกไว้ ผู้บริหารและผู้ดูแลระบบตามสิทธิ์',
      keep: 'ข้อมูลการเรียนเก็บตามระเบียบงานวัดผล IP เก็บ 90 วัน ประวัติการใช้งานเก็บ 1 ปี',
      owner: 'งานวิชาการ / งานทะเบียน'
    },
    ask: {
      name: 'ระบบประเมินครูผู้สอน',
      data: ['ข้อมูลบัญชีผู้ใช้ (ครู/นักเรียน) ห้องเรียน วิชาที่เรียน', 'คำตอบแบบประเมินการสอน'],
      use: 'ให้นักเรียนประเมินการสอน และสรุปผลเพื่อพัฒนาการเรียนการสอน',
      where: 'Google Sheets ของโรงเรียน ผ่าน Google Apps Script',
      who: 'ครูเห็นผลประเมินของตนเองตามที่ระบบสรุป ผู้บริหารและผู้ดูแลระบบตามสิทธิ์',
      keep: 'ตามรอบการประเมินของโรงเรียน',
      owner: 'งานวิชาการ'
    },
    plan: {
      name: 'ระบบแผนปฏิบัติการ PC Plan',
      data: ['ชื่อผู้ใช้ ตำแหน่ง กลุ่มงาน', 'โครงการ กิจกรรม งบประมาณ การเบิกจ่าย', 'ประวัติการแก้ไขข้อมูล (ใคร แก้อะไร เมื่อไร)'],
      use: 'จัดทำแผนปฏิบัติการและติดตามการใช้งบประมาณ',
      where: 'Google Firebase ของโรงเรียน',
      who: 'ผู้ใช้ตามตารางสิทธิ์ของระบบ ผู้บริหาร และผู้ดูแลระบบ',
      keep: 'ตามปีงบประมาณ และตามระเบียบการเก็บเอกสารการเงิน',
      owner: 'งานแผนงานและงบประมาณ'
    },
    guide: {
      name: 'ระบบจองคิวแนะแนว',
      data: ['ชื่อ-สกุล ชั้น ห้อง ช่องทางติดต่อ', 'วันเวลาที่จอง และเรื่องที่ขอรับคำปรึกษา'],
      use: 'นัดหมายรับคำปรึกษากับครูแนะแนว',
      where: 'Google Firebase / Google Cloud ของโรงเรียน',
      who: 'เฉพาะครูแนะแนวและผู้ดูแลระบบ เรื่องที่ปรึกษาถือเป็นความลับ',
      keep: 'ตลอดปีการศึกษา',
      owner: 'งานแนะแนว'
    },
    m6: {
      name: 'ระบบข้อมูลการศึกษาต่อ ม.6',
      data: ['ชื่อ-สกุล ห้อง เลขประจำตัวนักเรียน', 'สถานศึกษา/คณะที่ได้รับคัดเลือก หรือแผนหลังจบการศึกษา'],
      use: 'ติดตามและรายงานผลการศึกษาต่อของนักเรียน ม.6',
      where: 'Google Firebase / Google Cloud ของโรงเรียน',
      who: 'นักเรียนเจ้าของข้อมูล ครูที่ปรึกษา ครูแนะแนว ผู้บริหาร และผู้ดูแลระบบ',
      keep: 'ตามรอบรายงานของโรงเรียน',
      owner: 'งานแนะแนว'
    },
    regpc: {
      name: 'ระบบรับสมัครนักเรียน',
      data: ['ข้อมูลผู้สมัคร เช่น ชื่อ-สกุล เลขประจำตัวประชาชน วันเกิด ที่อยู่ ผลการเรียน', 'ข้อมูลผู้ปกครองและเอกสารประกอบการสมัคร'],
      use: 'พิจารณารับนักเรียน ประกาศผล ยืนยันสิทธิ์ และรายงานตัว',
      where: 'Google Sheets / Google Drive ของโรงเรียน ผ่าน Google Apps Script',
      who: 'งานรับนักเรียน งานทะเบียน และผู้ดูแลระบบ',
      keep: 'ตลอดกระบวนการรับสมัคร ผู้ที่ได้รับเข้าเรียนข้อมูลจะเข้าสู่ทะเบียนนักเรียน',
      owner: 'งานรับนักเรียน / งานทะเบียน'
    },
    send: {
      name: 'ระบบบันทึกหนังสือราชการ',
      data: ['ชื่อผู้ใช้ กลุ่มงาน', 'เลขหนังสือ เรื่อง ผู้รับ และไฟล์หนังสือ'],
      use: 'ออกเลขและบันทึกหนังสือส่ง',
      where: 'Google Sheets / Google Drive ของโรงเรียน ผ่าน Google Apps Script',
      who: 'ผู้ใช้ในกลุ่มงานตามสิทธิ์ งานสารบรรณ และผู้ดูแลระบบ',
      keep: 'ตามระเบียบงานสารบรรณ',
      owner: 'งานสารบรรณ'
    },
    account: {
      name: 'บัญชีผู้ใช้ โรงเรียนปากช่อง',
      data: ['ชื่อ-สกุล ชื่อผู้ใช้ อีเมล บทบาท (ครู/นักเรียน)', 'รหัสผ่าน (เก็บแบบเข้ารหัสทางเดียว ไม่มีใครอ่านรหัสจริงได้ รวมถึงผู้ดูแลระบบ)'],
      use: 'ยืนยันตัวตนเพื่อเข้าใช้ทุกระบบของโรงเรียนด้วยบัญชีเดียว',
      where: 'Google Sheets ของโรงเรียน ผ่าน Google Apps Script',
      who: 'เจ้าของบัญชี และผู้ดูแลระบบ (ดูแลบัญชี/รีเซ็ตรหัส ไม่เห็นรหัสผ่าน)',
      keep: 'ตลอดระยะเวลาที่เป็นครูหรือนักเรียนของโรงเรียน',
      owner: 'งานพัฒนาและบริการระบบดิจิทัล (DSDS)'
    }
  };
  var ALIAS = { dss: 'ems', check: 'ems', senddoc: 'send', guidance: 'guide', highered: 'm6', 'higher-ed': 'm6', admin: 'regpc', admission: 'regpc' };
  var GENERIC = {
    name: 'ระบบนี้',
    data: ['ข้อมูลบัญชีผู้ใช้ (ชื่อ-สกุล บทบาท กลุ่มงานหรือห้องเรียน)', 'ข้อมูลที่คุณบันทึกในระบบเพื่อใช้งานตามหน้าที่'],
    use: 'ให้บริการตามภารกิจของโรงเรียนที่ระบบนี้รองรับ',
    where: 'บริการคลาวด์ของ Google ภายใต้บัญชีของโรงเรียน',
    who: 'ผู้ใช้ตามสิทธิ์ที่ระบบกำหนด ผู้บริหาร และผู้ดูแลระบบ',
    keep: 'เท่าที่จำเป็นตามภารกิจและระเบียบของทางราชการ',
    owner: 'ฝ่ายที่รับผิดชอบระบบ'
  };
  var COMMON = [
    ['bi-bank', 'ฐานทางกฎหมาย', 'โรงเรียนเก็บและใช้ข้อมูลเพื่อปฏิบัติหน้าที่ตามภารกิจของรัฐ (พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 มาตรา 24(4)) เท่าที่จำเป็น ไม่ขาย ไม่ใช้เพื่อการค้า'],
    ['bi-shield-lock', 'การป้องกัน', 'เชื่อมต่อแบบเข้ารหัส (HTTPS) ต้องเข้าสู่ระบบก่อนใช้งาน แบ่งสิทธิ์ตามหน้าที่ บันทึกประวัติการเข้าใช้เพื่อตรวจสอบสิ่งผิดปกติ และสำรองข้อมูล'],
    ['bi-person-check', 'สิทธิ์ของคุณ', 'ขอดู ขอสำเนา ขอแก้ไขข้อมูลที่ไม่ถูกต้อง ขอให้ลบหรือระงับการใช้ข้อมูล (เท่าที่ไม่ขัดกับหน้าที่ตามกฎหมายของโรงเรียน) และร้องเรียนได้']
  ];

  function sysOf(id) { id = String(id || '').trim().toLowerCase(); return SYS[id] || SYS[ALIAS[id]] || GENERIC; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function seen(id) { try { return localStorage.getItem(KEY + (id || '_')) === VERSION; } catch (e) { return false; } }
  function markSeen(id) { try { localStorage.setItem(KEY + (id || '_'), VERSION); } catch (e) {} }

  // ทุก selector อยู่ใต้ .dsp- ; dark ตาม html[data-theme|data-bs-theme] เหมือน sysmenu/about
  var D = 'html[data-theme="dark"] ', B = 'html[data-bs-theme="dark"] ';
  function dk(sel, rule) { return sel.split(',').map(function (s) { s = s.trim(); return D + s + ', ' + B + s; }).join(', ') + ' { ' + rule + ' }'; }
  var BRAND = '#8a2432';
  var CSS = [
    '.dsp-root, .dsp-root *, .dsp-card, .dsp-card * { box-sizing: border-box; }',
    '.dsp-root { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 2147483200; display: flex !important; align-items: center; justify-content: center; padding: 16px;',
    '  font-family: inherit; font-size: 16px; line-height: 1.5; }',
    '.dsp-scrim { position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: rgba(15,23,42,.5); opacity: 0; transition: opacity .2s; }',
    '.dsp-box { position: relative; width: 100%; max-width: 560px; max-height: calc(100vh - 32px); display: flex; flex-direction: column;',
    '  background: #fff; color: #0f172a; border-radius: 20px; box-shadow: 0 24px 60px rgba(15,23,42,.3); overflow: hidden;',
    '  transform: translateY(10px) scale(.98); opacity: 0; transition: transform .2s, opacity .2s; }',
    '.dsp-root.is-in .dsp-scrim { opacity: 1; } .dsp-root.is-in .dsp-box { transform: none; opacity: 1; }',
    '.dsp-head { flex: none; display: flex; align-items: center; gap: 12px; padding: 18px 56px 14px 20px; border-bottom: 1px solid #eef2f7; }',
    '.dsp-badge { flex: none; width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; font-size: 1.3rem; color: ' + BRAND + '; background: #fbeef0; }',
    '.dsp-title { margin: 0; font-size: 1.08rem; font-weight: 800; line-height: 1.3; color: inherit; }',
    '.dsp-sys { font-size: .82rem; color: #64748b; margin-top: 2px; }',
    '.dsp-x { position: absolute; top: 12px; right: 12px; width: 36px; height: 36px; border: 0; border-radius: 10px; background: transparent;',
    '  color: #94a3b8; font-size: 1rem; cursor: pointer; display: grid; place-items: center; }',
    '.dsp-x:hover, .dsp-x:focus-visible { background: #f1f5f9; color: #0f172a; outline: none; }',
    '.dsp-body { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 14px 20px 6px; text-align: left; }',
    '.dsp-sec { display: flex; gap: 12px; padding: 11px 0; border-bottom: 1px solid #f1f5f9; }',
    '.dsp-sec:last-child { border-bottom: 0; }',
    '.dsp-ic { flex: none; width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; background: #f1f5f9; color: #475569; font-size: 1rem; }',
    '.dsp-sec b { display: block; font-size: .9rem; font-weight: 700; margin-bottom: 2px; }',
    '.dsp-sec p, .dsp-sec li { margin: 0; font-size: .86rem; color: #334155; line-height: 1.6; }',
    '.dsp-sec ul { margin: 0; padding-left: 1.1em; }',
    '.dsp-foot { flex: none; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; padding: 12px 20px calc(14px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid #eef2f7; }',
    '.dsp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 42px; padding: 0 20px; border-radius: 999px; font: inherit;',
    '  font-size: .9rem; font-weight: 600; cursor: pointer; text-decoration: none !important; border: 1px solid #e2e8f0; background: #fff; color: #0f172a !important; }',
    '.dsp-btn:hover, .dsp-btn:focus-visible { background: #f8fafc; outline: none; }',
    '.dsp-btn.is-main { background: ' + BRAND + '; border-color: ' + BRAND + '; color: #fff !important; }',
    '.dsp-btn.is-main:hover, .dsp-btn.is-main:focus-visible { background: #741d2a; }',
    '.dsp-meta { width: 100%; text-align: center; font-size: .72rem; color: #94a3b8; }',
    'html.dsp-open { overflow: hidden; }',
    // การ์ดแจ้งครั้งแรก
    '.dsp-card { position: fixed; left: 12px; right: 12px; bottom: calc(12px + env(safe-area-inset-bottom, 0px)); z-index: 2147483100; margin: 0 auto; max-width: 560px;',
    '  display: flex !important; gap: 12px; align-items: flex-start; padding: 14px 16px; border-radius: 18px; background: #fff; color: #0f172a; text-align: left;',
    '  font-family: inherit; font-size: 16px; line-height: 1.5; border: 1px solid #e2e8f0; box-shadow: 0 16px 40px rgba(15,23,42,.22);',
    '  transform: translateY(16px); opacity: 0; transition: transform .25s, opacity .25s; }',
    '.dsp-card.is-in { transform: none; opacity: 1; }',
    '.dsp-card .dsp-badge { width: 38px; height: 38px; font-size: 1.1rem; }',
    '.dsp-card-tx { flex: 1; min-width: 0; }',
    '.dsp-card-tx b { display: block; font-size: .92rem; font-weight: 700; }',
    '.dsp-card-tx p { margin: 2px 0 10px; font-size: .83rem; color: #475569; line-height: 1.55; }',
    '.dsp-card-act { display: flex; flex-wrap: wrap; gap: 8px; }',
    '.dsp-card .dsp-btn { min-height: 38px; padding: 0 16px; font-size: .85rem; }',
    '@media (max-width: 420px) { .dsp-card .dsp-badge { display: none; } .dsp-card-act .dsp-btn { flex: 1; } }',
    '@media (prefers-reduced-motion: reduce) { .dsp-scrim, .dsp-box, .dsp-card { transition: none; } }',
    '@media print { .dsp-root, .dsp-card { display: none !important; } }',
    dk('.dsp-scrim', 'background: rgba(0,0,0,.6);'),
    dk('.dsp-box, .dsp-card', 'background: #161b24; color: #e8effc; border-color: #282f3a; box-shadow: 0 24px 60px rgba(0,0,0,.55);'),
    dk('.dsp-head, .dsp-foot', 'border-color: #232a35;'),
    dk('.dsp-sec', 'border-color: #1f2630;'),
    dk('.dsp-badge', 'background: #3a1d24; color: #f0a3b0;'),
    dk('.dsp-ic', 'background: #202631; color: #acb4c0;'),
    dk('.dsp-sys, .dsp-meta', 'color: #9aa6b8;'),
    dk('.dsp-sec p, .dsp-sec li, .dsp-card-tx p', 'color: #c5cede;'),
    dk('.dsp-x:hover', 'background: #202631; color: #e8effc;'),
    dk('.dsp-btn', 'background: #1b212b; border-color: #2d3948; color: #e8effc !important;'),
    dk('.dsp-btn:hover', 'background: #202631;'),
    dk('.dsp-btn.is-main', 'background: #a3384a; border-color: #a3384a; color: #fff !important;')
  ].join('\n');

  function ensureStyle() {
    if (document.getElementById('dsp-style')) return;
    if (!document.querySelector('link[href*="bootstrap-icons"]')) {
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = ICONS_CSS; document.head.appendChild(l);
    }
    var st = document.createElement('style'); st.id = 'dsp-style'; st.textContent = CSS; document.head.appendChild(st);
  }
  function sec(icon, title, body) {
    var inner = Array.isArray(body) ? '<ul>' + body.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '<p>' + esc(body) + '</p>';
    return '<div class="dsp-sec"><span class="dsp-ic"><i class="bi ' + icon + '" aria-hidden="true"></i></span><div><b>' + esc(title) + '</b>' + inner + '</div></div>';
  }

  var root = null, lastFocus = null, curId = '';
  function boxHtml(id) {
    var S = sysOf(id);
    return '<div class="dsp-scrim" data-dsp="close"></div>' +
      '<div class="dsp-box" role="dialog" aria-modal="true" aria-labelledby="dspTitle">' +
      '<button type="button" class="dsp-x" data-dsp="close" aria-label="ปิด"><i class="bi bi-x-lg"></i></button>' +
      '<div class="dsp-head"><span class="dsp-badge"><i class="bi bi-shield-check" aria-hidden="true"></i></span>' +
        '<div><h2 class="dsp-title" id="dspTitle">ความเป็นส่วนตัวและความปลอดภัยข้อมูล</h2>' +
        '<div class="dsp-sys">' + esc(S === GENERIC ? 'โรงเรียนปากช่อง' : S.name) + '</div></div></div>' +
      '<div class="dsp-body">' +
        sec('bi-collection', 'ข้อมูลที่เก็บ', S.data) +
        sec('bi-bullseye', 'ใช้ทำอะไร', S.use) +
        sec('bi-cloud-check', 'เก็บไว้ที่ไหน', S.where) +
        sec('bi-people', 'ใครเห็นข้อมูลได้', S.who) +
        sec('bi-hourglass-split', 'เก็บนานเท่าไร', S.keep) +
        COMMON.map(function (c) { return sec(c[0], c[1], c[2]); }).join('') +
        sec('bi-chat-dots', 'ติดต่อเรื่องข้อมูลส่วนบุคคล', 'ขอแก้ไขข้อมูล: ' + S.owner + ' · เรื่องระบบหรือความปลอดภัย: งานพัฒนาและบริการระบบดิจิทัล (DSDS)') +
      '</div>' +
      '<div class="dsp-foot">' +
        '<a class="dsp-btn" href="' + PAGE + '" target="_blank" rel="noopener"><i class="bi bi-table" aria-hidden="true"></i>ภาพรวมทุกระบบ</a>' +
        '<a class="dsp-btn" href="' + CONTACT + '" target="_blank" rel="noopener"><i class="bi bi-line" aria-hidden="true"></i>ติดต่อ DSDS</a>' +
        '<button type="button" class="dsp-btn is-main" data-dsp="ok">รับทราบ</button>' +
        '<div class="dsp-meta">ปรับปรุงล่าสุด ' + UPDATED + '</div>' +
      '</div></div>';
  }
  function onKey(e) {
    if (!root) return;
    if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
    if (e.key === 'Tab') {
      var f = root.querySelectorAll('a[href],button'); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  function close() {
    if (!root) return;
    var r = root; root = null;
    document.documentElement.classList.remove('dsp-open');
    document.removeEventListener('keydown', onKey, true);
    r.classList.remove('is-in');
    setTimeout(function () { if (r.parentNode) r.parentNode.removeChild(r); }, 200);
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }
  function open(id) {
    if (root) return;
    curId = id || curId;
    if (window.DSDSMenu && window.DSDSMenu.close) window.DSDSMenu.close();
    hideCard();
    ensureStyle();
    lastFocus = document.activeElement;
    root = document.createElement('div'); root.className = 'dsp-root dsm-ext'; root.innerHTML = boxHtml(curId);
    root.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-dsp]'); if (!b) return;
      if (b.getAttribute('data-dsp') === 'ok') markSeen(curId);
      close();
    });
    document.body.appendChild(root);
    document.documentElement.classList.add('dsp-open');
    document.addEventListener('keydown', onKey, true);
    requestAnimationFrame(function () { if (root) { root.classList.add('is-in'); var b = root.querySelector('[data-dsp="ok"]'); if (b) b.focus({ preventScroll: true }); } });
  }

  // ===== การ์ดแจ้งครั้งแรก (ต่อระบบ ต่อเครื่อง) =====
  // ไม่ขึ้นทับหน้าต่างอื่นของระบบ (เช่น EMS เลือกรูปแบบหน้าจอ): รอจนไม่มีหน้าต่างเปิดอยู่ ; ขึ้นแล้วมีหน้าต่างเปิดทับ -> ซ่อนการ์ดชั่วคราว
  var BUSY = '[role="dialog"], [aria-modal="true"], dialog[open], .modal.show, .swal2-container, .sheet-bg, .modal-bg, .dsa-splash, .dsa-root, .dsm-panel[aria-hidden="false"]';
  function busy() {
    var els = document.querySelectorAll(BUSY);
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.closest('.dsp-root, .dsp-card')) continue;
      if ((e.offsetWidth || e.offsetHeight) && getComputedStyle(e).visibility !== 'hidden') return true;
    }
    return false;
  }
  var card = null, watch = null;
  function hideCard() {
    if (watch) { clearInterval(watch); watch = null; }
    if (!card) return;
    var c = card; card = null;
    c.classList.remove('is-in');
    setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 250);
  }
  var waitN = 0;
  function notice(id) {
    curId = id || curId;
    if (card || root || seen(curId)) return false;
    if (busy()) {   // รอ (ทุก 1.5 วิ ไม่เกิน ~5 นาที) ไม่ทันก็แจ้งในครั้งถัดไปที่เปิดระบบ
      if (waitN++ < 200) setTimeout(function () { notice(curId); }, 1500);
      return false;
    }
    ensureStyle();
    var S = sysOf(curId);
    card = document.createElement('div'); card.className = 'dsp-card dsm-ext'; card.setAttribute('role', 'region'); card.setAttribute('aria-label', 'การแจ้งเรื่องข้อมูลส่วนบุคคล');
    card.innerHTML = '<span class="dsp-badge"><i class="bi bi-shield-check" aria-hidden="true"></i></span>' +
      '<div class="dsp-card-tx"><b>ข้อมูลส่วนบุคคลของคุณ</b>' +
      '<p>' + esc(S === GENERIC ? 'ระบบนี้' : S.name) + ' เก็บและใช้ข้อมูลเท่าที่จำเป็นต่องานของโรงเรียน เห็นได้เฉพาะผู้มีสิทธิ์ และบันทึกการเข้าใช้เพื่อความปลอดภัย</p>' +
      '<div class="dsp-card-act"><button type="button" class="dsp-btn is-main" data-dsp-card="ok">รับทราบ</button>' +
      '<button type="button" class="dsp-btn" data-dsp-card="more">อ่านรายละเอียด</button></div></div>';
    card.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-dsp-card]'); if (!b) return;
      if (b.getAttribute('data-dsp-card') === 'ok') { markSeen(curId); hideCard(); } else open(curId);
    });
    (document.body || document.documentElement).appendChild(card);
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (card) card.classList.add('is-in'); }); });
    watch = setInterval(function () { if (card) card.style.visibility = busy() ? 'hidden' : ''; }, 1500);
    return true;
  }

  // ปุ่มของระบบเองที่ใส่ data-dsds-privacy (ค่า = รหัสระบบ ถ้าไม่ใส่ใช้ระบบปัจจุบัน)
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('[data-dsds-privacy]');
    if (b) { e.preventDefault(); open(b.getAttribute('data-dsds-privacy') || curId); }
  });

  window.DSDSPrivacy = {
    open: open, close: close, notice: notice, seen: seen,
    systems: function () { return SYS; },
    version: VERSION
  };
})();
