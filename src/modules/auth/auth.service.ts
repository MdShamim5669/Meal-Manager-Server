import { prisma } from "../../config/db";
import { IAuthSetup, IAuthLogin, IAuthResponse, ICurrentMember } from "./auth.interface";
import { hashPin, comparePin } from "../../utils/hash.util";
import { generateToken } from "../../utils/jwt.util";
import { BadRequestError } from "../../errors/BadRequestError";
import { UnauthorizedError } from "../../errors/UnauthorizedError";
import { NotFoundError } from "../../errors/NotFoundError";

export class AuthService {
  static async setup(payload: IAuthSetup): Promise<IAuthResponse> {
    const memberCount = await prisma.member.count();
    if (memberCount > 0) {
      throw new BadRequestError("System setup already completed. Manager already exists.");
    }

    const hashedPin = await hashPin(payload.pin);

    const manager = await prisma.member.create({
      data: {
        name: payload.name,
        pinHash: hashedPin,
        role: "MANAGER",
        active: true,
      },
    });

    const now = new Date();
    const periodLabel =
      payload.periodLabel || `${now.toLocaleString("default", { month: "long" })} ${now.getFullYear()}`;

    const activePeriod = await prisma.period.findFirst({ where: { status: "ACTIVE" } });
    if (!activePeriod) {
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      await prisma.period.create({
        data: {
          label: periodLabel,
          startDate,
          endDate,
          status: "ACTIVE",
        },
      });
    }

    const token = generateToken({
      memberId: manager.id,
      name: manager.name,
      role: manager.role,
    });

    return {
      token,
      member: {
        id: manager.id,
        name: manager.name,
        role: manager.role,
      },
    };
  }

  static async login(payload: IAuthLogin): Promise<IAuthResponse> {
    const member = await prisma.member.findUnique({
      where: { id: payload.memberId },
    });

    if (!member || !member.active) {
      throw new NotFoundError("Member not found or inactive");
    }

    const isMatch = await comparePin(payload.pin, member.pinHash);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid PIN");
    }

    const token = generateToken({
      memberId: member.id,
      name: member.name,
      role: member.role,
    });

    return {
      token,
      member: {
        id: member.id,
        name: member.name,
        role: member.role,
      },
    };
  }

  static async getMe(memberId: string): Promise<ICurrentMember> {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        name: true,
        role: true,
        active: true,
        joinedDate: true,
      },
    });

    if (!member) {
      throw new NotFoundError("Member not found");
    }

    return member;
  }
}
