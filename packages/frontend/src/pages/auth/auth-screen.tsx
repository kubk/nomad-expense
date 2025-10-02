import { Card, CardContent } from "@/components/ui/card";
import { RouteByType } from "@/shared/stacked-router/router";
import { ReceiptIcon } from "lucide-react";
import { LoginButton } from "@telegram-auth/react";
import { saveAuthToken } from "@/shared/auth-token";
import { useRouter } from "@/shared/stacked-router/router";
import { links } from "api";

export function AuthScreen({ route: _ }: { route: RouteByType<"auth"> }) {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen flex items-center bg-muted justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-2 pb-2">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <ReceiptIcon className="size-5 text-primary" />
                </div>
                <h1 className="text-2xl font-semibold text-foreground">
                  Nomad Expense
                </h1>
              </div>
              <p className="text-muted-foreground">
                Sign in to track your expenses
              </p>
            </div>
            <LoginButton
              showAvatar={false}
              cornerRadius={8}
              buttonSize="large"
              botUsername={links.botUsername}
              onAuthCallback={(data) => {
                saveAuthToken(JSON.stringify(data));
                navigate({ type: "main" });
              }}
            />
            <p className="text-sm text-muted-foreground">
              Secure login via Telegram
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
