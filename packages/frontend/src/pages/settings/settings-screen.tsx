import { Label } from "@/components/ui/label";
import { PageHeader } from "../shared/page-header";
import { ModeToggle } from "./mode-toggle";
import { Page } from "../shared/page";

export function SettingsScreen() {
  return (
    <Page>
      <PageHeader title="Settings" />

      {/* Content */}
      <div className="flex-1 bg-background px-4 py-6">
        <div className="space-y-8">
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
