import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../errors/AppError";
import { handleZodError } from "../errors/handleZodError";
import { handlePrismaError } from "../errors/handlePrismaError";
import { IErrorSource } from "../errors/error.interface";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  let statusCode = 500;
  let message = "Something went wrong!";
  let errorSources: IErrorSource[] = [
    {
      path: "",
      message: "Internal server error",
    },
  ];

  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const simplifiedError = handlePrismaError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [
      {
        path: "",
        message: err.message,
      },
    ];
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: "",
        message: err.message,
      },
    ];
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
  });
}
