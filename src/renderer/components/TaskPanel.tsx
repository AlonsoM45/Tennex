import React from "react";
import { CSSProperties } from "react";
import { TaskCard } from "./tasks/TaskCard";

const style: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-start',
  flexWrap: 'wrap'
};

export const TaskPanel = () => {
  return (
    <div style={style}>
      <TaskCard taskId={1}/>
    </div>
  );
};