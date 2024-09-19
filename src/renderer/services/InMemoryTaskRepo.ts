import { Task } from "@common/Task";
import { BaseTaskRepo, MinimalTask, TaskUpdater } from "./contracts/ITaskRepo";

const defaultTask: Task = {
  id: 1,
  parentId: null,
  name: 'My First Task',
  description: "",
  children: [],
  isExpanded: false,
  isRemoved: false,
  isCompleted: false,
  isBlocked: false
};

export class InMemoryTaskRepo extends BaseTaskRepo {
  private readonly tasks = new Map<number, Task>();
  private maxId: number = 1;

  constructor(){
    super()
    this.tasks.set(1, {...defaultTask});
  }
  
  private async addChild(parentId: number, childId: number) {
    let parent = await this.getTask(parentId);
    if (parent) {
      await this.updateTask(parentId, (oldTask) => ({
        ...oldTask,
        children: [...oldTask.children, childId],
        isExpanded: true
      }));
    }
  }

  async newTask(parentId: number, task: MinimalTask): Promise<Task> {
    const nextId = ++this.maxId;
    const newTask: Task = {...defaultTask, ...task, parentId, children: [], id: nextId};
    this.tasks.set(nextId, newTask);
    await this.addChild(parentId, nextId);
    return newTask;
  }

  async getPage(first: number, pageSize: number): Promise<Task[]> {
    let page: Task[] = [];
    for (let id = first; id <= this.maxId; id++) {
      const task = await this.getTask(id);
      if (task) {
        page.push(task);
      }
      if (page.length === pageSize) {
        break;
      }
    }
    return page;
  }

  getTask(id: number): Promise<Task | null> {
    return Promise.resolve(this.tasks.get(id) ?? null);
  }

  async updateTask(id: number, updater: TaskUpdater): Promise<Task | null> {
    const task = await this.getTask(id);
    if (task === null) {
      return null;
    }
    this.tasks.set(id, updater(task));
    return task;
  }
  
  async isTaskExpandable(id: number): Promise<boolean> {
    const task = await this.getTask(id);
    if (!task) {
      return false;
    }
    const result = task.children.some(childId => {
      const childTask = this.tasks.get(childId);
      return childTask && !childTask.isRemoved;
    });
    return result;
  }
};