import { PlusIcon, CircleQuestionMarkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { Page } from "../widgets/page";
import { FamilyMemberItem } from "./family-member-item";
import { InviteLinkCard } from "./invite-link-card";
import { familyStore } from "@/store/family-store";
import { useState } from "react";
import { FamilyHelp } from "./family-help";
import { t } from "@/translations/translation-store";

export function FamilyScreen() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const members = familyStore.membersQuery.data;
  const isMembersLoading = familyStore.membersQuery.isPending;
  const activeInvite = familyStore.activeInviteQuery.data;
  const isGeneratingInvite = familyStore.generateInviteMutation.isPending;

  return (
    <Page title={t("familyTitle")}>
      <div className="space-y-6">
        {/* Invite Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              {t("familyInviteTitle")}
            </h2>
            <CircleQuestionMarkIcon
              onClick={() => setIsHelpOpen(true)}
              className="size-5 text-muted-foreground active:scale-95 transition-transform cursor-pointer"
            />
          </div>

          {activeInvite && <InviteLinkCard invite={activeInvite} />}

          {!activeInvite && (
            <div className="bg-card shadow-sm rounded-xl p-4 text-center space-y-3">
              <p className="text-muted-foreground text-sm">
                {t("familyInviteDescription")}
              </p>
              <Button
                onClick={familyStore.generateInvite}
                size="lg"
                disabled={isGeneratingInvite}
              >
                <LoadingSwap isLoading={isGeneratingInvite}>
                  <span className="inline-flex items-center gap-2">
                    <PlusIcon className="size-4" />
                    {t("familyGenerateInvite")}
                  </span>
                </LoadingSwap>
              </Button>
            </div>
          )}
        </div>

        {/* Members Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              {t("familyMembers")}
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
                  className="h-19.5 bg-foreground/10 rounded-xl animate-pulse"
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

        <FamilyHelp open={isHelpOpen} onOpenChange={setIsHelpOpen} />
      </div>
    </Page>
  );
}
