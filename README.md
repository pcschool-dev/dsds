# dsds — เมนูรวมระบบของโรงเรียนปากช่อง

ไฟล์กลาง `sysmenu.js` ทุกเว็บแอปของโรงเรียนดึงไปใช้ เพื่อแสดงปุ่ม ☰ และแผงรายการระบบทั้งหมด

    <script src="https://pcschool-dev.github.io/dsds/sysmenu.js" data-current="doc" defer></script>

- `data-current` รหัสระบบที่ใช้อยู่ (doc, senddoc, ask, check, homework, regpc, admin, account)
- `data-grad` / `data-accent` สีหัวแผงและสีหลักให้เข้ากับระบบนั้น
- `data-fab` ปุ่มลอยเมื่อหน้าไม่มีปุ่มของตัวเอง: top-right (ค่าเริ่มต้น) | top-left | bottom-right | bottom-left | off
- ปุ่มของระบบเอง: ใส่ `data-sysmenu` ที่ปุ่ม

- `data-admin="1"` หรือ `DSDSMenu.setAdmin(true)` แสดงลิงก์ "จัดการรายการระบบ" ท้ายแผง

**เพิ่ม/แก้ระบบ:** แก้ใน Google Sheet "รายการระบบ DSDS" (https://docs.google.com/spreadsheets/d/1MjY_5Uvw2Mgyb2ejG5sBb-mBnqaCJ79xVwI9s7aN5XA/edit) — ผู้ใช้เห็นภายในไม่กี่นาที
ชีตต้องเปิด "ทุกคนที่มีลิงก์ดูได้" ; สิทธิ์แก้ = คนที่ได้รับแชร์เป็นผู้แก้ไข ; อ่านชีตไม่ได้ -> ใช้รายการสำรอง `SYSTEMS` ใน `sysmenu.js`
**ระวัง:** ไฟล์นี้ทำงานในทุกระบบของโรงเรียน ให้สิทธิ์แก้ repo เฉพาะทีม DSDS
