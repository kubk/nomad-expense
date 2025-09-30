import { type UserLike, getUserDisplayName } from "api";

export { type UserLike, getUserDisplayName };

export function getUserInitials(user: UserLike): string {
  if (user.name) {
    const names = user.name.trim().split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  }
  if (user.username) {
    return user.username[0].toUpperCase();
  }
  return "?";
}

export function getUserDisplayNameWithUsername(user: UserLike): string {
  const displayName = getUserDisplayName(user);
  if (displayName === "Unknown User" && user.username) {
    return `@${user.username}`;
  }
  return displayName;
}
