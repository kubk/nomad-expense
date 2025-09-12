import { Card, CardContent } from "@/components/ui/card";
import { RouteByType } from "@/shared/stacked-router/router";
import { ReceiptIcon } from "lucide-react";
import { LoginButton } from "@telegram-auth/react";
import { env } from "@/shared/env";
import { authQueryKey } from "@/shared/api";

export function AuthScreen({}: { route: RouteByType<"auth"> }) {
  return (
    <div className="min-h-screen flex items-center bg-muted justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-2 pb-2">
          <div className="flex flex-col text-center space-y-4">
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
              buttonSize="medium"
              botUsername={env.VITE_TELEGRAM_BOT_USERNAME}
              onAuthCallback={(data) => {
                localStorage.setItem(authQueryKey, JSON.stringify(data));
                window.location.href = "/";
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
