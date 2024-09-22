import { selectedTaskQueryKey, taskQueryKey } from "@renderer/queryKeys";
import { services } from "@renderer/services";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export const useTaskActions = (taskId: number) => {
  const queryClient = useQueryClient();
  const invalidateTask = useCallback(async (invalidatedTaskId: number) => {
    await queryClient.invalidateQueries({queryKey: taskQueryKey(invalidatedTaskId)});
  }, [queryClient]);

  const addChild = useCallback(async () => {
    const newTask = await services.taskRepo.newTask(taskId, { name: 'New Task' });
    await invalidateTask(taskId);
    await invalidateTask(newTask.id);
    return newTask;
  }, [taskId]);

  const deleteTask = useCallback(async() => {
    const deletedTask = await services.taskRepo.deleteTask(taskId);
    await invalidateTask(taskId);
    if (deletedTask && deletedTask.parentId !== null) {
      await invalidateTask(deletedTask.parentId);
    }
    return deletedTask;
  }, [taskId]);

  const changeName = useCallback(async (newName: string) => {
    const updatedTask = await services.taskRepo.updateTask(taskId, (oldTask) => ({
      ...oldTask,
      name: newName
    }));
    await invalidateTask(taskId);
    return updatedTask;
  }, [taskId]);

  const completeTask = useCallback(async () => {
    const updatedTask = await services.taskRepo.completeTask(taskId);
    await invalidateTask(taskId);
    return updatedTask;
  }, [taskId]);
  
  const continueTask = useCallback(
    async () => {
      const updatedTask = await services.taskRepo.continueTask(taskId);
      await invalidateTask(taskId);
      return updatedTask;
    },
    [taskId]
  );

  const blockTask = useCallback(
    async () => {
      const updatedTask = await services.taskRepo.blockTask(taskId);
      await invalidateTask(taskId);
      return updatedTask;
    },
    [taskId]
  );
  
  const unblockTask = useCallback(
    async () => {
      const updatedTask = await services.taskRepo.unblockTask(taskId);
      await invalidateTask(taskId);
      return updatedTask;
    },
    [taskId]
  );

  const expandTask = useCallback(
    async () => {
      const updatedTask = await services.taskRepo.expandTask(taskId);
      await invalidateTask(taskId);
      return updatedTask;
    },
    [taskId]
  );
  
  const collapseTask = useCallback(
    async () => {
      const updatedTask = await services.taskRepo.collapseTask(taskId);
      await invalidateTask(taskId);
      return updatedTask;
    },
    [taskId]
  );

  const selectTask = useCallback(
    async () => {
      const updatedTask = await services.taskRepo.updateSelectedTaskId(taskId);
      await queryClient.invalidateQueries({queryKey: selectedTaskQueryKey});
      return updatedTask;
    },
    [taskId]
  );

  return {
    addChild,
    deleteTask,
    completeTask,
    changeName,
    blockTask,
    unblockTask,
    expandTask,
    continueTask,
    collapseTask,
    selectTask
  };
};
