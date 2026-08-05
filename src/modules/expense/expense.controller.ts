import { Response, NextFunction } from "express";
import { ExpenseService } from "./expense.service";
import { createExpenseSchema, updateExpenseSchema } from "./expense.interface";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";

export class ExpenseController {
  static async getExpenses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const periodId = req.query.periodId as string | undefined;
      const expenses = await ExpenseService.getExpensesByPeriod(periodId);
      res.json(expenses);
    } catch (error) {
      next(error);
    }
  }

  static async createExpense(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const parsed = createExpenseSchema.parse(req.body);
      const result = await ExpenseService.createExpense(parsed);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateExpense(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsed = updateExpenseSchema.parse(req.body);
      const result = await ExpenseService.updateExpense(id, parsed);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteExpense(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await ExpenseService.deleteExpense(id);
      res.json({ message: "Expense record deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}
