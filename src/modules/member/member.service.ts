import { prisma } from "../../config/db";
import { CreateMemberInput, UpdateMemberInput } from "./member.interface";
import { hashPin } from "../../utils/hash.util";
import { NotFoundError } from "../../errors/NotFoundError";

export class MemberService {
  static async getAllMembers() {
    return prisma.member.findMany({
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

  static async createMember(input: CreateMemberInput) {
    const pinHash = await hashPin(input.pin);

    return prisma.member.create({
      data: {
        name: input.name,
        pinHash,
        role: input.role,
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

  static async updateMember(id: string, input: UpdateMemberInput) {
    const existing = await prisma.member.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Member not found");
    }

    return prisma.member.update({
      where: { id },
      data: input,
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
