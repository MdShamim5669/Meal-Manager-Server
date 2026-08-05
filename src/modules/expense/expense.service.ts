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
  const period = await prisma.period.findUnique({
    where: { id: payload.periodId },
  });

  if (!period) {
    throw new NotFoundError("Period not found");
  }

  if (period.status === "CLOSED") {
    throw new BadRequestError("Cannot add expenses to a closed period");
  }

  return prisma.expense.create({
    data: {
      date: new Date(payload.date),
      category: payload.category,
      amount: payload.amount,
      paidBy: payload.paidBy,
      description: payload.description,
      receiptPhoto: payload.receiptPhoto,
      periodId: payload.periodId,
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

  return prisma.expense.update({
    where: { id },
    data: {
      ...(payload.date && { date: new Date(payload.date) }),
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
