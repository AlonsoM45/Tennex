import React, { CSSProperties, useEffect } from "react";
import { TaskCard } from "./TaskCard";

export type TaskSpaceProps = {
  children: number[];
};

const style: CSSProperties = {
  display: "flex",
  flexWrap: "wrap"
};

export const TaskSpace = ({children}: TaskSpaceProps) => {
  return (
    <div style={style}>
      {children.map(childTaskId => {
        return <TaskCard key={childTaskId} taskId={childTaskId}/>
      })}
    </div>
  );
};