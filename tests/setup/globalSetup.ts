import { sql } from 'drizzle-orm'
import { execSync } from 'node:child_process'
import { db } from '../../src/db/connection.ts'
import { entries, habits, habitTags, tags, users } from '../../src/db/schema.ts'

export default async function setup() {
  console.log('Setting up test DB')
  try {
    await db.execute(sql`DROP TABLE IF EXISTS ${entries} CASCADE`)
    await db.execute(sql`DROP TABLE IF EXISTS ${habitTags} CASCADE`)
    await db.execute(sql`DROP TABLE IF EXISTS ${habits} CASCADE`)
    await db.execute(sql`DROP TABLE IF EXISTS ${tags} CASCADE`)
    await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE`)

    console.log('Pushing schema using drizzle-kit')

    execSync(
      `npx drizzle-kit push --url="${process.env.DATABASE_URL}" --schema="./src/db/schema.ts" --dialect="postgresql"`,
      { stdio: 'inherit', cwd: process.cwd() }
    )
 
    console.log('Test DB Created')
  } catch (error) {
    console.error('Error setting up test DB', error)
    throw error
  }

  return async () => {
    console.log('Tearing down test DB')
    try {
      await db.execute(sql`DROP TABLE IF EXISTS ${entries} CASCADE`)
      await db.execute(sql`DROP TABLE IF EXISTS ${habitTags} CASCADE`)
      await db.execute(sql`DROP TABLE IF EXISTS ${habits} CASCADE`)
      await db.execute(sql`DROP TABLE IF EXISTS ${tags} CASCADE`)
      await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE`)
      console.log('Test DB Tore down')
      process.exit(0)
    } catch (error) {
      console.error('Error tearing down test DB', error)
      process.exit(1)
    }
  }
}
