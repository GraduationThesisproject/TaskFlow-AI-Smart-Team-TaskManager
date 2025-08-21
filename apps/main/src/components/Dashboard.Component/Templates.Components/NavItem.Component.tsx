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
      flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-300 select-none cursor-pointer
      ${active 
        ? 'bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-600 border-l-4 border-blue-500 shadow-lg shadow-blue-500/20' 
        : 'text-muted-foreground hover:bg-blue-500/5 hover:text-blue-600 border-l-4 border-transparent hover:border-blue-400/30'
      } ${className}`}
  >
    <span className={`w-4 h-4 flex items-center justify-center ${
      active ? 'text-blue-600' : 'text-muted-foreground'
    }`}>
      {icon}
    </span>
    <span className="text-sm font-medium">{label}</span>
  </div>
);
