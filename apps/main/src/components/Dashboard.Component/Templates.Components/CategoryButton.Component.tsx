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
      flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 select-none cursor-pointer
      ${active 
        ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30' 
        : 'bg-card hover:bg-accent/10 text-foreground hover:text-accent border border-border/50 hover:border-accent/30'
      }
      ${className}
    `}
  >
    {icon && <span className={active ? 'text-white' : 'text-muted-foreground'}>{icon}</span>}
    <span className="font-medium text-sm">{label}</span>
  </button>
);