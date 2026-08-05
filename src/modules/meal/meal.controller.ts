import { Response, NextFunction } from "express";
import { MealService } from "./meal.service";
import { mealValidation } from "./meal.validation";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { ForbiddenError } from "../../errors/ForbiddenError";

export class MealController {
  static async getMeals(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const periodId = req.query.periodId as string | undefined;
      const meals = await MealService.getMealsByPeriod(periodId);
      res.json(meals);
    } catch (error) {
      next(error);
    }
  }

  static async upsertMeal(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { memberId, date } = req.params;

      if (req.user!.role !== "MANAGER" && req.user!.memberId !== memberId) {
        throw new ForbiddenError("You can only update your own daily meals");
      }

      const parsed = mealValidation.upsertMealSchema.parse(req.body);
      const result = await MealService.upsertMeal(memberId, date, parsed);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
