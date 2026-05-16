import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

export async function initDB(): Promise<Database> {
    const dbPath = process.env.DB_PATH || './data/history.sqlite';
    const dbDir = path.dirname(dbPath);

    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS exceptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            campaignId TEXT,
            campaignName TEXT,
            platform TEXT,
            errorType TEXT,
            expectedValue TEXT,
            actualValue TEXT,
            severity TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'OPEN'
        )
    `);

    return db;
}
