import { Request, Response, NextFunction } from "express";
import { JwtPayload, verifyToken } from "../utils/jwt.util";
import { UnauthorizedError } from "../errors/UnauthorizedError";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function authenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Authentication token missing or invalid");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    throw new UnauthorizedError("Invalid or expired authentication token");
  }
}
