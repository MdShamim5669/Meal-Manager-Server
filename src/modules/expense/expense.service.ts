import { prisma } from "../../config/db";
import { CreateExpenseInput, UpdateExpenseInput } from "./expense.interface";
import { NotFoundError } from "../../errors/NotFoundError";
import { BadRequestError } from "../../errors/BadRequestError";

export class ExpenseService {
  static async getExpensesByPeriod(periodId?: string) {
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

    return prisma.expense.findMany({
      where: { periodId: targetPeriodId },
      include: {
        member: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: "desc" },
    });
  }

  static async createExpense(input: CreateExpenseInput) {
    const period = await prisma.period.findUnique({
      where: { id: input.periodId },
    });

    if (!period) {
      throw new NotFoundError("Period not found");
    }

    if (period.status === "CLOSED") {
      throw new BadRequestError("Cannot add expenses to a closed period");
    }

    return prisma.expense.create({
      data: {
        date: new Date(input.date),
        category: input.category,
        amount: input.amount,
        paidBy: input.paidBy,
        description: input.description,
        receiptPhoto: input.receiptPhoto,
        periodId: input.periodId,
      },
      include: {
        member: { select: { id: true, name: true } },
      },
    });
  }

  static async updateExpense(id: string, input: UpdateExpenseInput) {
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Expense record not found");
    }

    return prisma.expense.update({
      where: { id },
      data: {
        ...(input.date && { date: new Date(input.date) }),
        ...(input.category && { category: input.category }),
        ...(input.amount !== undefined && { amount: input.amount }),
        ...(input.paidBy && { paidBy: input.paidBy }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.receiptPhoto !== undefined && { receiptPhoto: input.receiptPhoto }),
        ...(input.periodId && { periodId: input.periodId }),
      },
      include: {
        member: { select: { id: true, name: true } },
      },
    });
  }

  static async deleteExpense(id: string) {
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Expense record not found");
    }

    return prisma.expense.delete({ where: { id } });
  }
}
