import { DbBridgeMessages } from "@common/DbBridge";
import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "node:path";
import Database from "better-sqlite3";
const dbPath = path.join(app.getPath('userData'), "tennex.sqlite");
const db = new Database(dbPath);

export const registerDbBridgeIpc = () => {
  ipcMain.handle(DbBridgeMessages.execute, (_, query: string, ...queryParams: unknown[]): Promise<Database.RunResult> => {
    return Promise.resolve(db.prepare(query).run(...queryParams));
  });

  ipcMain.handle(DbBridgeMessages.selectOne, (_, query: string, ...queryParams: unknown[]): Promise<unknown> => {
    return Promise.resolve(db.prepare(query).get(...queryParams));
  });

  ipcMain.handle(DbBridgeMessages.selectMany, (_, query: string, ...queryParams: unknown[]): Promise<unknown[]> => {
    return Promise.resolve(db.prepare(query).all(...queryParams));
  });
};
