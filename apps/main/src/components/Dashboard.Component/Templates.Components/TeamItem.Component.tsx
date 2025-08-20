import { Avatar, AvatarImage, AvatarFallback, getInitials, getAvatarColor } from "@taskflow/ui";




export const TeamItem: React.FC<{ name: string; status: "online" | "away" | "offline" }> = ({
  name,
  status,
}) => {
  const statusColor =
    status === "online"
      ? "bg-green-500"
      : status === "away"
      ? "bg-yellow-500"
      : "bg-gray-500";
  return (
    <div className="flex items-center gap-2 text-sm text-gray-300">
      <div className="relative">
        <Avatar size="xs">
          <AvatarImage src="https://i.pravatar.cc/32" alt={name} />
          <AvatarFallback variant={getAvatarColor(name)} size="xs">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${statusColor}`}></span>
      </div>
      {name}
    </div>
  );
};