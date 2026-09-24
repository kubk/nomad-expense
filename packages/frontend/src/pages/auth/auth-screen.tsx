import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2Icon, ReceiptIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TelegramIcon } from "@/components/telegram-icon";
import { trpc } from "@/shared/api";
import { RouteByType, useRouter } from "@/shared/stacked-router/router";
import { saveAuthToken } from "@/shared/auth-token";
import { useTranslation } from "@/translations/translation-provider";

type TelegramLoginResult = {
  id_token?: string;
  error?: string;
};

type TelegramLoginLibrary = {
  auth: (
    options: {
      client_id: number;
      scope: string[];
      nonce: string;
      lang: string;
    },
    callback: (result: TelegramLoginResult) => void,
  ) => void;
};

let telegramLoginLibraryPromise: Promise<TelegramLoginLibrary> | undefined;

function loadTelegramLoginLibrary() {
  telegramLoginLibraryPromise ??= new Promise<TelegramLoginLibrary>(
    (resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://oauth.telegram.org/js/telegram-login.js?6";
      script.async = true;
      script.onload = () => {
        const telegramWindow = window as Window & {
          Telegram?: { Login?: TelegramLoginLibrary };
        };
        const login = telegramWindow.Telegram?.Login;
        if (!login) {
          reject(new Error("Telegram Login unavailable"));
          return;
        }
        resolve(login);
      };
      script.onerror = () => {
        script.remove();
        reject(new Error("Telegram Login unavailable"));
      };
      document.head.appendChild(script);
    },
  ).catch((error: unknown) => {
    telegramLoginLibraryPromise = undefined;
    throw error;
  });

  return telegramLoginLibraryPromise;
}

export function AuthScreen({ route: _ }: { route: RouteByType<"auth"> }) {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const configQuery = useQuery(trpc.telegramSigninConfig.queryOptions());
  const signInMutation = useMutation(trpc.telegramSignin.mutationOptions());
  const [telegramLogin, setTelegramLogin] = useState<TelegramLoginLibrary>();
  const [telegramLoginUnavailable, setTelegramLoginUnavailable] =
    useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [hasSignInError, setHasSignInError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    loadTelegramLoginLibrary()
      .then((login) => {
        if (isMounted) setTelegramLogin(login);
      })
      .catch(() => {
        if (isMounted) setTelegramLoginUnavailable(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const clientId = Number(configQuery.data?.clientId);
  const isConfigured = Number.isSafeInteger(clientId) && clientId > 0;
  const isReady = isConfigured && Boolean(telegramLogin);
  const isUnavailable =
    telegramLoginUnavailable ||
    configQuery.isError ||
    (configQuery.isSuccess && !isConfigured);

  function signInWithTelegram() {
    if (!telegramLogin || !isConfigured) return;

    const nonce = crypto.randomUUID();
    setIsSigningIn(true);
    setHasSignInError(false);

    try {
      telegramLogin.auth(
        {
          client_id: clientId,
          scope: ["profile"],
          nonce,
          lang: navigator.language.split("-")[0] || "en",
        },
        (result) => {
          if (!result.id_token) {
            setIsSigningIn(false);
            setHasSignInError(result.error !== "popup_closed");
            return;
          }

          signInMutation.mutate(
            { token: result.id_token, nonce },
            {
              onSuccess: ({ browserToken }) => {
                saveAuthToken(browserToken);
                navigate({ type: "main" });
              },
              onError: () => {
                setIsSigningIn(false);
                setHasSignInError(true);
              },
            },
          );
        },
      );
    } catch {
      setIsSigningIn(false);
      setHasSignInError(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-[416px] rounded-2xl border-border/80 bg-card shadow-none">
        <CardContent className="px-8 pb-8 pt-8">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="mb-2 flex items-center justify-center gap-3">
                <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <ReceiptIcon className="size-5 text-primary" />
                </div>
                <h1 className="text-2xl font-semibold text-foreground">
                  Nomad Expense
                </h1>
              </div>
            </div>
            <Button
              type="button"
              size="lg"
              disabled={!isReady || isSigningIn}
              onClick={signInWithTelegram}
              className="h-12 min-w-52 rounded-lg bg-[#3390ec] px-5 text-base font-normal text-white shadow-none hover:bg-[#2f85d5]"
            >
              {isSigningIn ? (
                <Loader2Icon className="size-5 animate-spin" />
              ) : (
                <TelegramIcon />
              )}
              {t("authContinueWithTelegram")}
            </Button>
            {isUnavailable && (
              <p className="text-sm text-destructive">
                {t("authTelegramUnavailable")}
              </p>
            )}
            {hasSignInError && (
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
