import qs from "qs";
import { type Route, routeSchema } from "./routes";
import * as v from "valibot";

export function routeToUrl(route: Route): string {
  if (route.type === "main") {
    return "/";
  }

  const routeParams = qs.stringify(route, { encode: false });
  return `/?${routeParams}`;
}

export function urlToRoute(url: string): Route | null {
  const urlObj = new URL(url, window.location.origin);

  if (urlObj.pathname === "/" && !urlObj.searchParams.get("type")) {
    return { type: "main" };
  }

  const params = qs.parse(urlObj.search, { ignoreQueryPrefix: true });

  const result = v.safeParse(routeSchema, params);
  return result.success ? result.output : null;
}
