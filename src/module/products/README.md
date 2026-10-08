# โจทย์คนที่ 2 — Products

**Mini Project:** Mini Shop API (Node.js + TypeScript + Express + MongoDB)
**ทีม:** 3 คน — เพื่อนคนที่ 1 (Setup + Users) · คุณ (Products) · เพื่อนคนที่ 3 (Orders)
**เวลา:** 1 วันครึ่ง

คุณรับผิดชอบ **ระบบสินค้าและ stock**

> เขียนโค้ดใน `src/module/products/` (อ่านวิธีรันและข้อตกลงร่วมใน [README](../../../README.md) ก่อนเริ่ม)
> แนะนำให้ลองเขียน query ใน mongosh ให้ได้ผลก่อน แล้วค่อยย้ายมาเป็นโค้ด

---

## Data model — collection `products`

| field | type | กฎ |
|---|---|---|
| `_id` | ObjectId | |
| `name` | string | ห้ามว่าง, ยาวไม่เกิน 200 ตัวอักษร |
| `price` | number | **จำนวนเต็ม หน่วยสตางค์** (199.50 บาท = `19950`), ≥ 0 |
| `stock` | number | จำนวนเต็ม, ≥ 0 — **ห้ามติดลบไม่ว่ากรณีใด** |
| `category` | string | ห้ามว่าง (`Gadget` กับ `gadget` ถือเป็นหมวดเดียวกัน) |
| `createdAt` | Date | |

## API

| Method | Path | ผลลัพธ์ |
|---|---|---|
| POST | `/products` | `201` · `400` input ผิด |
| GET | `/products` | `200` รายการสินค้า · กรองด้วย `?category=` ได้ |
| GET | `/products/:id` | `200` · `404` ไม่เจอ · `400` id ผิดรูปแบบ |

```http
POST /products
{ "name": "Keyboard", "price": 159000, "stock": 5, "category": "gadget" }

→ 201
{ "data": { "_id": "665f...", "name": "Keyboard", "price": 159000, "stock": 5, "category": "gadget", "createdAt": "..." } }
```

```http
GET /products?category=gadget

→ 200
{ "data": [ { "_id": "...", "name": "Keyboard", ... } ] }
```

### ⚠️ ต้องคิดให้ดี
- ลองยิง `GET /products?category[$ne]=x` ดู ผลลัพธ์ต้องไม่ใช่สินค้าทั้งหมดในร้าน
- ถ้า collection มีสินค้า 1 ล้านชิ้น การกรองตาม category จะช้าไหม? ทำยังไงให้เร็วขึ้น?

## สิ่งที่ต้องส่งให้เพื่อน

**คนที่ 3 (Orders)** ต้องใช้ตอนสร้าง order ให้เตรียม method ที่ส่งเข้าไปให้ orders ใช้ได้ (ส่งผ่าน `src/app.ts`)
ตกลงชื่อ method และสิ่งที่ return กับคนที่ 3 ให้ชัดก่อนเริ่มเขียน

```ts
getProductById(id: string)
// ไม่เจอ → throw NotFoundError

decreaseStock(id: string, qty: number): Promise<void>
// stock ไม่พอ → throw ConflictError
```

### ⚠️ `decreaseStock` คือหัวใจของโปรเจกต์
**ถ้าสินค้าเหลือ 1 ชิ้น แล้วมี 2 request ตัด stock พร้อมกัน ต้องสำเร็จแค่ 1 request** และ stock ต้องเหลือ `0` ไม่ใช่ `-1`

ลองคิดว่าการเขียนแบบ "อ่าน stock → เช็คด้วย if → update" มีปัญหาตรงไหน และ MongoDB มีวิธีทำให้การเช็คกับการตัดเกิดขึ้นในครั้งเดียวได้ยังไง

merge แล้วบอกเพื่อนคนที่ 3 ทันที

## เสร็จแล้ว? (Nice to have)
- Pagination ของ `GET /products` (`?page=1&limit=20`) พร้อมจำนวนทั้งหมด
- กรองช่วงราคา `?minPrice=&maxPrice=`
- `increaseStock(id, qty)` ให้คนที่ 3 ใช้ตอนยกเลิก order
- Automated test ที่พิสูจน์ว่าตัด stock พร้อมกันแล้วไม่ติดลบ

---

## กติกาของทีม (เหมือนกันทุกคน)

- merge เข้า `main` ผ่าน **Pull Request ที่เพื่อน review แล้ว** เท่านั้น · คุณต้องมี PR ที่ merge แล้วอย่างน้อย 2 PR
- ทดสอบด้วยไฟล์ในโฟลเดอร์ `http/` ให้ผ่านทุกข้อก่อนเปิด PR (ดูวิธีใน [README หลัก](../../../README.md)) · เพิ่ม endpoint ใหม่ต้องเพิ่ม test case ด้วย
- ติดปัญหา: หาทางเอง → ถามเพื่อน → ถ้าติดเกิน 20 นาทีค่อยเรียกพี่ · ใช้ AI ได้ **แต่ต้องอธิบายโค้ดที่ส่งได้ทุกบรรทัด**

**Demo ส่วนของคุณ:** เพิ่มสินค้า → กรองตาม category → อธิบายว่า `decreaseStock` กันการตัด stock พร้อมกันได้ยังไง
