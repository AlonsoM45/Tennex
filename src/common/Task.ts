export type Task = {
  id: number,
  parentId: number | null,
  name: string,
  description: string,
  children: number[],
  isExpanded: boolean,
  isRemoved: boolean,
  isCompleted: boolean,
  isBlocked: boolean,
};