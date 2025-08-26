export type UserLike = {
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  avatarUrl?: string | null;
};

export function getUserDisplayName(user: UserLike): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.firstName) {
    return user.firstName;
  }
  return user.username || "Unknown User";
}

export function getUserInitials(user: UserLike): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  if (user.firstName) {
    return user.firstName[0].toUpperCase();
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
