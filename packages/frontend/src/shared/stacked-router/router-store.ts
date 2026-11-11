import { autorun, makeAutoObservable, observableShallow } from "mobx";
import "popstate-direction";
import { routeToUrl, urlToRoute } from "./url-convert";
import type { Route } from "./routes";
import { getWebApp } from "../platform/telegram-platform";
import { getAuthToken } from "../auth-token";

export type RouteByType<T extends Route["type"]> = Extract<Route, { type: T }>;

function getInitialStack(): Route[] {
  const stack: Route[] = [{ type: "main" }];
  const routeFromUrl = urlToRoute(window.location.href);
  if (routeFromUrl && routeFromUrl.type !== "main") {
    stack.push(routeFromUrl);
  }
  if (!getAuthToken()) {
    stack.push({ type: "auth" });
  }
  return stack;
}

class RouterStore {
  navigationStack: Route[] = getInitialStack();

  constructor() {
    // Routes are immutable values, so only the stack itself needs to be observable
    makeAutoObservable(
      this,
      { navigationStack: observableShallow },
      { autoBind: true },
    );

    autorun(() => {
      const newUrl = routeToUrl(this.currentRoute);
      if (window.location.pathname + window.location.search !== newUrl) {
        window.history.pushState(null, "", newUrl);
      }
    });

    const webApp = getWebApp();
    if (webApp) {
      webApp.BackButton.onClick(this.pop);
      autorun(() => {
        if (this.canGoBack) {
          webApp.BackButton.show();
        } else {
          webApp.BackButton.hide();
        }
      });
    }

    window.addEventListener("back", this.pop);
    window.addEventListener("forward", this.handleForward);
  }

  get currentRoute() {
    return this.navigationStack[this.navigationStack.length - 1];
  }

  get canGoBack() {
    return this.navigationStack.length > 1;
  }

  navigate(route: Route, { replace = false }: { replace?: boolean } = {}) {
    if (replace) {
      this.navigationStack[this.navigationStack.length - 1] = route;
    } else {
      this.navigationStack.push(route);
    }
  }

  pop() {
    if (this.canGoBack) {
      this.navigationStack.pop();
    }
  }

  handleForward() {
    const routeFromUrl = urlToRoute(window.location.href);
    if (routeFromUrl) {
      this.navigate(routeFromUrl);
    }
  }
}

export const routerStore = new RouterStore();
