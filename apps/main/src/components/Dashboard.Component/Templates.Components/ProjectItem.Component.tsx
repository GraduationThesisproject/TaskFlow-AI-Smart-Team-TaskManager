interface ProjectItemProps {
  label: string;
  color: string;
  className?: string;
  showLabel?: boolean;
}

export const ProjectItem: React.FC<ProjectItemProps> = ({
  label,
  color,
  className = '',
  showLabel = true
}) => (
  <div 
    className={`
      flex items-center gap-3 p-3 rounded-lg transition-all duration-300 cursor-pointer
      hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-blue-600/5
      hover:shadow-md hover:shadow-blue-500/5
      ${className}`}
  >
    <div 
      className={`w-2 h-2 rounded-full ${color} shadow-md`}
      style={{
        boxShadow: `0 0 8px ${color}, 0 0 12px ${color}80`,
      }}
    />
    {showLabel && (
      <span className="text-sm font-medium text-foreground group-hover:text-blue-600 transition-colors">
        {label}
      </span>
    )}
  </div>
);