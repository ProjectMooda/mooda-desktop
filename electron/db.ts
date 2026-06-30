import { app } from 'electron'
import path from 'path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const Database = require('better-sqlite3')

let db: Database.Database

// 초기 디비 초기화
export function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'mooda_local.db')

  // WAL(Write-Ahead Logging) 모드를 활성화하여 읽기/쓰기 성능을 극대화합니다.
  db = new Database(dbPath, { verbose: console.log })
  db.pragma('journal_mode = WAL')
  db.pragma('synchronous = NORMAL')

  // Key-Value Document 스토어 구조의 테이블 생성
  db.exec(`
    CREATE TABLE IF NOT EXISTS application_store (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at INTEGER
    )
  `)
}

// 디비 내용 가져오기
export function getValue(key: string): any {
  try {
    const stmt = db.prepare('SELECT value FROM application_store WHERE key = ?')
    const row = stmt.get(key) as { value: string } | undefined
    return row ? JSON.parse(row.value) : null
  } catch (error) {
    console.error(`[SQLite Get Error] key: ${key}`, error)
    return null
  }
}

// 디비 내용 설정하기
export function setValue(key: string, value: any): boolean {
  try {
    const stmt = db.prepare(`
      INSERT INTO application_store (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `)
    stmt.run(key, JSON.stringify(value), Date.now())
    return true
  } catch (error) {
    console.error(`[SQLite Set Error] key: ${key}`, error)
    return false
  }
}

// 디비 내용 지우기
export function clearDatabase() {
  try {
    db.exec('DELETE FROM application_store') // 테이블은 남기고 데이터만 싹 삭제
    return true
  } catch (error) {
    console.error('DB Clear Error:', error)
    return false
  }
}
