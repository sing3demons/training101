# โจทย์คนที่ 1 — Users

**Mini Project:** Mini Shop API (Node.js + TypeScript + Express + MongoDB)
**ทีม:** 3 คน — คุณ (Users) · เพื่อนคนที่ 2 (Products) · เพื่อนคนที่ 3 (Orders)
**เวลา:** 1 วันครึ่ง

คุณรับผิดชอบ **ระบบลูกค้า (users)** — เขียนโค้ดใน `src/module/users/` (อ่านวิธีรันและข้อตกลงร่วมใน [README](../../../README.md) ก่อนเริ่ม)

---

## Data model — collection `users`

| field | type | กฎ |
|---|---|---|
| `_id` | ObjectId | |
| `name` | string | ห้ามว่าง, ยาวไม่เกิน 100 ตัวอักษร |
| `email` | string | รูปแบบ email ถูกต้อง, **ห้ามซ้ำ** (`A@x.com` กับ `a@x.com` ถือว่าซ้ำกัน) |
| `createdAt` | Date | |

## API

| Method | Path | ผลลัพธ์ |
|---|---|---|
| POST | `/users` | `201` สร้างสำเร็จ · `400` input ผิด · `409` email ซ้ำ |
| GET | `/users/:id` | `200` · `404` ไม่เจอ · `400` id ผิดรูปแบบ |

```http
POST /users
{ "name": "Somchai", "email": "Somchai@Mail.com" }

→ 201
{ "data": { "_id": "665f...", "name": "Somchai", "email": "somchai@mail.com", "createdAt": "..." } }
```

### ⚠️ ต้องคิดให้ดี
- ถ้ามี 2 request สมัครด้วย email เดียวกัน **ในเวลาเดียวกัน** ต้องมีแค่ 1 request ที่สำเร็จ
- id ที่ไม่ใช่ ObjectId เช่น `GET /users/abc` ต้องได้ `400` ไม่ใช่ `500`

## สิ่งที่ต้องส่งให้เพื่อน

**คนที่ 3 (Orders)** ต้องเช็คว่า user มีอยู่จริงก่อนสร้าง order ให้เตรียม method ที่ส่งเข้าไปให้ orders ใช้ได้ (ส่งผ่าน `src/app.ts`)
```ts
getUserById(id: string)   // ไม่เจอ → throw NotFoundError
```
ตกลงชื่อ method และสิ่งที่ return กับคนที่ 3 ให้ชัดก่อนเริ่มเขียน
merge แล้วบอกเพื่อนคนที่ 3

## เสร็จแล้ว? (Nice to have)
- `GET /users` แบบมี pagination (`?page=1&limit=20`)
- `GET /users/:id/orders` ดูประวัติการสั่งซื้อ (คุยกับคนที่ 3 ก่อน)
- Automated test ของ `POST /users`

---

## กติกาของทีม (เหมือนกันทุกคน)

- merge เข้า `main` ผ่าน **Pull Request ที่เพื่อน review แล้ว** เท่านั้น · คุณต้องมี PR ที่ merge แล้วอย่างน้อย 2 PR
- ทดสอบด้วยไฟล์ในโฟลเดอร์ `http/` ให้ผ่านทุกข้อก่อนเปิด PR (ดูวิธีใน [README หลัก](../../../README.md)) · เพิ่ม endpoint ใหม่ต้องเพิ่ม test case ด้วย
- ติดปัญหา: หาทางเอง → ถามเพื่อน → ถ้าติดเกิน 20 นาทีค่อยเรียกพี่ · ใช้ AI ได้ **แต่ต้องอธิบายโค้ดที่ส่งได้ทุกบรรทัด**

**Demo ส่วนของคุณ:** สมัครสำเร็จ → สมัครด้วย email เดิม (เปลี่ยนตัวพิมพ์เล็ก/ใหญ่) แล้วโดนปฏิเสธ → อธิบายว่าระบบกันการสมัครพร้อมกันได้ยังไง
