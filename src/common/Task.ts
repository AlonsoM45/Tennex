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

export type RawTask = {
  id: number,
  parent_id: number | null,
  name: string,
  description: string,
  is_expanded: boolean,
  is_removed: boolean,
  is_completed: boolean,
  is_blocked: boolean,
};
