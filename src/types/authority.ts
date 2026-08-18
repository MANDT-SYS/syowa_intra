export type UserAuthorityLevel =
  | "DEVELOPER"
  | "AUTHORIZED_USER"
  | "GENERAL";

export type AssignableAuthorityLevel = "AUTHORIZED_USER" | "GENERAL";

export type AuthorityUserListItem = {
  /** 外部 UserInfo.userId。負数を含む safe integer を取り得る。 */
  userId: number;
  userName: string;
  divisionName: string | null;
  authorityLevel: UserAuthorityLevel;
};
