import { Task } from "@common/Task";
import { BaseTaskRepo, MinimalTask, TaskUpdater } from "./contracts/ITaskRepo";

const createTaskTableSql = `
  CREATE TABLE TASK (
    ID INTEGER PRIMARY KEY,
    PARENT_ID INTEGER,
    NAME TEXT NOT NULL,
    DESCRIPTION TEXT,
    IS_EXPANDED INTEGER NOT NULL CHECK (IS_EXPANDED IN (0, 1)),
    IS_REMOVED INTEGER NOT NULL CHECK (IS_REMOVED IN (0, 1)),
    IS_COMPLETED INTEGER NOT NULL CHECK (IS_COMPLETED IN (0, 1)),
    IS_BLOCKED INTEGER NOT NULL CHECK (IS_BLOCKED IN (0, 1)),
    FOREIGN KEY (PARENT_ID) REFERENCES TASK(ID)
  );
`;

const insertRootTaskSql = `
  INSERT INTO TASK (
    PARENT_ID, NAME, DESCRIPTION, IS_EXPANDED, IS_REMOVED, IS_COMPLETED, IS_BLOCKED
  ) 
  VALUES (
    NULL, 'My First Task', '', 0, 0, 0, 0
  );
`;

export class DbTaskRepo extends BaseTaskRepo {
  private selectedTaskId: number = -1;
  // WIP private readonly db: DbBridge = (window as unknown as WindowWithBridge).apis[DbBridgeName];

  constructor() {
    super();
    console.log(`Creating DB...`); // WIP
    console.log(`DB BRIDGE`)
    console.log(( window as any).electron_window)
    // WIP: this.createTaskTableIfNeeded();
    // WIP: this.insertRootTaskIfNeeded();
    console.log(`Created DB...`); // WIP
  }

  private createTaskTableIfNeeded() {
    // WIP: this.db.execute(createTaskTableSql);
  }

  private insertRootTaskIfNeeded() {
    // WIP: this.db.execute(insertRootTaskSql);
  }

  isTaskExpandable(id: number): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  addChild(parentId: number, childId: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  newTask(parentId: number, task: MinimalTask): Promise<Task | null> {
    throw new Error("Method not implemented.");
  }

  getPage(first: number, pageSize: number): Promise<Task[] | null> {
    throw new Error("Method not implemented."); // TODO
  }

  getTask(id: number): Promise<Task | null> {
    return Promise.resolve({
      id: 1,
      parentId: null,
      name: 'My First Task',
      description: "",
      children: [],
      isExpanded: false,
      isRemoved: false,
      isCompleted: false,
      isBlocked: false
    }); // WIP
  }

  updateTask(id: number, updater: TaskUpdater): Promise<Task | null> {
    throw new Error("Method not implemented.");
  }

  getSelectedTaskId(): Promise<number> { return Promise.resolve(this.selectedTaskId); }

  updateSelectedTaskId(id: number): Promise<void> {
    this.selectedTaskId = id;
    return Promise.resolve();
  }
};