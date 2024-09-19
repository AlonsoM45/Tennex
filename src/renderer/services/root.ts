import { TaskRepo } from "./TaskRepo"

export type Services = {
  taskRepo: TaskRepo
};

const initializeServices = (): Services => {
  const taskRepo = new TaskRepo();

  return {
    taskRepo
  };
};

export const services: Services = initializeServices();