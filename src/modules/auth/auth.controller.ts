import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { setupSchema, loginSchema } from "./auth.interface";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";

export class AuthController {
  static async setup(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = setupSchema.parse(req.body);
      const result = await AuthService.setup(parsed);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = loginSchema.parse(req.body);
      const result = await AuthService.login(parsed);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.getMe(req.user!.memberId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
