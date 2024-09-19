export class TaskRepo { // WIP: Change this completely
  private readonly tasks: string[] = [];

  public addTask(task: string) {
    this.tasks.push(task);
  }
};