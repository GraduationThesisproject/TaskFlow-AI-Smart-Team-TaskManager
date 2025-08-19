
export const NavItem: React.FC<{ icon: React.ReactNode; label: string }> = ({
  icon,
  label,
}) => (
  <div className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer text-sm">
    <span className="w-4 h-4">{icon}</span>
    {label}
  </div>
);

