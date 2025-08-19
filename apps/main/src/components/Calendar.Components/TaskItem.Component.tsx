 

export const TaskItem: React.FC<{ color: string; title: string; date: string }> = ({
  color,
  title,
  date,
}) => (
  <div className="flex items-center gap-3">
    <span className={`w-3 h-3 rounded-full ${color}`}></span>
    <div>
      <p className="font-medium text-sm">{title}</p>
      <p className="text-xs text-gray-500">{date}</p>
    </div>
  </div>
);
