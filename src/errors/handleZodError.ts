import { ZodError } from "zod";
import { IErrorSource, IGenericErrorResponse } from "./error.interface";

export function handleZodError(err: ZodError): IGenericErrorResponse {
  const errorSources: IErrorSource[] = err.issues.map((issue) => {
    return {
      path: issue.path[issue.path.length - 1],
      message: issue.message,
    };
  });

  return {
    statusCode: 400,
    message: "Validation Error",
    errorSources,
  };
}
