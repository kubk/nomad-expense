import { action, makeAutoObservable, observableRef } from "mobx";
import { makeMutation, makeQuery } from "mobx-query-lite";
import { api, apiProxy } from "@/shared/api";
import { saveAuthToken } from "@/shared/auth-token";
import { routerStore } from "@/shared/stacked-router/router-store";

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

export class AuthStore {
  configQuery = makeQuery(apiProxy.telegramSigninConfig.query());
  signInMutation = makeMutation(api.telegramSignin.mutate);
  telegramLogin: TelegramLoginLibrary | undefined = undefined;
  isTelegramLoginUnavailable = false;
  isSigningIn = false;
  hasSignInError = false;

  constructor() {
    makeAutoObservable(
      this,
      { telegramLogin: observableRef },
      { autoBind: true },
    );
    this.loadTelegramLogin();
  }

  get clientId() {
    return Number(this.configQuery.data?.clientId);
  }

  get isConfigured() {
    return Number.isSafeInteger(this.clientId) && this.clientId > 0;
  }

  get isUnavailable() {
    return (
      this.isTelegramLoginUnavailable ||
      Boolean(this.configQuery.error) ||
      (this.configQuery.data !== undefined && !this.isConfigured)
    );
  }

  async loadTelegramLogin() {
    try {
      this.telegramLogin = await loadTelegramLoginLibrary();
    } catch {
      this.isTelegramLoginUnavailable = true;
    }
  }

  signInWithTelegram() {
    const telegramLogin = this.telegramLogin;
    if (!telegramLogin || !this.isConfigured || this.isSigningIn) return;

    const nonce = crypto.randomUUID();
    this.isSigningIn = true;
    this.hasSignInError = false;

    try {
      telegramLogin.auth(
        {
          client_id: this.clientId,
          scope: ["profile"],
          nonce,
          lang: navigator.language.split("-")[0] || "en",
        },
        action((result: TelegramLoginResult) => {
          if (!result.id_token) {
            this.isSigningIn = false;
            this.hasSignInError = result.error !== "popup_closed";
            return;
          }
          this.signIn(result.id_token, nonce);
        }),
      );
    } catch {
      this.isSigningIn = false;
      this.hasSignInError = true;
    }
  }

  async signIn(token: string, nonce: string) {
    const result = await this.signInMutation.mutateResult({ token, nonce });
    if (!result.ok) {
      this.isSigningIn = false;
      this.hasSignInError = true;
      return;
    }
    saveAuthToken(result.data.browserToken);
    routerStore.navigate({ type: "main" });
  }
}
