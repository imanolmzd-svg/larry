export type AuthUser = {
  id: string;
  email: string | null;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type JWTPayload = {
  userId: string;
  email: string | null;
};
