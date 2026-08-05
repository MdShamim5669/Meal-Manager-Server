import { prisma } from "../../config/db";
import { IMemberCreate, IMemberUpdate, IMember, IMemberFilterRequest } from "./member.interface";
import { hashPin } from "../../utils/hash.util";
import { NotFoundError } from "../../errors/NotFoundError";

export class MemberService {
  static async getAllMembers(filters?: IMemberFilterRequest): Promise<IMember[]> {
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
        role: true,
        active: true,
        joinedDate: true,
      },
      orderBy: { joinedDate: "asc" },
    });
  }

  static async createMember(payload: IMemberCreate): Promise<IMember> {
    const pinHash = await hashPin(payload.pin);

    return prisma.member.create({
      data: {
        name: payload.name,
        pinHash,
        role: payload.role,
        active: true,
      },
      select: {
        id: true,
        name: true,
        role: true,
        active: true,
        joinedDate: true,
      },
    });
  }

  static async updateMember(id: string, payload: IMemberUpdate): Promise<IMember> {
    const existing = await prisma.member.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Member not found");
    }

    return prisma.member.update({
      where: { id },
      data: payload,
      select: {
        id: true,
        name: true,
        role: true,
        active: true,
        joinedDate: true,
      },
    });
  }
}
