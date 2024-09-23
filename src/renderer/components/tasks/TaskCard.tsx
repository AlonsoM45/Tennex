import { useTask } from "@renderer/hooks/useTask";
import React, { CSSProperties, useEffect, useMemo, useState } from "react";
import { COLORS, CORNER_RADIUS } from "@renderer/styles/constants";
import { TaskHeader } from "./TaskHeader";
import { TaskSpace } from "./TaskSpace";
import { Task } from "@common/Task";
import './TaskCard.scss';
import { useQuery } from "@tanstack/react-query";
import { services } from "@renderer/services";
import { selectedTaskQueryKey } from "@renderer/queryKeys";
import { useTaskActions } from "@renderer/hooks/useTaskActions";
import { useDebouncedEffect } from "@renderer/hooks/useDebouncedEffect";
import { useDrag, useDrop } from "react-dnd";

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
  isExpandable: boolean;
};

export const ItemTypes = { // WIP: Check this
  BOX: 'box',
};

type DropResult = {
  parentId: number
};

const TIMEOUT_BEFORE_NAME_UPDATE = 1000;
const ActualTaskCard = ({task, isExpandable}: ActualTaskProps) => {
  const { isBlocked, isCompleted, isExpanded, name, children } = task;
  const [localName, setLocalName] = useState(name);
  const selectedTaskId = useQuery({
    queryKey: selectedTaskQueryKey,
    queryFn: async () => await services.taskRepo.getSelectedTaskId()
  });
  const isSelected = useMemo(() => selectedTaskId.data === task.id, [task.id, selectedTaskId.data]);

  const {changeName, changeParent} = useTaskActions(task.id);
  useDebouncedEffect(() => {
    changeName(localName);
    return undefined;
  }, {timeout: TIMEOUT_BEFORE_NAME_UPDATE}, [changeName, localName]);

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

  const [_dragProps, drag] = useDrag(
    () => ({
      type: ItemTypes.BOX,
      item: {id: task.id},
      end(_item, monitor) {
        const dropResult = monitor.getDropResult<DropResult>();
        if (dropResult !== null && dropResult.parentId !== task.id) {
          changeParent(dropResult.parentId);
        }
      }
    }),
    [task.id, changeParent]
  );

  const [_dropProps, drop] = useDrop(
    () => ({
      accept: ItemTypes.BOX,
      drop: (_item: unknown, monitor) => {
        if (monitor.didDrop()) {
          return;
        }

        return {
          parentId: task.id
        };
      }
    }),
    [task.id],
  );

  return (
    <div
      id={`task-card-${task.id}`}
      style={{...styles.taskCard, borderColor: color}}
      draggable="true"
      ref={drag}
    >
      <TaskHeader task={task} isExpandable={isExpandable} color={color}/>
      <div style={{display: 'inline-flex', flexDirection: 'column'}} ref={drop}>
        <input
          className="purple-focus"
          style={{...styles.taskTitle, width: `${localName.length}ch`}}
          value={localName}
          onChange={(event) => setLocalName(event.target.value)}
          onBlur={(event) => changeName(event.target.value)}
        />
        {isExpanded && <TaskSpace children={children}/>}
      </div>
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
      return task.value.isRemoved ? <></> : <ActualTaskCard task={task.value} isExpandable={task.value.isExpandable} />;
    case "pending":
      return <Spinner/>
    case "failed":
    default:
      return <Oops/>;
  }
};

export const Spinner = () => (<div>Loading...</div>); // WIP
export const Oops = () => (<div>Oops...</div>); // WIP