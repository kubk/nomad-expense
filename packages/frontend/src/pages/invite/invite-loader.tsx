import { LoaderIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function InviteLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <LoaderIcon className="h-12 w-12 text-primary animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-foreground">
                Adding you to a family
              </h1>
              <p className="text-muted-foreground">
                Please wait while we set up your shared access...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
