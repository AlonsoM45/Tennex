import { Task } from "@common/Task";

export const useTask = (taskId: number): Task | null => {
  const a: Task = {
    id: 2,
    name: 'Task #2',
    isBlocked: false,
    isExpanded: false,
    isCompleted: true,
    isRemoved: false,
    children: []
  };

  const b: Task = {
    id: 3,
    name: 'Task #2',
    isBlocked: false,
    isExpanded: false,
    isCompleted: true,
    isRemoved: false,
    children: []
  };
  const root: Task = {
    id: 1,
    name: 'Task #2',
    isBlocked: false,
    isExpanded: false,
    isCompleted: true,
    isRemoved: false,
    children: [2, 3]
  };
  switch (taskId) { // WIP: Actually implement this function
    case 2:
      return a;
    case 3: 
      return b;
    default:
      return root;
  }
};