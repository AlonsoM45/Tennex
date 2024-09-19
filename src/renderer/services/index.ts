import { BaseTaskRepo } from "./contracts/ITaskRepo";
import { InMemoryTaskRepo } from "./InMemoryTaskRepo"

export type Services = {
  taskRepo: BaseTaskRepo
};

const initializeServices = (): Services => {
  const taskRepo = new InMemoryTaskRepo();

  return {
    taskRepo
  };
};

export const services: Services = initializeServices();