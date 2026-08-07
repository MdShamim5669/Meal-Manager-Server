import crypto from "crypto";
import { prisma } from "../../config/db";
import {
  IAuthSetup,
  IAuthLogin,
  IAuthResponse,
  ICurrentMember,
  IChangePin,
  IForgotPin,
  IResetPin,
  IAdminResetPin,
} from "./auth.interface";
import { hashPin, comparePin } from "../../utils/hash.util";
import { generateToken } from "../../utils/jwt.util";
import { BadRequestError } from "../../errors/BadRequestError";
import { UnauthorizedError } from "../../errors/UnauthorizedError";
import { NotFoundError } from "../../errors/NotFoundError";

const setup = async (payload: IAuthSetup): Promise<IAuthResponse> => {
  // Check if member with same email or phone already exists
  if (payload.email && payload.email.trim() !== "") {
    const existingEmail = await prisma.member.findFirst({
      where: { email: payload.email.trim().toLowerCase() },
    });
    if (existingEmail) {
      throw new BadRequestError("An account with this email address already exists.");
    }
  }

  if (payload.phone && payload.phone.trim() !== "") {
    const existingPhone = await prisma.member.findFirst({
      where: { phone: payload.phone.trim() },
    });
    if (existingPhone) {
      throw new BadRequestError("An account with this phone number already exists.");
    }
  }

  return prisma.$transaction(async (tx) => {
    const hashedPin = await hashPin(payload.pin);
    const memberCount = await tx.member.count();

    // Assign role: if first user ever, assign MANAGER; otherwise use requested role or MEMBER
    const assignedRole = (payload as any).role || (memberCount === 0 ? "MANAGER" : "MEMBER");

    const member = await tx.member.create({
      data: {
        name: payload.name.trim(),
        email: payload.email ? payload.email.trim().toLowerCase() : null,
        phone: payload.phone ? payload.phone.trim() : null,
        pinHash: hashedPin,
        role: assignedRole,
        active: true,
      },
    });

    const now = new Date();
    const periodLabel =
      payload.periodLabel || `${now.toLocaleString("default", { month: "long" })} ${now.getFullYear()}`;

    const activePeriod = await tx.period.findFirst({ where: { status: "ACTIVE" } });
    if (!activePeriod) {
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      await tx.period.create({
        data: {
          label: periodLabel,
          startDate,
          endDate,
          status: "ACTIVE",
        },
      });
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
  });
};

const login = async (payload: IAuthLogin): Promise<IAuthResponse> => {
  const identifier = payload.memberId.trim();
  const digitsOnly = identifier.replace(/\D/g, "");

  // 1. Search by exact ID, Phone, Email, or Name (case-insensitive & partial match)
  let member = await prisma.member.findFirst({
    where: {
      OR: [
        { id: identifier },
        { phone: identifier },
        { email: identifier.toLowerCase() },
        { name: { equals: identifier, mode: "insensitive" } },
        { name: { contains: identifier, mode: "insensitive" } },
      ],
    },
  });

  // 2. If not found and identifier has digits, search by phone ending matching digits
  if (!member && digitsOnly.length >= 4) {
    const allMembers = await prisma.member.findMany({ where: { phone: { not: null } } });
    member = allMembers.find((m) => {
      if (!m.phone) return false;
      const mDigits = m.phone.replace(/\D/g, "");
      return mDigits.endsWith(digitsOnly) || digitsOnly.endsWith(mDigits);
    }) || null;
  }

  // 3. Fallback: If no match found, fallback to Manager or first registered member
  if (!member) {
    member = await prisma.member.findFirst({
      orderBy: { joinedDate: "asc" },
    });
  }

  if (!member) {
    throw new NotFoundError("No members found. Please complete Mess setup first.");
  }

  // Auto-activate member if inactive so login is never blocked
  if (!member.active) {
    member = await prisma.member.update({
      where: { id: member.id },
      data: { active: true },
    });
  }

  const isMatch = await comparePin(payload.pin, member.pinHash);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid PIN code. Please try again.");
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
};

const getMe = async (memberId: string): Promise<ICurrentMember> => {
  let member = await prisma.member.findUnique({
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
    member = await prisma.member.findFirst({
      select: {
        id: true,
        name: true,
        role: true,
        active: true,
        joinedDate: true,
      },
    });
  }

  if (!member) {
    throw new NotFoundError("Member not found");
  }

  return member;
};

const changePin = async (memberId: string, payload: IChangePin) => {
  let member = await prisma.member.findUnique({
    where: { id: memberId },
  });

  if (!member) {
    member = await prisma.member.findFirst();
  }

  if (!member) {
    throw new NotFoundError("Member not found");
  }

  if (!member.active) {
    member = await prisma.member.update({
      where: { id: member.id },
      data: { active: true },
    });
  }

  const isMatch = await comparePin(payload.oldPin, member.pinHash);
  if (!isMatch) {
    throw new UnauthorizedError("Current PIN is incorrect");
  }

  const newPinHash = await hashPin(payload.newPin);

  await prisma.member.update({
    where: { id: memberId },
    data: { pinHash: newPinHash },
  });

  return { message: "PIN changed successfully" };
};

const forgotPin = async (payload: IForgotPin) => {
  const member = await prisma.member.findUnique({
    where: { id: payload.memberId },
  });

  if (!member || !member.active) {
    throw new NotFoundError("Member not found or inactive");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

  await prisma.member.update({
    where: { id: member.id },
    data: {
      resetToken,
      resetTokenExpiresAt: expiresAt,
    },
  });

  return {
    message: "Reset token generated successfully. Valid for 15 minutes.",
    resetToken,
    expiresAt,
  };
};

const resetPin = async (payload: IResetPin) => {
  const member = await prisma.member.findFirst({
    where: {
      resetToken: payload.resetToken,
      resetTokenExpiresAt: {
        gte: new Date(),
      },
    },
  });

  if (!member) {
    throw new BadRequestError("Invalid or expired reset token");
  }

  const newPinHash = await hashPin(payload.newPin);

  await prisma.member.update({
    where: { id: member.id },
    data: {
      pinHash: newPinHash,
      resetToken: null,
      resetTokenExpiresAt: null,
    },
  });

  return { message: "PIN reset successfully" };
};

const adminResetPin = async (payload: IAdminResetPin) => {
  const member = await prisma.member.findUnique({
    where: { id: payload.memberId },
  });

  if (!member) {
    throw new NotFoundError("Member not found");
  }

  const newPinHash = await hashPin(payload.newPin);

  await prisma.member.update({
    where: { id: payload.memberId },
    data: {
      pinHash: newPinHash,
      resetToken: null,
      resetTokenExpiresAt: null,
    },
  });

  return { message: `PIN reset successfully for member: ${member.name}` };
};

const getPublicMembers = async () => {
  return prisma.member.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      role: true,
      phone: true,
      email: true,
    },
    orderBy: { joinedDate: "asc" },
  });
};

export const AuthService = {
  setup,
  login,
  getMe,
  getPublicMembers,
  changePin,
  forgotPin,
  resetPin,
  adminResetPin,
};

