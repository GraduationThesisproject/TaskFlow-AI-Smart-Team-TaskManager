 import React from "react";

interface TaskItemProps {
  color: string;
  title: string;
  date: string;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  color,
  title,
  date,
}) => (
  <div className="flex items-center gap-3">
    <span className={`w-3 h-3 rounded-full ${color}`}></span>
    <div>
      <p className="font-medium text-sm text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{date}</p>
    </div>
  </div>
);

export default TaskItem;
