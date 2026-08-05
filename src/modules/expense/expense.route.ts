import { Router } from "express";
import { ExpenseController } from "./expense.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireManager } from "../../middlewares/role.middleware";

const router = Router();

router.get("/", authenticate, ExpenseController.getExpenses);
router.post("/", authenticate, requireManager, ExpenseController.createExpense);
router.patch("/:id", authenticate, requireManager, ExpenseController.updateExpense);
router.delete("/:id", authenticate, requireManager, ExpenseController.deleteExpense);

export default router;
