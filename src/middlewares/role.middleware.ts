import { NextFunction, Response } from "express";
import { Role } from "@prisma/client";
import { AuthenticatedRequest } from "./auth.middleware";
import { ForbiddenError } from "../errors/ForbiddenError";

export function authorizeRoles(...roles: Role[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Access denied. Requires one of the following roles: [${roles.join(", ")}]`
      );
    }
    next();
  };
}

export const requireManager = authorizeRoles("MANAGER", "SUPER_ADMIN");
export const requireSuperAdmin = authorizeRoles("SUPER_ADMIN");
export const requireMember = authorizeRoles("MEMBER");
