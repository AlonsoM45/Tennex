import { DbBridgeMessages } from "@common/DbBridge";
import { app, ipcMain } from "electron";
import * as path from "node:path";
import Database from "better-sqlite3";
const dbPath = path.join(app.getPath('userData'), "tennex.sqlite");
const db = new Database(dbPath);
const createTaskTableSql = `
  CREATE TABLE IF NOT EXISTS task (
    id INTEGER PRIMARY KEY,
    parent_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    is_expanded INTEGER NOT NULL CHECK (is_expanded IN (0, 1)),
    is_removed INTEGER NOT NULL CHECK (is_removed IN (0, 1)),
    is_completed INTEGER NOT NULL CHECK (is_completed IN (0, 1)),
    is_blocked INTEGER NOT NULL CHECK (is_blocked IN (0, 1)),
    FOREIGN KEY (parent_id) REFERENCES TASK(id)
  );
`;

const insertRootTaskSql = `
  INSERT INTO task (
    parent_id, name, description, is_expanded, is_removed, is_completed, is_blocked
  ) 
  VALUES (
    NULL, 'My First Task', '', 0, 0, 0, 0
  );
`;

const initializeDb = async () => {
  db.prepare(createTaskTableSql).run(); // TODO: Check result
  const data = db.prepare("SELECT COUNT(*) AS count FROM task").get() as  { count: number};
  if (data.count === 0) {
    db.prepare(insertRootTaskSql).run(); // TODO: Check result
  }
};

export const registerDbBridgeIpc = () => {
  initializeDb().then(() => {
    ipcMain.handle(DbBridgeMessages.execute, (_, query: string, ...queryParams: unknown[]): Promise<Database.RunResult> => {
      return Promise.resolve(db.prepare(query).run(...queryParams));
    });
  
    ipcMain.handle(DbBridgeMessages.selectOne, (_, query: string, ...queryParams: unknown[]): Promise<unknown> => {
      return Promise.resolve(db.prepare(query).get(...queryParams));
    });
  
    ipcMain.handle(DbBridgeMessages.selectMany, (_, query: string, ...queryParams: unknown[]): Promise<unknown[]> => {
      return Promise.resolve(db.prepare(query).all(...queryParams));
    });
  });
};
