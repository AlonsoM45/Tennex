import { AsyncValue } from "@common/AsyncValue";
import { Task } from "@common/Task";
import { taskQueryKey } from "@renderer/queryKeys";
import { services } from "@renderer/services";
import { useQuery } from '@tanstack/react-query'

export const useTask = (taskId: number): AsyncValue<Task & { isExpandable: boolean }> => {
  const taskQuery = useQuery({
    queryKey: taskQueryKey(taskId),
    queryFn: async () => {
      const task = await services.taskRepo.getTask(taskId);
      if (task === null) {
        return null;
      }
      const isExpandable = await services.taskRepo.isTaskExpandable(taskId); // TODO: Optimize this to only perform one query
      return {
        ...task,
        isExpandable
      };
    }
  });
  
  if (taskQuery.isLoading) {
    return {status: "pending"};
  } else if (taskQuery.isError || !taskQuery.data) {
    return {status: "failed"};
  }
  return {status: "ready", value: taskQuery.data };
};