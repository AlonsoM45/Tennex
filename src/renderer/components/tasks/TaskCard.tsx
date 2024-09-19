import { useTask } from "@renderer/hooks/useTask";
import React, { CSSProperties, useEffect, useMemo, useState } from "react";
import { COLORS, CORNER_RADIUS } from "@renderer/styles/constants";
import { TaskHeader } from "./TaskHeader";
import { TaskSpace } from "./TaskSpace";
import { Task } from "@common/Task";
import './TaskCard.scss';

const styles: Record<string, CSSProperties> = {
  taskCard: {
    position: 'relative',
    margin: 10,
    borderTopRightRadius: CORNER_RADIUS,
    borderBottomRightRadius: CORNER_RADIUS,
    borderBottomLeftRadius: CORNER_RADIUS,

    minWidth: 150,
    minHeight: 50,
    height: 'min-content',

    display: 'inline-flex',
    flexDirection: 'column',
    paddingBottom: 5,
    backgroundColor: '#2c2c2ed0', // TODO: Get from a theme

    borderWidth: 2,
    borderStyle: 'solid'
  },
  taskHeader: {
    display: 'flex',
    borderTopRightRadius: CORNER_RADIUS,
    width: '100%',
    minHeight: 18
  },
  taskTitle: {
    margin: 10,
    fontSize: 14,
    alignSelf: 'flex-start',
    minWidth: '10ch',
    backgroundColor: '#2c2c2ed0',
    color: 'white',
    border: 0,
    fontWeight: 'bold'
  }
};

export type ActualTaskProps = {
  task: Task;
};

const ActualTaskCard = ({task}: ActualTaskProps) => {
  const { isRemoved, isBlocked, isCompleted, isExpanded, name, children } = task;
  const [isSelected, setIsSelected] = useState(false); // WIP

  // WIP: Update persisted name in some way

  if (task === null || task.isRemoved) {
    return <></>;
  }

  const color = useMemo(() => { // WIP: Improve type
    if (isSelected) {
      return COLORS.violet; // WIP: Use theme.focused
    }
    if (isCompleted) {
      return COLORS.green; // WIP: Use theme.done
    }
    if (isBlocked) {
      return COLORS.red; // WIP: Use theme.blocked
    }
    return COLORS.darkPurple; // WIP: Use theme.neutral
  }, [isSelected, isCompleted, isBlocked]);

  return (
    <div
      id={`task-card-${task.id}`}
      style={{...styles.taskCard, borderColor: color}}
      draggable="true"
    >
      <TaskHeader task={task} color={color}/>
      <input
        className="purple-focus"
        style={{...styles.taskTitle, width: `${name.length}ch`}}
        value={name}
      />
      {isExpanded && <TaskSpace children={children}/>}
    </div>
  );
};

export type TaskProps = {
  taskId: number
};

export const TaskCard = ({taskId}: TaskProps) => {
  const task = useTask(taskId);
  switch (task.status) {
    case "ready":
      return <ActualTaskCard task={task.value} />;
    case "pending":
      return <Spinner/>
    case "failed":
    default:
      return <Oops/>;
  }
};

export const Spinner = () => (<div>Loading...</div>); // WIP
export const Oops = () => (<div>Oops...</div>); // WIP