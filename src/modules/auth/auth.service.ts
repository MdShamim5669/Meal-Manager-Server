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
  const memberCount = await prisma.member.count();
  if (memberCount > 0) {
    throw new BadRequestError("System setup already completed. Manager already exists.");
  }

  return prisma.$transaction(async (tx) => {
    const hashedPin = await hashPin(payload.pin);

    const manager = await tx.member.create({
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
  });
};

const login = async (payload: IAuthLogin): Promise<IAuthResponse> => {
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
};

const getMe = async (memberId: string): Promise<ICurrentMember> => {
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
};

const changePin = async (memberId: string, payload: IChangePin) => {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
  });

  if (!member || !member.active) {
    throw new NotFoundError("Member not found or inactive");
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

export const AuthService = {
  setup,
  login,
  getMe,
  changePin,
  forgotPin,
  resetPin,
  adminResetPin,
};
