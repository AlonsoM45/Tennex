import { ITaskRepo } from "./contracts/ITaskRepo";
import { InMemoryTaskRepo } from "./InMemoryTaskRepo"

export type Services = {
  taskRepo: ITaskRepo
};

const initializeServices = (): Services => {
  const taskRepo = new InMemoryTaskRepo();

  return {
    taskRepo
  };
};

export const services: Services = initializeServices();