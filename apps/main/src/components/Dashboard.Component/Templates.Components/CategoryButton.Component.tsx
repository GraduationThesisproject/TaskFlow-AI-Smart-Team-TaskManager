
export const CategoryButton: React.FC<{ label: string; icon: React.ReactNode }> = ({
  label,
  icon,
}) => (
  <button className="flex flex-col items-center justify-center w-28 h-20 bg-neutral-900 rounded-lg hover:bg-neutral-800 transition">
    <div className="text-sm text-blue-400 w-8 h-8 flex items-center justify-center bg-neutral-800 rounded-lg mb-2">
      {icon}
    </div>
    <span className="text-sm">{label}</span>
  </button>
)