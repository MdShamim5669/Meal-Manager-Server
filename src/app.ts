import express from "express";
import cors from "cors";
import { env } from "./config/env";
import router from "./routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Meal Manager API is healthy" });
});

// Centralized Application Routes
app.use("/api", router);

// Centralized Error Handler Middleware
app.use(errorMiddleware);

export default app;
