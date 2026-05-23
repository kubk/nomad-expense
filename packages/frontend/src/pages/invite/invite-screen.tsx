import { useEffect } from "react";
import { CheckCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InviteLoader } from "./invite-loader";
import { InviteError } from "./invite-error";
import { trpc } from "@/shared/api";
import { useMutation } from "@tanstack/react-query";
import { getUserDisplayNameWithUsername } from "@/shared/user-display";
import { RouteByType } from "@/shared/stacked-router/router";
import { useRouter } from "@/shared/stacked-router/router";
import { useTranslation } from "@/translations/translation-provider";

export function InviteScreen({ route }: { route: RouteByType<"invite"> }) {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const joinFamilyMutation = useMutation(
    trpc.family.joinFamily.mutationOptions(),
  );

  const inviteCode = route.code;

  useEffect(() => {
    if (!inviteCode) {
      return;
    }

    joinFamilyMutation.mutate({ code: inviteCode });
  }, [inviteCode]);

  if (joinFamilyMutation.isPending) {
    return <InviteLoader />;
  }

  if (joinFamilyMutation.isError || !inviteCode) {
    const errorMessage = !inviteCode
      ? t("inviteNoCode")
      : joinFamilyMutation.error?.message || t("inviteJoinFailed");

    return <InviteError errorMessage={errorMessage} />;
  }

  // Handle success case
  const inviter = joinFamilyMutation.data?.inviter;
  const inviterName = inviter
    ? getUserDisplayNameWithUsername(inviter)
    : t("inviteSomeone");

  return (
    <div className="min-h-screen flex items-center bg-muted justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
            <div className="space-y-4">
              <h1 className="text-2xl font-semibold text-foreground">
                {t("inviteWelcomeTitle")}
              </h1>
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {t("inviteSharedAccessWith", inviterName)}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("inviteManageInSettings")}
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate({ type: "main" })}
              className="w-full"
            >
              {t("ok")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
