function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env: ${name} (copy .env.example to .env)`)
  return value
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  mongoUri: required('MONGO_URI'),
  mongoDb: required('MONGO_DB'),
}
