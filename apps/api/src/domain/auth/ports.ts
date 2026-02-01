export type AuthUserRecord = {
  id: string;
  email: string | null;
  password: string;
};

export type UserAuthRepository = {
  findByEmail(email: string): Promise<AuthUserRecord | null>;
};
