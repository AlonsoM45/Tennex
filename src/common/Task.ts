export type Task = {
  id: number,
  name: string,
  children: number[],
  isExpanded: boolean,
  isRemoved: boolean,
  isCompleted: boolean,
  isBlocked: boolean,
};