import { createDb, migrateDatabase } from "../server/db"
import { getRequiredEnv } from "./lib/env"
import "./lib/env"

async function main() {
  const sql = createDb(getRequiredEnv("DATABASE_URL"))
  await migrateDatabase(sql)
  console.log("database migrated")
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
