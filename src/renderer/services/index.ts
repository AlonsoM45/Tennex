import { ITaskRepo } from "./contracts/ITaskRepo";
import { DbTaskRepo } from "./DbTaskRepo";
import { InMemoryTaskRepo } from "./InMemoryTaskRepo"

export type Services = {
  taskRepo: ITaskRepo
};

const initializeServices = (): Services => {
  const taskRepo = new DbTaskRepo();

  return {
    taskRepo
  };
};

export const services: Services = initializeServices();