import { prisma } from "../../config/db";
import { IExpenseCreate, IExpenseUpdate, IExpense, IExpenseFilterRequest } from "./expense.interface";
import { NotFoundError } from "../../errors/NotFoundError";
import { BadRequestError } from "../../errors/BadRequestError";

const getExpensesByPeriod = async (filters?: IExpenseFilterRequest): Promise<IExpense[]> => {
  let targetPeriodId = filters?.periodId;

  if (!targetPeriodId) {
    const activePeriod = await prisma.period.findFirst({
      where: { status: "ACTIVE" },
    });
    if (!activePeriod) {
      throw new NotFoundError("No active period found");
    }
    targetPeriodId = activePeriod.id;
  }

  return prisma.expense.findMany({
    where: {
      periodId: targetPeriodId,
      ...(filters?.category && { category: filters.category }),
      ...(filters?.paidBy && { paidBy: filters.paidBy }),
      ...(filters?.searchTerm && {
        description: { contains: filters.searchTerm, mode: "insensitive" },
      }),
    },
    include: {
      member: {
        select: { id: true, name: true },
      },
    },
    orderBy: { date: "desc" },
  });
};

const createExpense = async (payload: IExpenseCreate): Promise<IExpense> => {
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
    throw new BadRequestError("Cannot add expenses to a closed period");
  }

  let paidByMemberId = payload.paidBy;
  if (!paidByMemberId) {
    const firstMember = await prisma.member.findFirst({ where: { active: true } });
    if (!firstMember) throw new NotFoundError("No active member found to attribute expense");
    paidByMemberId = firstMember.id;
  }

  const expenseDate = payload.date ? new Date(payload.date) : new Date();
  if (isNaN(expenseDate.getTime())) {
    throw new BadRequestError("Invalid date format provided");
  }

  return prisma.expense.create({
    data: {
      date: expenseDate,
      category: payload.category,
      amount: payload.amount,
      paidBy: paidByMemberId,
      description: payload.description,
      receiptPhoto: payload.receiptPhoto,
      periodId: targetPeriodId,
    },
    include: {
      member: { select: { id: true, name: true } },
    },
  });
};

const updateExpense = async (id: string, payload: IExpenseUpdate): Promise<IExpense> => {
  const existing = await prisma.expense.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError("Expense record not found");
  }

  let updatedDate: Date | undefined;
  if (payload.date) {
    updatedDate = new Date(payload.date);
    if (isNaN(updatedDate.getTime())) {
      throw new BadRequestError("Invalid date format provided");
    }
  }

  return prisma.expense.update({
    where: { id },
    data: {
      ...(updatedDate && { date: updatedDate }),
      ...(payload.category && { category: payload.category }),
      ...(payload.amount !== undefined && { amount: payload.amount }),
      ...(payload.paidBy && { paidBy: payload.paidBy }),
      ...(payload.description !== undefined && { description: payload.description }),
      ...(payload.receiptPhoto !== undefined && { receiptPhoto: payload.receiptPhoto }),
      ...(payload.periodId && { periodId: payload.periodId }),
    },
    include: {
      member: { select: { id: true, name: true } },
    },
  });
};

const deleteExpense = async (id: string): Promise<void> => {
  const existing = await prisma.expense.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError("Expense record not found");
  }

  await prisma.expense.delete({ where: { id } });
};

export const ExpenseService = {
  getExpensesByPeriod,
  createExpense,
  updateExpense,
  deleteExpense,
};
