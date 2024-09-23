import { RawTask, Task } from "@common/Task";
import { BaseTaskRepo, MinimalTask, TaskUpdater } from "./contracts/ITaskRepo";
import dbContextApi from "@main/window/dbContextApi";

const defaultTask: Omit<Task, "id"> = {
  parentId: null,
  name: 'New Task',
  description: "",
  children: [],
  isExpanded: false,
  isRemoved: false,
  isCompleted: false,
  isBlocked: false
};
const boolToInt = (b: boolean): number => b ? 1 : 0;

export class DbTaskRepo extends BaseTaskRepo {
  private selectedTaskId: number = -1;

  async isTaskExpandable(id: number): Promise<boolean> {
    const availableChildren: { count: number} = await dbContextApi.selectOne(`
      SELECT COUNT(*) AS count
      FROM task
      WHERE parent_id = ? AND is_removed = 0
    `, id);
    return availableChildren.count > 0;
  }

  async addChild(parentId: number, childId: number): Promise<void> {
    await dbContextApi.execute(`
      UPDATE task
      SET parent_id = ?
      WHERE id = ?
    `, parentId, childId);
    await dbContextApi.execute(`
      UPDATE task
      SET is_expanded = 1
      WHERE id = ?
    `, parentId);
  }

  async newTask(parentId: number, task: MinimalTask): Promise<Task | null> {
    const newTask = {...defaultTask, task};
    const runResult = await dbContextApi.execute(`
      INSERT INTO task (
        parent_id, name, description, is_expanded, is_removed, is_completed, is_blocked
      ) 
      VALUES (
        ?, ?, ?, 0, 0, 0, 0
      );
    `, parentId, newTask.name, newTask.description); // TODO: Restrict the type of Minimal Task
    const newTaskId = runResult.lastInsertRowid;
    await dbContextApi.execute(`
      UPDATE task
      SET is_expanded = 1
      WHERE id = ?
    `, parentId);
    if (typeof newTaskId === 'number') {
      return await this.getTask(newTaskId);
    } else {
      throw new Error("Bigint not supported yet."); // TODO
    }
  }

  async getTask(id: number): Promise<Task | null> {
    const rawTask: RawTask = await dbContextApi.selectOne(`SELECT * FROM task WHERE id = ?`, id);
    const children: {id: number}[] = await dbContextApi.selectMany(`SELECT id FROM task WHERE parent_id = ?`, id);
    const result = {
      id: rawTask.id,
      parentId: rawTask.parent_id,
      name: rawTask.name,
      description: rawTask.description,
      isExpanded: !!rawTask.is_expanded,
      isRemoved: !!rawTask.is_removed,
      isCompleted: !!rawTask.is_completed,
      isBlocked: !!rawTask.is_blocked,
      children: children.map(c => c.id)
    };
    return result;
  }

  async updateTask(id: number, updater: TaskUpdater): Promise<Task | null> {
    const oldTask = await this.getTask(id);
    if (!oldTask){
      return null;
    }
    const newTask = updater(oldTask);
    await dbContextApi.execute(
      `
        UPDATE task
        SET
          name = ?,
          description = ?,
          is_blocked = ?,
          is_removed = ?,
          is_completed = ?,
          is_expanded = ?
        WHERE id = ?
      `,
      newTask.name,
      newTask.description,
      boolToInt(newTask.isBlocked),
      boolToInt(newTask.isRemoved),
      boolToInt(newTask.isCompleted),
      boolToInt(newTask.isExpanded),
      id
    );
    return newTask;
  }

  getSelectedTaskId(): Promise<number> { return Promise.resolve(this.selectedTaskId); }

  updateSelectedTaskId(id: number): Promise<void> {
    this.selectedTaskId = id;
    return Promise.resolve();
  }
};