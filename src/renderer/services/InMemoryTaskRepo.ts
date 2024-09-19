import { Task } from "@common/Task";
import { BaseTaskRepo, MinimalTask, TaskUpdater } from "./contracts/ITaskRepo";

const defaultTask: Task = {
  id: 1,
  name: 'My First Task',
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
  
  newTask(task: MinimalTask): Promise<Task> {
    const nextId = ++this.maxId;
    const newTask = {...defaultTask, ...task};
    this.tasks.set(nextId, newTask);
    return Promise.resolve(newTask);
  }

  getPage(first: number, pageSize: number): Promise<Task[]> {
    let page: Task[] = [];
    for (let id = first; id <= this.maxId; id++) {
      const task = this.tasks.get(id);
      if (task) {
        page.push(task);
      }
      if (page.length === pageSize) {
        break;
      }
    }
    return Promise.resolve(page);
  }

  getTask(id: number): Promise<Task | null> {
    return Promise.resolve(this.tasks.get(id) ?? null);
  }

  updateTask(id: number, updater: TaskUpdater): Promise<Task | null> {
    const task = this.tasks.get(id);
    if (task === undefined) {
      return Promise.resolve(null);
    }
    this.tasks.set(id, updater(task));
    return Promise.resolve(task);
  }
};