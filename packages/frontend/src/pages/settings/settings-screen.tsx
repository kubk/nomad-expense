import { UsersIcon, ChevronRightIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageHeader } from "../shared/page-header";
import { ModeToggle } from "./mode-toggle";
import { Page } from "../shared/page";
import { template } from "typesafe-routes";
import { routes } from "../../routes";
import { useLocation } from "wouter";
import { api } from "@/api";

export function SettingsScreen() {
  const [, setLocation] = useLocation();
  const { data: user } = api.users.me.useQuery();

  return (
    <Page>
      <PageHeader title="Settings" />

      {/* Content */}
      <div className="flex-1 bg-background px-4 py-6">
        <div className="space-y-8">
          {/* Family Section */}
          <div className="space-y-4">
            <Label>Family</Label>
            <Button
              onClick={() => setLocation(template(routes.family))}
              variant="outline"
              className="w-full justify-between"
            >
              <div className="flex items-center gap-3">
                <UsersIcon className="size-4" />
                <span>Manage Family</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-sm">
                  {user?.familyMemberCount || 1} member{(user?.familyMemberCount || 1) !== 1 ? 's' : ''}
                </span>
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
        </div>
      </div>
    </Page>
  );
}
