import { Router } from "express";
import { MealController } from "./meal.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, MealController.getMeals);
router.put("/:memberId/:date", authenticate, MealController.upsertMeal);

export default router;
