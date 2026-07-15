import {drizzle} from 'drizzle-orm/node-postgres'
import {schema} from './schema/index.ts'

export const db = drizzle(process.env.DATABASE_URL!, {
    casing: 'snake_case',
    schema
})