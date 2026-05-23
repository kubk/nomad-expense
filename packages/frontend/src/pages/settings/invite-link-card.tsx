import { useState } from "react";
import { CopyIcon, CheckIcon, ClockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DateTime } from "luxon";
import { generateInviteUrl } from "./generate-invite-url";
import { copyToClipboard } from "../../shared/copy-to-clipboard";
import { haptic } from "@/shared/platform/haptics";
import { useTranslation } from "@/translations/translation-provider";

export function InviteLinkCard({
  invite,
}: {
  invite: {
    code: string;
    expiresAt: string;
  };
}) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const inviteUrl = generateInviteUrl(invite.code);
  const expiresAt = DateTime.fromISO(invite.expiresAt);

  const handleCopy = () => {
    copyToClipboard(inviteUrl, () => {
      haptic("success");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Card className="py-4 bg-muted/50">
      <CardContent className="px-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground">
            {t("familyActiveInvite")}
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ClockIcon className="size-3" />
            <span>
              {t("familyInviteExpires", expiresAt.toRelative() ?? "")}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleCopy}
            variant="outline"
            size="lg"
            className="w-full"
            disabled={copied}
          >
            {copied ? (
              <>
                <CheckIcon className="size-4 mr-2" />
                {t("familyCopied")}
              </>
            ) : (
              <>
                <CopyIcon className="size-4 mr-2" />
                {t("familyCopyLink")}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
