export interface TokenPayload {
  sub: number; // user ID
  email: string;
  userType: string;
  iat?: number;
  exp?: number;
}
