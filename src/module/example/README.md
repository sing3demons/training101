# ตัวอย่าง: module `example` (notes)

module ตัวอย่างที่ทำงานได้จริง ไว้ดูวิธีแบ่ง layer และทำ **Dependency Injection** — ไม่ใช่โจทย์ ไม่ต้องแก้

| Method | Path | |
|---|---|---|
| POST | `/examples` | `{ "title": "...", "content": "..." }` |
| GET | `/examples` | ดูทั้งหมด |
| GET | `/examples/:id` | ดู 1 รายการ |

ลองยิงได้จาก `example.http` ในโฟลเดอร์นี้

## ไฟล์

| ไฟล์ | หน้าที่ | รับอะไรเข้ามาทาง constructor |
|---|---|---|
| `example.model.ts` | `Note` model ของระบบ — **ไม่ผูกกับ database** (`id: string`, ไม่มี `ObjectId`) | — |
| `example.repository.ts` | `NoteStore` (interface) + `MongoNoteStore` — **เรื่องของ MongoDB อยู่ที่นี่ที่เดียว** (`_id`/`ObjectId` ↔ `id`) | `Db` |
| `example.fake.ts` | `InMemoryNoteStore` ตัวปลอมที่เก็บใน memory | — |
| `example.service.ts` | `NoteService` logic + throw error | `NoteStore` (interface) |
| `example.handler.ts` | `NoteHandler` อ่าน `req` → เรียก service → ตอบ `res` | `NoteService` |
| `example.routes.ts` | **ประกอบทุกอย่าง** แล้วผูก path กับ handler | รับ `db` จาก `app.ts` |

## Dependency ไหลยังไง

```
app.ts          createExampleRouter(db)
                        │
example.routes  new MongoNoteStore(db)
                        ▼
                new NoteService(store)
                        ▼
                new NoteHandler(service)
                        ▼
                router.post('/', handler.create) ...
```

- `new` เกิดที่ `example.routes.ts` ที่เดียว class อื่นไม่ `new` ของที่ตัวเองต้องใช้
- `NoteService` รู้จักแค่ interface `NoteStore` ไม่รู้ว่าข้างหลังเป็น MongoDB
- `Note` ใช้ `id: string` — `MongoNoteStore` เป็นคนแปลง `_id: ObjectId` ↔ `id` ให้ ถ้าวันหนึ่งเปลี่ยน database แก้แค่ repository

## ลองสลับเป็นตัวปลอม

แก้ `example.routes.ts` บรรทัดเดียว:

```ts
const store = new InMemoryNoteStore()   // แทน new MongoNoteStore(db)
```

API ยังทำงานเหมือนเดิมทุกอย่าง (แค่ข้อมูลหายเมื่อ restart) — `NoteService` กับ `NoteHandler` ไม่ต้องแก้เลย
นี่คือเหตุผลที่ทำ DI: **เปลี่ยนของที่ส่งเข้าไปได้ โดยไม่ต้องแก้คนที่ใช้มัน**

คนที่ 3 (orders) ใช้วิธีเดียวกันได้: ประกาศ interface ของสิ่งที่ต้องใช้จาก users / products แล้วส่งตัวปลอมเข้าไปก่อนระหว่างรอเพื่อน

