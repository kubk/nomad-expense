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
