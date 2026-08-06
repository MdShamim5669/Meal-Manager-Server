import { prisma } from "../../config/db";
import { IMemberCreate, IMemberUpdate, IMember, IMemberFilterRequest } from "./member.interface";
import { hashPin } from "../../utils/hash.util";
import { NotFoundError } from "../../errors/NotFoundError";
import { clearCache } from "../../utils/cache.util";

const getAllMembers = async (filters?: IMemberFilterRequest): Promise<IMember[]> => {
  const { searchTerm, role, active } = filters || {};

  return prisma.member.findMany({
    where: {
      ...(searchTerm && {
        name: { contains: searchTerm, mode: "insensitive" },
      }),
      ...(role && { role }),
      ...(active !== undefined && { active }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      active: true,
      joinedDate: true,
    },
    orderBy: { joinedDate: "asc" },
  });
};

const createMember = async (payload: IMemberCreate): Promise<IMember> => {
  const pinHash = await hashPin(payload.pin);

  const result = await prisma.member.create({
    data: {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      pinHash,
      role: payload.role,
      active: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      active: true,
      joinedDate: true,
    },
  });

  clearCache("/members");
  return result;
};

const updateMember = async (id: string, payload: IMemberUpdate): Promise<IMember> => {
  const existing = await prisma.member.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError("Member not found");
  }

  const result = await prisma.member.update({
    where: { id },
    data: payload,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      active: true,
      joinedDate: true,
    },
  });

  clearCache("/members");
  return result;
};

export const MemberService = {
  getAllMembers,
  createMember,
  updateMember,
};
