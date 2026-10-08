# Mini Shop API

Mini project สำหรับน้องฝึกงาน: Node.js + TypeScript + Express 5 + MongoDB

โจทย์ของแต่ละคนอยู่ใน `README.md` ของ module ตัวเอง

| คนที่ | งาน | โจทย์ |
|---|---|---|
| 1 | Users | [src/module/users/README.md](src/module/users/README.md) |
| 2 | Products | [src/module/products/README.md](src/module/products/README.md) |
| 3 | Orders | [src/module/orders/README.md](src/module/orders/README.md) |

## วิธีรัน

ต้องมี Node.js 22 ขึ้นไป และ Docker

```bash
cp .env.example .env
docker compose up -d      # MongoDB ที่ localhost:27017 (ถ้ามี MongoDB อยู่แล้ว ข้ามขั้นนี้ได้)
npm install
npm run dev               # http://localhost:3000 (แก้ไฟล์แล้ว restart ให้เอง)
```

ทดสอบว่ารันได้: `curl http://localhost:3000/health` ต้องได้ `{"status":"ok"}`

| คำสั่ง | ทำอะไร |
|---|---|
| `npm run dev` | รัน server แบบ watch |
| `npm start` | รัน server |
| `npm run typecheck` | เช็ค type ทั้งโปรเจกต์ (ควรผ่านก่อนเปิด PR) |
| `npm run test:race` | ยิง order พร้อมกันแย่งสินค้าชิ้นสุดท้าย (ต้องเปิด server ไว้ก่อน) |

## โครงสร้าง

```
src/
  server.ts               # จุดเริ่มต้น: connect MongoDB → สร้าง app → listen
  app.ts                  # createApp(db): สร้าง express app + mount route ของทุก module (ส่ง db ให้ router)
  config.ts               # อ่านค่าจาก .env
  db.ts                   # connectDb() คืน Db
  shared/
    errors.ts             # BadRequestError (400), NotFoundError (404), ConflictError (409)
    error-handler.ts      # แปลง error ที่ throw เป็น HTTP response
  module/
    users/                # คนที่ 1 — โจทย์อยู่ใน README.md ของโฟลเดอร์
    products/             # คนที่ 2
    orders/               # คนที่ 3
    example/              # ตัวอย่าง module ที่ทำงานได้จริง (notes) — ดูวิธีแบ่ง layer และทำ DI
http/                     # ไฟล์ทดสอบ API (ดูหัวข้อ "ทดสอบ API")
scripts/race-test.ts      # ทดสอบสั่งซื้อพร้อมกัน
```

แต่ละคนออกแบบไฟล์ในโฟลเดอร์ `src/module/<module>/` ของตัวเองได้ตามต้องการ (เช่น แยก service / repository) แต่ต้องทำตามหลัก Dependency Injection ข้างล่าง

👉 **ดูตัวอย่างก่อนเริ่ม:** [`src/module/example/`](src/module/example/README.md)

## Dependency Injection

**กติกา**
1. class / function ต้อง **รับสิ่งที่ต้องใช้เข้ามาทาง constructor (หรือ parameter)** — ห้าม `new` dependency เอง และห้าม import instance ที่สร้างไว้แล้วมาใช้ตรง ๆ
2. แต่ละ module ประกอบ dependency ของตัวเองใน **`create<Module>Router(db)`** (เช่น สร้าง repository จาก `db` แล้วส่งเข้า service)
3. module ไหนต้องใช้ของจาก module อื่น ให้รับเพิ่มเป็น parameter ของ `create<Module>Router(...)` แล้วส่งมาจาก **`app.ts`**
4. ของที่รับจาก module อื่นให้ **ขึ้นกับ interface** ไม่ใช่ class ของเพื่อนโดยตรง

```
server.ts:  db = connectDb()  →  app = createApp(db)
app.ts:     app.use('/users', createUsersRouter(db)) ...
```

**ทำไม**
- ระหว่างที่งานของเพื่อนยังไม่เสร็จ ส่ง **ตัวปลอม** ที่ทำตาม interface เข้าไปก่อนได้ พอของจริงเสร็จก็แก้แค่ `app.ts`
- ตอนเขียน test ส่งตัวปลอมเข้าไปแทน DB / service จริงได้

## ทดสอบ API

ติดตั้ง VS Code extension **REST Client** แล้วเปิดไฟล์ในโฟลเดอร์ `http/` กด **Send Request** ทีละอันจากบนลงล่าง
แต่ละ request มีบรรทัด `# expect:` บอกผลที่ต้องได้ ถ้าไม่ตรงแปลว่ายังไม่ผ่าน

| ไฟล์ | ใช้ทดสอบ |
|---|---|
| `http/users.http` | คนที่ 1 |
| `http/products.http` | คนที่ 2 |
| `http/orders.http` | คนที่ 3 (สร้าง user / product เองตอนต้นไฟล์) |
| `http/demo.http` | flow รวมของทีมตอน demo |
| `http/example.http` | module ตัวอย่าง |

ถ้าเพิ่ม endpoint หรือ test case ใหม่ ให้เพิ่มลงในไฟล์ของตัวเองด้วย

## ข้อตกลงร่วม

**Response สำเร็จ**
```json
{ "data": { "_id": "...", "name": "..." } }
```

**Response error** ไม่ต้องเขียนเอง แค่ `throw` error จาก `src/shared/errors.ts` แล้ว error handler จะตอบให้
```ts
throw new NotFoundError('user not found')
// → 404 { "error": { "message": "user not found" } }
```
error อื่นที่ไม่ได้มาจาก `src/shared/errors.ts` จะกลายเป็น `500` ทั้งหมด

Express 5 จับ error จาก `async` handler ให้เองแล้ว จึงไม่ต้องเขียน `try/catch` เพื่อส่งต่อให้ `next(err)`

**Git**
- ห้าม push เข้า `main` ตรง ๆ — ทำ branch แล้วเปิด Pull Request ให้เพื่อน review
- ชื่อ branch: `feat/<module>-<เรื่อง>` เช่น `feat/users-create`
