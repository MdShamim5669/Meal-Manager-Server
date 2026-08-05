import { NextFunction, Response } from "express";
import { Role } from "@prisma/client";
import { AuthenticatedRequest } from "./auth.middleware";
import { ForbiddenError } from "../errors/ForbiddenError";
import { UnauthorizedError } from "../errors/UnauthorizedError";

export function authorizeRoles(...roles: Role[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("You are not authenticated");
      }

      if (!roles.includes(req.user.role)) {
        throw new ForbiddenError(
          `Access denied. Requires one of the following roles: [${roles.join(", ")}]`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export const auth = authorizeRoles;
export const requireManager = authorizeRoles("MANAGER", "SUPER_ADMIN");
export const requireSuperAdmin = authorizeRoles("SUPER_ADMIN");
export const requireMember = authorizeRoles("MEMBER");

export default authorizeRoles;
