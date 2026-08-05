import { Response } from "express";
import { ExpenseService } from "./expense.service";
import { expenseValidation } from "./expense.validation";
import { expenseFilterableFields } from "./expense.constant";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { catchAsync, sendResponse, pick } from "../../shared";

export class ExpenseController {
  static getExpenses = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const filters = pick(req.query, expenseFilterableFields as any);

    const expenses = await ExpenseService.getExpensesByPeriod(filters as any);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Expenses fetched successfully",
      data: expenses,
    });
  });

  static createExpense = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const parsed = expenseValidation.createExpenseSchema.parse(req.body);
    const result = await ExpenseService.createExpense(parsed);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Expense record created successfully",
      data: result,
    });
  });

  static updateExpense = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const parsed = expenseValidation.updateExpenseSchema.parse(req.body);
    const result = await ExpenseService.updateExpense(id, parsed);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Expense record updated successfully",
      data: result,
    });
  });

  static deleteExpense = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    await ExpenseService.deleteExpense(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Expense record deleted successfully",
      data: null,
    });
  });
}
