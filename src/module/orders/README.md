# โจทย์คนที่ 3 — Orders

**Mini Project:** Mini Shop API (Node.js + TypeScript + Express + MongoDB)
**ทีม:** 3 คน — เพื่อนคนที่ 1 (Setup + Users) · เพื่อนคนที่ 2 (Products) · คุณ (Orders)
**เวลา:** 1 วันครึ่ง

คุณรับผิดชอบ **ระบบสั่งซื้อ** ซึ่งต้องใช้งานของเพื่อนทั้ง 2 คน

| ต้องใช้ | จากใคร |
|---|---|
| `getUserById(id)` — ไม่เจอได้ 404 | คนที่ 1 |
| `getProductById(id)` — ไม่เจอได้ 404 | คนที่ 2 |
| `decreaseStock(id, qty)` — stock ไม่พอได้ 409 | คนที่ 2 |

> เขียนโค้ดใน `src/module/orders/` (อ่านวิธีรันและข้อตกลงร่วมใน [README](../../../README.md) ก่อนเริ่ม)
>
> **ห้ามนั่งรอ** — ใช้ Dependency Injection (ดู [README หลัก](../../../README.md)):
> 1. ออกแบบ **interface** ของสิ่งที่ orders ต้องใช้จาก users / products แล้วตกลงกับเพื่อนก่อนเริ่มเขียน
> 2. ให้ orders รับ interface นั้นเข้ามาทาง constructor
> 3. ระหว่างรอ เขียน **ตัวปลอม** ที่ทำตาม interface แล้วส่งเข้า `createOrdersRouter(...)` ใน `src/app.ts`
> 4. พอเพื่อน merge แล้ว เปลี่ยนใน `app.ts` เป็นของจริง

---

## Data model — collection `orders`

| field | type | กฎ |
|---|---|---|
| `_id` | ObjectId | |
| `userId` | ObjectId | ต้องเป็น user ที่มีอยู่จริง |
| `product` | object | `{ _id, name, price }` — **ข้อมูลสินค้า ณ ตอนที่สั่ง** |
| `qty` | number | จำนวนเต็ม > 0 |
| `total` | number | `product.price × qty` (หน่วยสตางค์) — **คำนวณฝั่ง server** |
| `status` | string | `"placed"` |
| `createdAt` | Date | |

> ทำไมต้องเก็บ `name` / `price` ซ้ำไว้ใน order ทั้งที่มี `productId` อยู่แล้ว? → ลองคิดว่าถ้าพรุ่งนี้ร้านขึ้นราคา Keyboard จะเกิดอะไรกับ order ของเมื่อวาน

## API

| Method | Path | ผลลัพธ์ |
|---|---|---|
| POST | `/orders` | `201` · `400` input ผิด · `404` ไม่มี user/product นี้ · `409` stock ไม่พอ |
| GET | `/orders/:id` | `200` · `404` ไม่เจอ · `400` id ผิดรูปแบบ |

```http
POST /orders
{ "userId": "665f...", "productId": "6660...", "qty": 2 }

→ 201
{ "data": {
    "_id": "6671...",
    "userId": "665f...",
    "product": { "_id": "6660...", "name": "Keyboard", "price": 159000 },
    "qty": 2,
    "total": 318000,
    "status": "placed",
    "createdAt": "..."
} }
```

> client ส่งมาแค่ `userId`, `productId`, `qty` — ห้ามรับ `price` หรือ `total` จาก client

### ⚠️ ต้องคิดให้ดี
- ลำดับการทำงานใน `POST /orders` ควรเป็นยังไง? (เช็ค user → ดึงสินค้า → ตัด stock → บันทึก order?)
- ถ้า **ตัด stock สำเร็จแล้ว แต่บันทึก order ไม่สำเร็จ** stock ที่ตัดไปจะเป็นยังไง? ต้องแก้ยังไง?
- สั่งเกิน stock ต้องไม่เกิด order และ stock ต้องไม่เปลี่ยน

## เสร็จแล้ว? (Nice to have)
- `PATCH /orders/:id/cancel` — ยกเลิกแล้วคืน stock · **ยกเลิกซ้ำต้องไม่คืน stock ซ้ำ** (ต้องขอ `increaseStock` จากคนที่ 2)
- `GET /users/:id/orders` — ประวัติการสั่งซื้อ เรียงจากใหม่ไปเก่า (คุยกับคนที่ 1 ว่าใครทำ)
- Automated test: สั่งเกิน stock แล้ว stock ต้องไม่เปลี่ยน

---

## กติกาของทีม (เหมือนกันทุกคน)

- merge เข้า `main` ผ่าน **Pull Request ที่เพื่อน review แล้ว** เท่านั้น · คุณต้องมี PR ที่ merge แล้วอย่างน้อย 2 PR
- ทดสอบด้วยไฟล์ในโฟลเดอร์ `http/` ให้ผ่านทุกข้อก่อนเปิด PR (ดูวิธีใน [README หลัก](../../../README.md)) · เพิ่ม endpoint ใหม่ต้องเพิ่ม test case ด้วย
- ติดปัญหา: หาทางเอง → ถามเพื่อน → ถ้าติดเกิน 20 นาทีค่อยเรียกพี่ · ใช้ AI ได้ **แต่ต้องอธิบายโค้ดที่ส่งได้ทุกบรรทัด**

**Demo ส่วนของคุณ (เป็นคนรัน flow รวมของทีม):**
สร้าง user → สร้างสินค้า stock 3 → สั่ง 2 ชิ้นสำเร็จ (stock เหลือ 1) → สั่งอีก 2 ชิ้นโดนปฏิเสธ (stock ยังเหลือ 1)
→ แก้ราคาสินค้าใน DB แล้วเปิด order เดิม ราคาใน order ต้องไม่เปลี่ยน
