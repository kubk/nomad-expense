export type UserLike = {
  name: string | null;
  username: string | null;
  avatarUrl?: string | null;
};

export function getUserDisplayName(user: UserLike): string {
  if (user.name) {
    return user.name;
  }
  return user.username || "Unknown User";
}

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
