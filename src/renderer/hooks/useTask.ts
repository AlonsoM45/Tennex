import { AsyncValue } from "@common/AsyncValue";
import { Task } from "@common/Task";
import { services } from "@renderer/services";
import { useEffect, useState } from "react";

export const useTask = (taskId: number): AsyncValue<Task> => {
  const [task, setTask] = useState<AsyncValue<Task>>({ status: "pending" });
  
  useEffect(() => {
    services.taskRepo.getTask(taskId)
      .then((data) => {
        if (data === null) {
          setTask({status: "failed"})
        } else {
          setTask({status: "ready", value: data});
        }
      })
      .catch((_err) => setTask({status: "failed"}));

  }, []);

  return task;
};