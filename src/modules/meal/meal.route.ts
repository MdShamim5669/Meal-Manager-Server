import { Router } from "express";
import { MealController } from "./meal.controller";
import { mealValidation } from "./meal.validation";
import validateRequest from "../../middlewares/validateRequest";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, MealController.getMeals);
router.put(
  "/:memberId/:date",
  authenticate,
  validateRequest(mealValidation.upsertMealSchema),
  MealController.upsertMeal
);

export default router;
