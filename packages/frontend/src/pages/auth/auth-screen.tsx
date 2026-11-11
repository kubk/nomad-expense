import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { Card, CardContent } from "@/components/ui/card";
import { TelegramIcon } from "@/components/telegram-icon";
import { t } from "@/translations/translation-store";
import { AuthStore } from "./auth-store";

export function AuthScreen() {
  const [store] = useState(() => new AuthStore());

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-[416px] rounded-2xl border-border/80 bg-card shadow-none">
        <CardContent className="px-8 pb-8 pt-8">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="mb-2 flex items-center justify-center gap-3">
                <img
                  src="/img/logo.png"
                  alt=""
                  className="size-10 shrink-0 rounded-xl object-cover"
                />
                <h1 className="text-2xl font-semibold text-foreground">
                  Nomad Expense
                </h1>
              </div>
            </div>
            <Button
              type="button"
              size="lg"
              onClick={store.signInWithTelegram}
              className="h-12 min-w-52 rounded-lg bg-[#3390ec] px-5 text-base font-normal text-white shadow-none hover:bg-[#2f85d5]"
            >
              <LoadingSwap isLoading={store.isSigningIn}>
                <span className="inline-flex items-center gap-2">
                  <TelegramIcon />
                  {t("authContinueWithTelegram")}
                </span>
              </LoadingSwap>
            </Button>
            {store.isUnavailable && (
              <p className="text-sm text-destructive">
                {t("authTelegramUnavailable")}
              </p>
            )}
            {store.hasSignInError && (
              <p className="text-sm text-destructive">
                {t("authTelegramSignInFailed")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
