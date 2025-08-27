import { render } from "typesafe-routes";
import { routes } from "./routes";

export const generateInviteUrl = (code: string): string => {
  return `${window.location.origin}${render(routes.invite, {
    path: {},
    query: { code },
  })}`;
};
