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
      ...(role ? { role } : { role: { not: "SUPER_ADMIN" } }),
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

const searchByIdentifier = async (identifier: string): Promise<{ exists: boolean; member: IMember | null }> => {
  const query = identifier.trim();
  if (!query) return { exists: false, member: null };

  const member = await prisma.member.findFirst({
    where: {
      OR: [
        { phone: query },
        { email: query.toLowerCase() },
        { id: query }
      ]
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      active: true,
      joinedDate: true,
    }
  });

  return {
    exists: !!member,
    member: member || null
  };
};

const createPlaceholderMember = async (payload: { name: string; phone?: string; email?: string; role?: any; pin?: string }): Promise<IMember> => {
  const initialPin = payload.pin || "1234";
  const pinHash = await hashPin(initialPin);

  const result = await prisma.member.create({
    data: {
      name: payload.name,
      email: payload.email ? payload.email.toLowerCase() : null,
      phone: payload.phone || null,
      pinHash,
      role: payload.role || "MEMBER",
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

export const MemberService = {
  getAllMembers,
  createMember,
  updateMember,
  searchByIdentifier,
  createPlaceholderMember,
};
