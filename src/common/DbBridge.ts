import Database from "better-sqlite3";

export type DbBridge = {
  execute: (query: string, ...queryParams: unknown[]) => Promise<Database.RunResult>,
  selectOne: <T = unknown>(query: string, ...queryParams: unknown[]) => Promise<T>,
  selectMany: <T = unknown>(query: string, ...queryParams: unknown[]) => Promise<T[]>,
};

export const DbBridgeName = "DbBridge";

export enum DbBridgeMessages {
  execute = 'db_bridge_execute',
  selectOne = 'db_bridge_select_one',
  selectMany = 'db_bridge_select_many',
}