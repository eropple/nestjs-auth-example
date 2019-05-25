export interface LoginRequest {
  username: string;
  password: string;
  scopes: Array<string>;
}
