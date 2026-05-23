import {
  UsersIcon,
  ChevronRightIcon,
  LogOutIcon,
  MessageCircleIcon,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ModeToggle } from "./mode-toggle";
import { BaseCurrencySetting } from "./base-currency-setting";
import { LanguageSetting } from "./language-setting";
import { Page } from "../widgets/page";
import { trpc } from "@/shared/api";
import { useQuery } from "@tanstack/react-query";
import { RouteByType, useRouter } from "@/shared/stacked-router/router";
import { isFormRoute } from "@/shared/stacked-router/routes";
import { clearAuthToken } from "@/shared/auth-token";
import { ConfirmModal } from "../widgets/confirm-modal";
import { useState } from "react";
import { platform } from "@/shared/platform/platforms";
import { links } from "api";
import { getWebApp } from "@/shared/platform/telegram-platform";
import { haptic } from "@/shared/platform/haptics";
import { useTranslation } from "@/translations/translation-provider";

export function SettingsScreen({ route }: { route: RouteByType<"settings"> }) {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const { data: familyMembers } = useQuery(
    trpc.family.listMembers.queryOptions(),
  );
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    clearAuthToken();
    navigate({ type: "auth" });
    setShowLogoutModal(false);
  };

  return (
    <Page title={t("settingsTitle")} isForm={isFormRoute(route)}>
      <div className="space-y-8 mt-2">
        {/* Family Section */}
        <div className="space-y-4">
          <Label>{t("settingsFamily")}</Label>
          <Button
            onClick={() => {
              haptic("light");
              navigate({ type: "family" });
            }}
            variant="outline"
            className="w-full justify-between"
          >
            <div className="flex items-center gap-3">
              <UsersIcon className="size-4" />
              <span>{t("settingsManageFamily")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              {familyMembers ? (
                <span className="text-sm">
                  {t("settingsMemberCount", familyMembers.length)}
                </span>
              ) : (
                <Skeleton className="h-4 w-16" />
              )}
              <ChevronRightIcon className="size-4" />
            </div>
          </Button>
        </div>

        {/* Base Currency Section */}
        <BaseCurrencySetting />

        {/* Theme Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme-select">{t("settingsTheme")}</Label>
            <ModeToggle />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("language")}</Label>
            <LanguageSetting />
          </div>
        </div>

        <div className="space-y-2">
          <div className="space-y-4">
            <Button
              onClick={() => {
                haptic("light");
                platform.openInternalLink(links.channel);
              }}
              variant="outline"
              className="w-full justify-between"
            >
              <div className="flex items-center gap-3">
                <MessageCircleIcon className="size-4" />
                <span>{t("settingsTelegramGroup")}</span>
              </div>
              <ChevronRightIcon className="size-4 text-muted-foreground" />
            </Button>
          </div>

          {!getWebApp() && (
            <div className="space-y-4">
              <Button
                onClick={() => {
                  haptic("heavy");
                  setShowLogoutModal(true);
                }}
                variant="outline"
                className="w-full justify-start"
              >
                <LogOutIcon className="size-4 mr-3" />
                <span>{t("settingsLogout")}</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title={t("settingsLogout")}
        description={t("settingsLogoutDescription")}
        confirmText={t("settingsLogout")}
        isLoading={false}
      />
    </Page>
  );
}
