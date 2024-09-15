import { ipcMain } from "electron";
import { IpcMainEvent } from "electron/main";
import { TennexChannel, TennexServer } from "src/common/requests";

type Handler<C extends TennexChannel> = (_event: IpcMainEvent, ...params: TennexServer[C]['params']) => Promise<TennexServer[C]['response']>
type Handlers =  {
  [channel in TennexChannel]: Handler<channel>
};

const handlers: Handlers = {
  'add': (_event: IpcMainEvent, a: number, b: number): Promise<number> => Promise.resolve(a + b),
  'hello': (_event: IpcMainEvent, name: string): Promise<string> => Promise.resolve(`Hello, ${name}!`)
};
const registeredChannels: TennexChannel[] = ['add', 'hello'];

export const startServer = () => {
  for (const channel of registeredChannels){
    ipcMain.handle(channel, handlers[channel]);
  }
};