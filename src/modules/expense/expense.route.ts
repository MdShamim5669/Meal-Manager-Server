import { Router } from "express";
import { ExpenseController } from "./expense.controller";
import { expenseValidation } from "./expense.validation";
import validateRequest from "../../middlewares/validateRequest";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireManager } from "../../middlewares/role.middleware";

const router = Router();

router.get("/", authenticate, ExpenseController.getExpenses);
router.post(
  "/",
  authenticate,
  requireManager,
  validateRequest(expenseValidation.createExpenseSchema),
  ExpenseController.createExpense
);
router.patch(
  "/:id",
  authenticate,
  requireManager,
  validateRequest(expenseValidation.updateExpenseSchema),
  ExpenseController.updateExpense
);
router.delete("/:id", authenticate, requireManager, ExpenseController.deleteExpense);

export default router;
