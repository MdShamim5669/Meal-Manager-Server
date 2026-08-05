import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";
import { ForbiddenError } from "../errors/ForbiddenError";

export function requireManager(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "MANAGER") {
    throw new ForbiddenError("Manager access required for this resource");
  }
  next();
}
