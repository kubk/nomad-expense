import { Card, CardContent } from "@/components/ui/card";
import { getUserDisplayName } from "@/shared/user-display";
import { UserAvatar } from "@/components/user-avatar";

export function FamilyMemberItem({
  member,
}: {
  member: {
    id: string;
    name: string | null;
    username: string | null;
    avatarUrl?: string | null;
  };
}) {
  return (
    <Card className="py-4 shadow-none">
      <CardContent className="py-0 px-4">
        <div className="flex items-center gap-3">
          <UserAvatar user={member} />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">
              {getUserDisplayName(member)}
            </p>
            {member.username && (
              <p className="text-sm text-muted-foreground truncate">
                @{member.username}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
