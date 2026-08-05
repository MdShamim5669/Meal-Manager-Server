import { Prisma } from "@prisma/client";
import { IErrorSource, IGenericErrorResponse } from "./error.interface";

export function handlePrismaError(
  err: Prisma.PrismaClientKnownRequestError
): IGenericErrorResponse {
  let statusCode = 400;
  let message = "Database Error";
  const errorSources: IErrorSource[] = [];

  if (err.code === "P2002") {
    statusCode = 400;
    message = "Duplicate Key Constraint Violation";
    const target = (err.meta?.target as string[]) || [];
    errorSources.push({
      path: target.join(", "),
      message: `A record with this ${target.join(", ")} already exists.`,
    });
  } else if (err.code === "P2025") {
    statusCode = 404;
    message = "Record Not Found";
    errorSources.push({
      path: "",
      message: (err.meta?.cause as string) || "Requested record was not found.",
    });
  } else {
    errorSources.push({
      path: "",
      message: err.message,
    });
  }

  return {
    statusCode,
    message,
    errorSources,
  };
}
