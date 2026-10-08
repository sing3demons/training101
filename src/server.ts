import { createApp } from './app'
import { config } from './config'
import { closeDb, connectDb } from './db'

const db = await connectDb()
const app = createApp(db)

const server = app.listen(config.port, () => {
  console.log(`Mini Shop API listening on http://localhost:${config.port}`)
})

async function shutdown() {
  server.close()
  await closeDb()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
