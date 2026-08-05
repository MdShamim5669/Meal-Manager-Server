import { Role } from "@prisma/client";

export type IAuthSetup = {
  name: string;
  pin: string;
  periodLabel?: string | undefined;
};

export type IAuthLogin = {
  memberId: string;
  pin: string;
};

export type IAuthResponse = {
  token: string;
  member: {
    id: string;
    name: string;
    role: Role;
  };
};

export type ICurrentMember = {
  id: string;
  name: string;
  role: Role;
  active: boolean;
  joinedDate: Date;
};
