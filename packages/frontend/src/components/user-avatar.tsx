import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserInitials, type UserLike } from "@/shared/user-display";
import { cn } from "@/lib/utils";

export function UserAvatar({
  user,
  size = "default",
  className,
}: {
  user: UserLike;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const sizeClass = {
    sm: "size-8",
    default: "size-10", 
    lg: "size-12"
  }[size];

  const fallbackSizeClass = {
    sm: "text-xs",
    default: "text-sm",
    lg: "text-base"
  }[size];

  return (
    <Avatar className={cn(sizeClass, className)}>
      {user.avatarUrl && (
        <AvatarImage src={user.avatarUrl} alt={`Avatar`} />
      )}
      <AvatarFallback className={cn("bg-primary/10 text-primary font-medium", fallbackSizeClass)}>
        {getUserInitials(user)}
      </AvatarFallback>
    </Avatar>
  );
}