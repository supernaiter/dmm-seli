import fs from "node:fs"
import path from "node:path"

import dotenv from "dotenv"

const cwd = process.cwd()
const candidateFiles = [".env.local", ".env", path.resolve(cwd, "../DMMセール攻略ドットコム/.env")]

for (const filePath of candidateFiles) {
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath, override: false })
  }
}

export function getEnv(name: string, aliases: string[] = []) {
  const rawValue = [name, ...aliases].map((key) => process.env[key]).find(Boolean)
  if (!rawValue) {
    return null
  }

  const trimmed = rawValue.trim()
  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim()
  }

  return trimmed
}
