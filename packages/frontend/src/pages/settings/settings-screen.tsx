import { UsersIcon, ChevronRightIcon, LogOutIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ModeToggle } from "./mode-toggle";
import { Page } from "../shared/page";
import { trpc } from "@/shared/api";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@/shared/stacked-router/router";
import { clearAuthToken } from "@/shared/auth-token";
import { ConfirmModal } from "../shared/confirm-modal";
import { useState } from "react";

export function SettingsScreen() {
  const { navigate } = useRouter();
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
    <Page title="Settings">
      <div className="space-y-8 mt-2">
        {/* Family Section */}
        <div className="space-y-4">
          <Label>Family</Label>
          <Button
            onClick={() => navigate({ type: "family" })}
            variant="outline"
            className="w-full justify-between"
          >
            <div className="flex items-center gap-3">
              <UsersIcon className="size-4" />
              <span>Manage family</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              {familyMembers ? (
                <span className="text-sm">
                  {familyMembers.length} member
                  {familyMembers.length !== 1 ? "s" : ""}
                </span>
              ) : (
                <Skeleton className="h-4 w-16" />
              )}
              <ChevronRightIcon className="size-4" />
            </div>
          </Button>
        </div>

        {/* Theme Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme-select">Theme</Label>
            <ModeToggle />
          </div>
        </div>

        {/* Logout Section */}
        <div className="space-y-4">
          <Button
            onClick={() => setShowLogoutModal(true)}
            variant="outline"
            className="w-full justify-start"
          >
            <LogOutIcon className="size-4 mr-3" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Logout"
        description="Are you sure you want to logout?"
        confirmText="Logout"
        isLoading={false}
      />
    </Page>
  );
}
