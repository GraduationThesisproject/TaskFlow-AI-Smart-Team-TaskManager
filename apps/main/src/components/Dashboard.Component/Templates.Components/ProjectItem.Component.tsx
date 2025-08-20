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
  <div className={`flex items-center gap-2 ${className}`}>
    <div 
      className={`w-2.5 h-2.5 rounded-full ${color} flex-shrink-0`}
      aria-hidden="true"
    />
    {showLabel && (
      <span className="text-sm text-foreground/80 truncate">
        {label}
      </span>
    )}
  </div>
);