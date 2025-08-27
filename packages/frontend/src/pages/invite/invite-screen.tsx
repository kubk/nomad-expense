import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { CheckCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { template, safeParseQuery } from "typesafe-routes";
import { routes } from "../../shared/routes";
import { InviteLoader } from "./invite-loader";
import { InviteError } from "./invite-error";
import { api } from "@/shared/api";
import { getUserDisplayNameWithUsername } from "@/shared/user-display";

export function InviteScreen() {
  const [, setLocation] = useLocation();
  const search = useSearch();

  const parsedQuery = safeParseQuery(routes.invite, search);
  const inviteCode = parsedQuery.success ? parsedQuery.data.code : null;

  const joinFamilyMutation = api.family.joinFamily.useMutation();

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
      ? "No invite code provided"
      : joinFamilyMutation.error?.message || "Failed to join family";

    return <InviteError errorMessage={errorMessage} />;
  }

  // Handle success case
  const inviter = joinFamilyMutation.data?.inviter;
  const inviterName = inviter
    ? getUserDisplayNameWithUsername(inviter)
    : "Someone";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
            <div className="space-y-4">
              <h1 className="text-2xl font-semibold text-foreground">
                Welcome to the family!
              </h1>
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  Shared access with{" "}
                  <span className="font-medium text-foreground">
                    {inviterName}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  You can manage this in settings
                </p>
              </div>
            </div>
            <Button
              onClick={() => setLocation(template(routes.overview))}
              className="w-full"
            >
              OK
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
