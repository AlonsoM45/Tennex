import { Task } from "@common/Task";

export type TaskUpdater = (task: Task) => Task;

export type MinimalTask = Exclude<Partial<Task>, {id: number}> & {name: string};

export interface ITaskRepo {
  getPage(first: number, pageSize: number): Promise<Task[] | null>;
  getTask(id: number): Promise<Task | null>;
  updateTask(id: number, updater: TaskUpdater): Promise<Task | null>;
  newTask(parentId: number, task: MinimalTask): Promise<Task | null>;
  isTaskExpandable(id: number): Promise<boolean>;
};

export abstract class BaseTaskRepo implements ITaskRepo {
  abstract isTaskExpandable(id: number): Promise<boolean>;
  abstract newTask(parentId: number, task: MinimalTask): Promise<Task>;
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

  continueTask(id: number): Promise<Task | null> {
    return this.updateTask(id, task => ({
      ...task,
      isCompleted: false
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
  
  collapseTask(id: number): Promise<Task | null> {
    return this.updateTask(id, task => ({
      ...task,
      isExpanded: false
    }));
  }
    
  expandTask(id: number): Promise<Task | null> {
    return this.updateTask(id, task => ({
      ...task,
      isExpanded: true
    }));
  }
}