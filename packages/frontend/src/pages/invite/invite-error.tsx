import { XCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { template } from "typesafe-routes";
import { routes } from "../../routes";
import { useLocation } from "wouter";

export function InviteError({
  errorMessage,
}: {
  errorMessage: string;
}) {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <XCircleIcon className="h-12 w-12 text-destructive" />
            </div>
            <div className="space-y-4">
              <h1 className="text-2xl font-semibold text-foreground">
                Invalid Invite
              </h1>
              <p className="text-muted-foreground">
                {errorMessage}
              </p>
            </div>
            <Button onClick={() => setLocation(template(routes.overview))} className="w-full">
              Go to Overview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}