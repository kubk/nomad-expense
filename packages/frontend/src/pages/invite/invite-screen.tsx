import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { template } from "typesafe-routes";
import { routes } from "../../routes";
import { InviteLoader } from "./invite-loader";

export function InviteScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <InviteLoader />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
            <div className="space-y-4">
              <h1 className="text-2xl font-semibold text-foreground">
                Welcome to the family!
              </h1>
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  Shared access with{" "}
                  <span className="font-medium text-foreground">John Doe</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  You can change this in settings
                </p>
              </div>
            </div>
            <Button onClick={() => setLocation(template(routes.overview))} className="w-full">
              OK
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}