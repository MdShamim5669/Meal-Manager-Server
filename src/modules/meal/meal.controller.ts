import { Response } from "express";
import { MealService } from "./meal.service";
import { mealValidation } from "./meal.validation";
import { mealFilterableFields } from "./meal.constant";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { ForbiddenError } from "../../errors/ForbiddenError";
import { catchAsync, sendResponse, pick } from "../../shared";

export class MealController {
  static getMeals = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const filters = pick(req.query, mealFilterableFields as any);

    const meals = await MealService.getMealsByPeriod(filters as any);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Meal entries fetched successfully",
      data: meals,
    });
  });

  static upsertMeal = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { memberId, date } = req.params;

    if (req.user!.role !== "MANAGER" && req.user!.memberId !== memberId) {
      throw new ForbiddenError("You can only update your own daily meals");
    }

    const parsed = mealValidation.upsertMealSchema.parse(req.body);
    const result = await MealService.upsertMeal(memberId, date, parsed);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Meal entry saved successfully",
      data: result,
    });
  });
}
