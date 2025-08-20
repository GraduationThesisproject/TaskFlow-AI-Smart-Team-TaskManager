interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  active = false,
  onClick,
  className = ''
}) => (
  <div
    onClick={onClick}
    className={`
      flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer
      ${active 
        ? 'bg-accent/10 text-accent-foreground' 
        : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
      } ${className}`}
  >
    <span className={`w-4 h-4 flex items-center justify-center ${
      active ? 'text-accent' : 'text-muted-foreground'
    }`}>
      {icon}
    </span>
    <span className="text-sm font-medium">{label}</span>
  </div>
);
