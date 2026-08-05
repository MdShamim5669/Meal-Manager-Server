import { AppError } from "./AppError";

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden access") {
    super(403, message);
  }
}
