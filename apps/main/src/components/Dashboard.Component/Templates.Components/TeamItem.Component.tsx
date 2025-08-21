import { Avatar, AvatarImage, AvatarFallback, getInitials, getAvatarColor } from "@taskflow/ui";




export const TeamItem: React.FC<{ name: string; status: "online" | "away" | "offline" }> = ({
  name,
  status,
}) => {
  return (
    <div className="group flex items-center gap-3 p-2 rounded-lg transition-all duration-300 hover:bg-accent/5">
      <div className="relative">
        <div className="relative z-10">
          <Avatar size="xs" className="group-hover:scale-110 transition-transform">
            <AvatarImage src="https://i.pravatar.cc/32" alt={name} />
            <AvatarFallback variant={getAvatarColor(name)} size="xs">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
        </div>
        <span 
          className={`absolute bottom-0 right-0 z-20 w-2.5 h-2.5 rounded-full border-2 border-card ${
            status === 'online' 
              ? 'bg-green-500 shadow-[0_0_8px] shadow-green-500/70' 
              : status === 'away' 
                ? 'bg-yellow-500 shadow-[0_0_8px] shadow-yellow-500/70' 
                : 'bg-gray-500'
          }`}
        />
      </div>
      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
        {name}
      </span>
    </div>
  );
};