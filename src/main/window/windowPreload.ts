import { contextBridge } from 'electron';
import titlebarContext from './titlebarContext';
import dbBridge from './dbContext';
import { DbBridgeName } from '@common/DbBridge';

contextBridge.exposeInMainWorld('electron_window', {
  titlebar: titlebarContext,
  [DbBridgeName]: dbBridge
});
