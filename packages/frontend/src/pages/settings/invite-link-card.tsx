import { useState } from "react";
import { CopyIcon, CheckIcon, ClockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DateTime } from "luxon";
import { render } from "typesafe-routes";
import { routes } from "../../routes";

export function InviteLinkCard({
  invite,
}: {
  invite: {
    code: string;
    expiresAt: string;
  };
}) {
  const [copied, setCopied] = useState(false);

  const inviteUrl = `${window.location.origin}${render(routes.invite, {
    path: {},
    query: { code: invite.code },
  })}`;
  const expiresAt = DateTime.fromISO(invite.expiresAt);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Card className="py-4 bg-muted/50">
      <CardContent className="px-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground">Active invite</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ClockIcon className="size-3" />
            <span>
              Expires {expiresAt.toRelative()}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          
          <Button
            onClick={copyToClipboard}
            variant="outline"
            size="sm"
            className="w-full"
            disabled={copied}
          >
            {copied ? (
              <>
                <CheckIcon className="size-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <CopyIcon className="size-4 mr-2" />
                Copy Link
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}