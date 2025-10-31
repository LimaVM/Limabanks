import fs from "fs"
import path from "path"

export const DATA_DIR = "/home/ubuntu/BANCO_DATA"

export function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

export function readJSON(filename, defaultValue) {
  ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)

  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8")
      return JSON.parse(data)
    }
  } catch (error) {
    console.error(`Error reading ${filename}:`, error)
  }

  return defaultValue
}

export function writeJSON(filename, data) {
  ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")
  } catch (error) {
    console.error(`Error writing ${filename}:`, error)
    throw error
  }
}
