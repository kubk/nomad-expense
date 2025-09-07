import { UsersIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Page } from "../shared/page";
import { FamilyMemberItem } from "./family-member-item";
import { InviteLinkCard } from "./invite-link-card";
import { trpc } from "@/shared/api";
import { useQuery, useMutation } from "@tanstack/react-query";

export function FamilyScreen() {
  const { data: members, isLoading: isMembersLoading } = useQuery(
    trpc.family.listMembers.queryOptions(),
  );
  const { data: activeInvite, refetch: refetchActiveInvite } = useQuery(
    trpc.family.getActiveInvite.queryOptions(),
  );

  const generateInviteMutation = useMutation(
    trpc.family.generateInvite.mutationOptions({
      onSuccess: () => {
        refetchActiveInvite();
      },
    }),
  );

  const handleGenerateInvite = () => {
    generateInviteMutation.mutate();
  };

  return (
    <Page title="Family">
      <div className="space-y-6">
        {/* Members Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <UsersIcon className="size-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">
              Family members
            </h2>
            {!isMembersLoading && (
              <span className="text-sm text-muted-foreground">
                ({members?.length || 0})
              </span>
            )}
          </div>

          {isMembersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-19.5 bg-muted/50 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {members?.map((member) => (
                <FamilyMemberItem key={member.id} member={member} />
              ))}
            </div>
          )}
        </div>

        {/* Invite Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Invite to family
            </h2>
          </div>

          {activeInvite && <InviteLinkCard invite={activeInvite} />}

          {!activeInvite && (
            <div className="bg-accent rounded-xl p-4 text-center space-y-3">
              <p className="text-muted-foreground text-sm">
                No active invite. Generate one to invite someone to your family.
              </p>
              <Button
                onClick={handleGenerateInvite}
                size="sm"
                disabled={generateInviteMutation.isPending}
              >
                <PlusIcon className="size-4 mr-2" />
                {generateInviteMutation.isPending
                  ? "Generating..."
                  : "Generate Invite"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
