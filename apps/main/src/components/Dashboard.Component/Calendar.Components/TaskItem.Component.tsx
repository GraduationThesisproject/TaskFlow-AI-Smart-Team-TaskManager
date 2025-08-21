 import React from "react";

interface TaskItemProps {
  title: string;
  date: string;
  color: string;
  onClick?: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  title,
  date,
  color,
  onClick,
}) => {
  return (
    <div 
      className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-accent/10 transition-colors"
      onClick={onClick}
    >
      <div 
        className="w-3 h-3 rounded-full mr-3" 
        style={{ backgroundColor: color }}
      />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
    </div>
  );
};

export default TaskItem;
