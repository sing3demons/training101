export {}

// ทดสอบกฎข้อ 4: มีสินค้าเหลือ 1 ชิ้น แล้วยิง order พร้อมกันหลาย request
// ผลที่ถูกต้อง: สำเร็จ (201) แค่ 1 request, ที่เหลือได้ 409 และ stock สุดท้ายเป็น 0
//
// วิธีรัน (ต้องเปิด server ไว้ก่อน): npm run test:race
// เปลี่ยนจำนวน request: npm run test:race -- 50

const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000'
const concurrency = Number(process.argv[2] ?? 20)

async function post(path: string, body: unknown) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return { status: res.status, body: await res.json().catch(() => null) }
}

function fail(message: string): never {
  console.error(`❌ ${message}`)
  process.exit(1)
}

async function createOrFail(path: string, body: unknown): Promise<string> {
  const res = await post(path, body).catch(() => fail(`ต่อ ${baseUrl} ไม่ได้ — เปิด server (npm run dev) ไว้หรือยัง?`))
  if (res.status !== 201) {
    fail(`POST ${path} → ${res.status} ${JSON.stringify(res.body)} (ยังทำ endpoint นี้ไม่เสร็จ?)`)
  }
  return res.body.data.id
}

const userId = await createOrFail('/users', { name: 'Race Tester', email: `race.${Date.now()}@mail.com` })
const productId = await createOrFail('/products', { name: 'Last Item', price: 100, stock: 1, category: 'race' })

console.log(`ยิง POST /orders พร้อมกัน ${concurrency} requests เพื่อแย่งสินค้าชิ้นสุดท้าย...\n`)

const results = await Promise.all(
  Array.from({ length: concurrency }, () => post('/orders', { userId, productId, qty: 1 })),
)

const count = new Map<number, number>()
for (const r of results) count.set(r.status, (count.get(r.status) ?? 0) + 1)
for (const [status, n] of [...count].sort()) console.log(`  HTTP ${status}: ${n} requests`)

const product = await (await fetch(`${baseUrl}/products/${productId}`)).json()
const stock = product?.data?.stock
console.log(`  stock สุดท้าย: ${stock}\n`)

const passed = count.get(201) === 1 && count.get(409) === concurrency - 1 && stock === 0
console.log(passed ? '✅ ผ่าน — ขายได้แค่ 1 ชิ้น' : '❌ ไม่ผ่าน — ต้องสำเร็จ 1 request, ที่เหลือ 409 และ stock = 0')
process.exit(passed ? 0 : 1)
