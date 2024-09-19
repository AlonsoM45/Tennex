import { Task } from "@common/Task";
import { CORNER_RADIUS } from "@renderer/styles/constants";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CSSProperties } from "react";
import checkWhite from "../../../../assets/icons/check-white.png";
import pencilWhite from "../../../../assets/icons/pencil-white.png";
import plusWhite from "../../../../assets/icons/plus-white.png";
import cancelWhite from "../../../../assets/icons/cancel-white.png";
import chevronUpWhite from "../../../../assets/icons/chevron-up-white.png";
import chevronDownWhite from "../../../../assets/icons/chevron-down-white.png";
import padlockWhite from "../../../../assets/icons/padlock-white.png";
import { useTaskActions } from "@renderer/hooks/useTaskActions";

const styles: Record<string, CSSProperties> = {
  taskHeader: {
    display: 'flex',
    borderTopRightRadius: CORNER_RADIUS - 3,
    width: '100%',
    minHeight: 18
  },
  taskHeaderButton: {
    cursor: 'pointer',
    margin: 4,
    width: 16,
    height: 16
  },
};

export type TaskHeaderProps = {
  task: Task;
  isExpandable: boolean;
  color: string; // WIP: Improve type
};

export const TaskHeader = ({task, color, isExpandable}: TaskHeaderProps) => {
  const {expandTask, collapseTask, deleteTask, addChild, blockTask, unblockTask, completeTask, continueTask } = useTaskActions(task.id);
  const isRoot = useMemo(() => task.parentId === null, [task.parentId]);

  const editTask = useCallback(() => {}, []); // WIP
  
  const toggleExpansion = useCallback(() => {
    if (task.isExpanded) {
      collapseTask();
    } else {
      expandTask();
    }
  }, [expandTask, collapseTask, task.isExpanded]);

  const removeTask = useCallback(() => {
    void deleteTask();
  }, [deleteTask]);

  const addTask = useCallback(() => {
    void addChild();
  }, [addChild]);

  const toggleLockStatus = useCallback(() => {
    if (task.isBlocked) {
      unblockTask();
    } else {
      blockTask();
    }
  }, [task.isBlocked, unblockTask, blockTask]);

  const toggleCompletion = useCallback(() => {
    if (task.isCompleted) {
      continueTask();
    } else {
      completeTask();
    }
  }, [task.isCompleted]); // WIP

  return (
    <div
      id={`task-header-${task.id}`}
      style={{...styles.taskHeader, backgroundColor: color}}
    >
      {isExpandable
        ? <img
            className="rotate-when-clicked"
            style={styles.taskHeaderButton}
            onClick={toggleExpansion}
            src={task.isExpanded ? chevronUpWhite : chevronDownWhite} alt={task.isExpanded ? "Minimize Task" : "Expand Task"} 
          />
        : (isRoot
          ? <></>
          : <img
              className="skew-when-clicked"
              style={styles.taskHeaderButton}
              onClick={removeTask}
              src={cancelWhite}
              alt="Remove Task"
            />
        )
      }
      
      <img
        className="skew-when-clicked"
        style={styles.taskHeaderButton}
        onClick={addTask}
        src={plusWhite}
        alt="Add New Task"
      />
      <img
        className="skew-when-clicked"
        style={styles.taskHeaderButton}
        onClick={editTask}
        src={pencilWhite}
        alt="Edit Task"
      />

      
      {!task.isCompleted &&
        <img
          className="skew-when-clicked"
          style={styles.taskHeaderButton}
          onClick={toggleLockStatus}
          src={padlockWhite}
          alt="Lock/Unlock Task"
        />
      }

      <img
        className="skew-when-clicked"
        style={styles.taskHeaderButton}
        onClick={toggleCompletion}
        src={checkWhite}
        alt="Toggle Task Completion"
      />
      <b>{task.id}</b>
    </div>
  );
};

