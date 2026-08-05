import express from "express";
import cors from "cors";
import { env } from "./config/env";
// import authRoutes from "./modules/auth/auth.route";
// import memberRoutes from "./modules/member/member.route";
// import mealRoutes from "./modules/meal/meal.route";
// import expenseRoutes from "./modules/expense/expense.route";
// import depositRoutes from "./modules/deposit/deposit.route";
// import rosterRoutes from "./modules/roster/roster.route";
// import periodRoutes from "./modules/period/period.route";
// import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// app.use("/api/auth", authRoutes);
// app.use("/api/members", memberRoutes);
// app.use("/api/meals", mealRoutes);
// app.use("/api/expenses", expenseRoutes);
// app.use("/api/deposits", depositRoutes);
// app.use("/api/roster", rosterRoutes);
// app.use("/api/period", periodRoutes);

// app.use(errorMiddleware);

export default app;
