import { prisma } from "../../config/db";
import { ICreateDutyPayload, IUpdateDutyPayload, IDutyRosterResponsePayload } from "./roster.interface";
import { NotFoundError } from "../../errors/NotFoundError";
import { BadRequestError } from "../../errors/BadRequestError";
import { sendDutyAssignmentEmail } from "../../utils/email.util";

const getRosterByPeriod = async (periodId?: string): Promise<IDutyRosterResponsePayload[]> => {
  let targetPeriodId = periodId;

  if (!targetPeriodId) {
    const activePeriod = await prisma.period.findFirst({
      where: { status: "ACTIVE" },
    });
    if (!activePeriod) {
      throw new NotFoundError("No active period found");
    }
    targetPeriodId = activePeriod.id;
  }

  return prisma.dutyRoster.findMany({
    where: { periodId: targetPeriodId },
    include: {
      member: { select: { id: true, name: true } },
    },
    orderBy: { date: "asc" },
  });
};

const createDuty = async (payload: ICreateDutyPayload): Promise<IDutyRosterResponsePayload> => {
  let targetPeriodId = payload.periodId;
  if (!targetPeriodId) {
    const activePeriod = await prisma.period.findFirst({
      where: { status: "ACTIVE" },
    });
    if (!activePeriod) {
      throw new NotFoundError("No active period found");
    }
    targetPeriodId = activePeriod.id;
  }

  const period = await prisma.period.findUnique({
    where: { id: targetPeriodId },
  });

  if (!period) {
    throw new NotFoundError("Period not found");
  }

  if (period.status === "CLOSED") {
    throw new BadRequestError("Cannot add duty roster entries to a closed period");
  }

  const dutyDate = payload.date ? new Date(payload.date) : new Date();
  if (isNaN(dutyDate.getTime())) {
    throw new BadRequestError("Invalid date format provided");
  }

  const created = await prisma.dutyRoster.create({
    data: {
      memberId: payload.memberId,
      date: dutyDate,
      periodId: targetPeriodId,
      status: "SCHEDULED",
    },
    include: {
      member: { select: { id: true, name: true } },
    },
  });

  // Fire-and-forget duty assignment email notification
  prisma.member.findUnique({
    where: { id: payload.memberId },
    select: { email: true, name: true },
  }).then((memberInfo) => {
    if (memberInfo?.email) {
      sendDutyAssignmentEmail({
        toEmail: memberInfo.email,
        toName: memberInfo.name,
        date: dutyDate.toISOString().split("T")[0],
        messName: process.env.MESS_NAME || "Mess Group",
      }).catch((err) => {
        console.error("[MAIL] Failed to send duty email:", err.message);
      });
    } else {
      console.log(`[MAIL] Member ${payload.memberId} has no email — skipping duty notification.`);
    }
  }).catch(console.error);

  return created;
};

const updateDuty = async (
  id: string,
  payload: IUpdateDutyPayload
): Promise<IDutyRosterResponsePayload> => {
  const existing = await prisma.dutyRoster.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError("Duty roster entry not found");
  }

  return prisma.dutyRoster.update({
    where: { id },
    data: {
      ...(payload.status && { status: payload.status }),
      ...(payload.memberId && { memberId: payload.memberId }),
    },
    include: {
      member: { select: { id: true, name: true } },
    },
  });
};

export const RosterService = {
  getRosterByPeriod,
  createDuty,
  updateDuty,
};
