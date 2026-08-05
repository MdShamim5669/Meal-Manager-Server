import { Role } from "@prisma/client";

export type IMemberFilterRequest = {
  searchTerm?: string | undefined;
  name?: string | undefined;
  role?: Role | undefined;
  active?: boolean | undefined;
};

export type IMemberCreate = {
  name: string;
  pin: string;
  role?: Role | undefined;
};

export type IMemberUpdate = {
  name?: string | undefined;
  role?: Role | undefined;
  active?: boolean | undefined;
};

export type IMember = {
  id: string;
  name: string;
  role: Role;
  active: boolean;
  joinedDate: Date;
};
