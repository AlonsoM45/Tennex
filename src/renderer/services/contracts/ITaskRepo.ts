import { Task } from "@common/Task";

export type TaskUpdater = (task: Task) => Task;

export type MinimalTask = Exclude<Partial<Task>, {id: number}> & {name: string};

export interface ITaskRepo {
  getPage(first: number, pageSize: number): Promise<Task[] | null>;
  getTask(id: number): Promise<Task | null>;
  updateTask(id: number, updater: TaskUpdater): Promise<Task | null>;
  newTask(task: MinimalTask): Promise<Task | null>;
};

export abstract class BaseTaskRepo implements ITaskRepo {
  abstract newTask(task: MinimalTask): Promise<Task>;
  abstract getPage(first: number, pageSize: number): Promise<Task[] | null>;
  abstract getTask(id: number): Promise<Task | null>;
  abstract updateTask(id: number, updater: TaskUpdater): Promise<Task | null>;

  deleteTask(id: number): Promise<Task | null> {
    return this.updateTask(id, task => ({
      ...task,
      isRemoved: true
    }));
  }

  completeTask(id: number): Promise<Task | null> {
    return this.updateTask(id, task => ({
      ...task,
      isCompleted: true
    }));
  }
  
  blockTask(id: number): Promise<Task | null> {
    return this.updateTask(id, task => ({
      ...task,
      isBlocked: true
    }));
  }
  
  unblockTask(id: number): Promise<Task | null> {
    return this.updateTask(id, task => ({
      ...task,
      isBlocked: false
    }));
  }
}