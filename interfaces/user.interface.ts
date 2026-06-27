export interface User {
  id: string;
  email: string;
  createdAt?: string; // Optional for light client-side profiles
  updatedAt?: string;
}
