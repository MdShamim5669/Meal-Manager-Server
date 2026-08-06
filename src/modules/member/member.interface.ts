import { Role } from "@prisma/client";

export type IMemberFilterRequest = {
  searchTerm?: string | undefined;
  name?: string | undefined;
  role?: Role | undefined;
  active?: boolean | undefined;
};

export type IMemberCreate = {
  name: string;
  email?: string | undefined;
  phone?: string | undefined;
  pin: string;
  role?: Role | undefined;
};

export type IMemberUpdate = {
  name?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  role?: Role | undefined;
  active?: boolean | undefined;
};

export type IMember = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: Role;
  active: boolean;
  joinedDate: Date;
};
