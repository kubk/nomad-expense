import { routeToUrl } from "../../shared/stacked-router/url-convert";

export const generateInviteUrl = (code: string): string => {
  return `${window.location.origin}${routeToUrl({
    type: "invite",
    code,
  })}`;
};
