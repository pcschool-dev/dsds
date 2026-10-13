# dsds — เมนูรวมระบบของโรงเรียนปากช่อง

ไฟล์กลาง `sysmenu.js` ทุกเว็บแอปของโรงเรียนดึงไปใช้ เพื่อแสดงปุ่ม ☰ และแผงรายการระบบทั้งหมด

    <script src="https://pcschool-dev.github.io/dsds/sysmenu.js" data-current="doc" defer></script>

- `data-current` รหัสระบบที่ใช้อยู่ (doc, senddoc, ask, check, homework, regpc, admin, account)
- `data-grad` / `data-accent` สีหัวแผงและสีหลักให้เข้ากับระบบนั้น
- `data-fab` ปุ่มลอยเมื่อหน้าไม่มีปุ่มของตัวเอง: top-right (ค่าเริ่มต้น) | top-left | bottom-right | bottom-left | off
- ปุ่มของระบบเอง: ใส่ `data-sysmenu` ที่ปุ่ม

**เพิ่ม/แก้ระบบ:** แก้ `SYSTEMS` ใน `sysmenu.js` แล้ว push — ทุกระบบเห็นภายใน ~10 นาที ไม่ต้อง deploy Apps Script
**ระวัง:** ไฟล์นี้ทำงานในทุกระบบของโรงเรียน ให้สิทธิ์แก้ repo เฉพาะทีม DSDS
