
export const ProjectItem: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <div className="flex items-center gap-2 text-sm text-gray-300">
    <div className={`w-3 h-3 rounded-full ${color}`}></div>
    {label}
  </div>
);