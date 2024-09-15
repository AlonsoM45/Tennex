import { ipcRenderer } from "electron";
import { TennexChannel, TennexServer } from "src/common/requests";

export const startRequest = <C extends TennexChannel>(
  channel: C,
  ...params: TennexServer[C]['params']
): Promise<TennexServer[C]['response']> => {
  return ipcRenderer.invoke(channel, params);
};

export namespace TennexClient {
  export const add = (a: number, b: number): Promise<number> => {
    return startRequest('add', a, b)
  }
  
  export const hello = (name: string): Promise<string> => {
    return startRequest('hello', name)
  }
}