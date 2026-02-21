import { Client } from 'pg'

export function createClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
}
