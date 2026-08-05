import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import httpStatus from "http-status";
import { env } from "./config/env";
import router from "./routes";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import { CronService } from "./cron/cron.service";

const app: Application = express();

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(cookieParser());

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize scheduled Cron Jobs
CronService.initCrons();

// Root Route
app.get("/", (_req: Request, res: Response) => {
  res.send({
    message: "Meal Manager Backend API Server is running..",
  });
});

// API Routes
app.use("/api/v1", router);

// Global Error Handler
app.use(globalErrorHandler);

// 404 Not Found Handler
app.use((req: Request, res: Response, _next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;
