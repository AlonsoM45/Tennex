import { Task } from "@common/Task";
import { CORNER_RADIUS } from "@renderer/styles/constants";
import React, { useCallback } from "react";
import { CSSProperties } from "react";
import checkWhite from "../../../../assets/icons/check-white.png";
import pencilWhite from "../../../../assets/icons/pencil-white.png";
import plusWhite from "../../../../assets/icons/plus-white.png";
import cancelWhite from "../../../../assets/icons/cancel-white.png";
import chevronUpWhite from "../../../../assets/icons/chevron-up-white.png";
import chevronDownWhite from "../../../../assets/icons/chevron-down-white.png";
import padlockWhite from "../../../../assets/icons/padlock-white.png";

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
  rotateWhenClicked: {}, // WIP
  skewWhenClicked: {} // WIP
};

export type TaskHeaderProps = {
  task: Task;
  color: string; // WIP: Improve type
};

export const TaskHeader = ({task, color}: TaskHeaderProps) => {
  const isExpandable = true; // WIP

  const toggleExpansion = useCallback(() => {}, []); // WIP
  const removeTask = useCallback(() => {}, []); // WIP
  const addTask = useCallback(() => {}, []); // WIP
  const editTask = useCallback(() => {}, []); // WIP
  const toggleLockStatus = useCallback(() => {}, []); // WIP
  const toggleCompletion = useCallback(() => {}, []); // WIP

  return (
    <div
      id={`task-header-${task.id}`}
      style={{...styles.taskHeader, backgroundColor: color}}
    >
      {isExpandable
        ? <img
            style={{...styles.taskHeaderButton, ...styles.rotateWhenClicked}}
            onClick={toggleExpansion}
            src={task.isExpanded ? chevronUpWhite : chevronDownWhite} alt={task.isExpanded ? "Minimize Task" : "Expand Task"} 
          />
        : <img
            style={{...styles.taskHeaderButton, ...styles.skewWhenClicked}}
            onClick={removeTask}
            src={cancelWhite}
            alt="Remove Task"
          />
      }
      
      <img
        style={{...styles.taskHeaderButton, ...styles.skewWhenClicked}}
         onClick={addTask}
         src={plusWhite}
         alt="Add New Task"
      />
      <img
        style={{...styles.taskHeaderButton, ...styles.skewWhenClicked}}
        onClick={editTask}
        src={pencilWhite}
        alt="Edit Task"
      />

      
      {task.isCompleted ??
        <img
          style={{...styles.taskHeaderButton, ...styles.skewWhenClicked}}
          onClick={toggleLockStatus}
          src={padlockWhite}
          alt="Lock/Unlock Task"
        />
      }

      <img
        style={{...styles.taskHeaderButton, ...styles.skewWhenClicked}}
        onClick={toggleCompletion}
        src={checkWhite}
        alt="Toggle Task Completion"
      />
      <b>{task.id}</b>
    </div>
  );
};

