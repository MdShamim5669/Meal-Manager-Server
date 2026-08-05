import { Response, NextFunction } from "express";
import { MemberService } from "./member.service";
import { memberValidation } from "./member.validation";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";

export class MemberController {
  static async getAllMembers(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const members = await MemberService.getAllMembers();
      res.json(members);
    } catch (error) {
      next(error);
    }
  }

  static async createMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const parsed = memberValidation.createMemberSchema.parse(req.body);
      const result = await MemberService.createMember(parsed);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsed = memberValidation.updateMemberSchema.parse(req.body);
      const result = await MemberService.updateMember(id, parsed);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
