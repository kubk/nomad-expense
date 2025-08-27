import { UsersIcon, ChevronRightIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "../shared/page-header";
import { ModeToggle } from "./mode-toggle";
import { Page } from "../shared/page";
import { template } from "typesafe-routes";
import { routes } from "../../shared/routes";
import { useLocation } from "wouter";
import { api } from "@/shared/api";

export function SettingsScreen() {
  const [, setLocation] = useLocation();
  const { data: familyMembers } = api.family.listMembers.useQuery();

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
        </div>
      </div>
    </Page>
  );
}
