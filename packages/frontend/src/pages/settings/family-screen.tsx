import { UsersIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "../shared/page-header";
import { Page } from "../shared/page";
import { FamilyMemberItem } from "./family-member-item";
import { InviteLinkCard } from "./invite-link-card";
import { api } from "@/shared/api";

export function FamilyScreen() {
  const { data: members, isLoading: isMembersLoading } =
    api.family.listMembers.useQuery();
  const { data: activeInvite, refetch: refetchActiveInvite } =
    api.family.getActiveInvite.useQuery();

  const generateInviteMutation = api.family.generateInvite.useMutation({
    onSuccess: () => {
      refetchActiveInvite();
    },
  });

  const handleGenerateInvite = () => {
    generateInviteMutation.mutate();
  };

  return (
    <Page>
      <PageHeader title="Family" />

      <div className="flex-1 bg-background px-4 py-6">
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
              <div className="bg-muted/30 rounded-xl p-4 text-center space-y-3">
                <p className="text-muted-foreground text-sm">
                  No active invite. Generate one to invite someone to your
                  family.
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
      </div>
    </Page>
  );
}
