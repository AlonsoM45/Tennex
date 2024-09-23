
import { DbBridge, DbBridgeMessages } from '@common/DbBridge';
import { ipcRenderer } from 'electron';

const dbBridge: DbBridge = {
  execute: (query: string, ...queryParams: unknown[]) => {
    return ipcRenderer.invoke(DbBridgeMessages.execute, query, ...queryParams);
  },
  selectOne: <T = unknown>(query: string, ...queryParams: unknown[]): Promise<T> => {
    return ipcRenderer.invoke(DbBridgeMessages.selectOne, query, ...queryParams);
  },
  selectMany: <T = unknown>(query: string, ...queryParams: unknown[]): Promise<T> => {
    return ipcRenderer.invoke(DbBridgeMessages.selectMany, query, ...queryParams);
  },
};

export default dbBridge;