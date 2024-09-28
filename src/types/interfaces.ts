export interface AuthUser {
  id: number;
  email: string;
  role: string;
}

export interface JWTPayload {
  id: number;
  email: string;
}

export interface Mail<T = any> {
  to: string;
  subject: string;
  template: string;
  context: T;
  attachments?: Array<any>;
}