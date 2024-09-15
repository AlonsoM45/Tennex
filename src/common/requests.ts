export type TennexServer = {
  'hello': {
    params: [name: string],
    response: string
  },
  'add': {
    params: [a: number, b: number],
    response: number
  }
};

export type TennexChannel = keyof TennexServer;
