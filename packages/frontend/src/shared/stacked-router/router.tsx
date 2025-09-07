import React, { useState, useCallback, useEffect } from "react";
import { routeToUrl, urlToRoute } from "./url-convert";
import "popstate-direction";
import type { Route } from "./routes";

export type RouteByType<T extends Route["type"]> = Extract<Route, { type: T }>;

type RouterState = {
  navigationStack: Route[];
  navigate: (route: Route, params?: { replace: boolean }) => void;
  pop: () => void;
  currentRoute: Route;
};

const Context = React.createContext<RouterState | null>(null);

export const RouterProvider = ({ children }: { children: React.ReactNode }) => {
  const [navigationStack, setNavigationStack] = useState<Route[]>(() => {
    const routeFromUrl = urlToRoute(window.location.href);
    if (routeFromUrl && routeFromUrl.type !== "main") {
      return [{ type: "main" }, routeFromUrl];
    }
    return [{ type: "main" }];
  });

  // Update URL when navigation stack changes
  useEffect(() => {
    const topRoute = navigationStack[navigationStack.length - 1];
    const newUrl = routeToUrl(topRoute);

    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.pushState(null, "", newUrl);
    }
  }, [navigationStack]);

  const navigate = useCallback(
    (route: Route, { replace = false }: { replace?: boolean } = {}) => {
      if (replace) {
        setNavigationStack((prev) => [...prev.slice(0, -1), route]);
      } else {
        setNavigationStack((prev) => [...prev, route]);
      }
    },
    [],
  );

  const pop = useCallback(() => {
    setNavigationStack((prev) => {
      if (prev.length > 1) {
        return prev.slice(0, -1);
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    const handleBack = () => {
      if (navigationStack.length > 1) {
        pop();
      }
    };

    const handleForward = () => {
      const routeFromUrl = urlToRoute(window.location.href);
      if (routeFromUrl) {
        navigate(routeFromUrl);
      }
    };

    window.addEventListener("back", handleBack);
    window.addEventListener("forward", handleForward);

    return () => {
      window.removeEventListener("back", handleBack);
      window.removeEventListener("forward", handleForward);
    };
  }, [pop, navigate, navigationStack]);

  const currentRoute = navigationStack[navigationStack.length - 1];

  return (
    <Context.Provider value={{ navigationStack, navigate, pop, currentRoute }}>
      {children}
    </Context.Provider>
  );
};

export const useRouter = () => {
  const context = React.useContext(Context);
  if (!context) {
    throw new Error("useAppState must be used within a Provider");
  }
  return context;
};
