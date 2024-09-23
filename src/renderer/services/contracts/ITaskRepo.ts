import { Task } from "@common/Task";

export type TaskUpdater = (task: Task) => Task;

export type MinimalTask = Exclude<Partial<Task>, {id: number}> & {name: string};

export interface ITaskRepo {
  getTask(id: number): Promise<Task | null>;
  updateTask(id: number, updater: TaskUpdater): Promise<Task | null>;
  newTask(parentId: number, task: MinimalTask): Promise<Task | null>;
  isTaskExpandable(id: number): Promise<boolean>;
  getSelectedTaskId(): Promise<number>;
  updateSelectedTaskId(id: number): Promise<void>;
  changeParent(id: number, newParentId: number): Promise<Task | null>;
  completeTask(id: number): Promise<Task | null>;
  continueTask(id: number): Promise<Task | null>;
  blockTask(id: number): Promise<Task | null>;
  unblockTask(id: number): Promise<Task | null>;
  expandTask(id: number): Promise<Task | null>;
  collapseTask(id: number): Promise<Task | null>;
  deleteTask(id: number): Promise<Task | null>;
};

export abstract class BaseTaskRepo implements ITaskRepo {
  abstract isTaskExpandable(id: number): Promise<boolean>;
  abstract addChild(parentId: number, childId: number): Promise<void>;
  abstract newTask(parentId: number, task: MinimalTask): Promise<Task | null>;
  abstract getTask(id: number): Promise<Task | null>;
  abstract updateTask(id: number, updater: TaskUpdater): Promise<Task | null>;
  abstract getSelectedTaskId(): Promise<number>;
  abstract updateSelectedTaskId(id: number): Promise<void>;

  async changeParent(id: number, newParentId: number): Promise<Task | null> {
    const task = await this.getTask(id);
    if (!task || task.parentId === null) {
      return null;
    }
    const oldParent = await this.getTask(task.parentId)
    if (!oldParent) {
      return task;
    }

    // Remove task from old parent's children
    await this.updateTask(oldParent.id, (oldParentTask) => ({
      ...oldParentTask,
      children: oldParentTask.children.filter(child => child !== id)
    }));

    // Add task to new parent's children
    await this.addChild(newParentId, id);

    // Update parent ID
    return await this.updateTask(id, (oldTask => ({
      ...oldTask,
      parentId: newParentId
    })));
  }

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