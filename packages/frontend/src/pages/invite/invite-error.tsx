import { XCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "@/shared/stacked-router/router";

export function InviteError({ errorMessage }: { errorMessage: string }) {
  const { navigate } = useRouter();

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
                Invalid invite
              </h1>
              <p className="text-muted-foreground">{errorMessage}</p>
            </div>
            <Button
              onClick={() => navigate({ type: "main" })}
              className="w-full"
            >
              Go to Overview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
