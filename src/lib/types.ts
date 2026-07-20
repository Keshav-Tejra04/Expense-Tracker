export type UserRole = 'admin' | 'member';

export interface User {
  uid: string;
  email: string;
  name: string;
  familyId: string | null;
  role: UserRole;
  createdAt: number;
}

export interface Family {
  id: string;
  name: string;
  code: string;
  members: string[]; // array of user names or UIDs
  currency: string;
  createdAt: number;
  createdBy: string;
  initialBalance?: number;
}
