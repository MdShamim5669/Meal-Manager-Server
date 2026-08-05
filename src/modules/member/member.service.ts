import { prisma } from "../../config/db";
import { ICreateMemberPayload, IUpdateMemberPayload, IMemberResponsePayload } from "./member.interface";
import { hashPin } from "../../utils/hash.util";
import { NotFoundError } from "../../errors/NotFoundError";

export class MemberService {
  static async getAllMembers(): Promise<IMemberResponsePayload[]> {
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

  static async createMember(payload: ICreateMemberPayload): Promise<IMemberResponsePayload> {
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

  static async updateMember(id: string, payload: IUpdateMemberPayload): Promise<IMemberResponsePayload> {
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
