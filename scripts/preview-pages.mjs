import fs from "node:fs"
import { spawn } from "node:child_process"
import path from "node:path"
import process from "node:process"

import dotenv from "dotenv"

const cwd = process.cwd()
const envFiles = [".env.local", ".env"]

for (const file of envFiles) {
  const filePath = path.join(cwd, file)
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath, override: false })
  }
}

const databaseUrl = process.env.DATABASE_URL?.trim()

if (!databaseUrl) {
  console.error("DATABASE_URL is missing")
  process.exit(1)
}

const devVarsPath = path.join(cwd, ".dev.vars")
fs.writeFileSync(devVarsPath, `DATABASE_URL=${databaseUrl}\n`, "utf8")

const cleanup = () => {
  if (fs.existsSync(devVarsPath)) {
    fs.unlinkSync(devVarsPath)
  }
}

process.on("exit", cleanup)
process.on("SIGINT", () => {
  cleanup()
  process.exit(130)
})
process.on("SIGTERM", () => {
  cleanup()
  process.exit(143)
})

const child = spawn(
  "npx",
  [
    "wrangler",
    "pages",
    "dev",
    "dist",
    "--compatibility-date=2026-04-17",
    "--ip",
    "127.0.0.1",
    "--port",
    "4310",
  ],
  {
    stdio: "inherit",
    cwd,
    env: process.env,
  },
)

child.on("exit", (code, signal) => {
  cleanup()
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 0)
})
