interface CategoryButtonProps {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export const CategoryButton: React.FC<CategoryButtonProps> = ({
  label,
  icon,
  active = false,
  onClick,
  className = ''
}) => (
  <button
    onClick={onClick}
    className={`
      inline-flex items-center justify-center px-3 py-1.5 rounded-full text-sm font-medium
      transition-colors whitespace-nowrap
      ${active 
        ? 'bg-primary text-primary-foreground' 
        : 'bg-card hover:bg-accent/50 text-foreground/80 hover:text-foreground border border-border/50'
      } ${className}`}
  >
    {icon && (
      <span className={`mr-2 ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
        {icon}
      </span>
    )}
    {label}
  </button>
);