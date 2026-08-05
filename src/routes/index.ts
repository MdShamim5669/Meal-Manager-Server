import { Router } from "express";

import authRoutes from "../modules/auth/auth.route";
import memberRoutes from "../modules/member/member.route";
import mealRoutes from "../modules/meal/meal.route";
import expenseRoutes from "../modules/expense/expense.route";
import depositRoutes from "../modules/deposit/deposit.route";
import rosterRoutes from "../modules/roster/roster.route";
import periodRoutes from "../modules/period/period.route";

const router = Router();

const moduleRoutes: { path: string; route: Router }[] = [
  { path: "/auth", route: authRoutes },
  { path: "/members", route: memberRoutes },
  { path: "/meals", route: mealRoutes },
  { path: "/expenses", route: expenseRoutes },
  { path: "/deposits", route: depositRoutes },
  { path: "/roster", route: rosterRoutes },
  { path: "/period", route: periodRoutes },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
