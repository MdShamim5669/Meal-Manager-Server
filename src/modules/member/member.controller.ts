import { Response } from "express";
import { MemberService } from "./member.service";
import { memberValidation } from "./member.validation";
import { memberFilterableFields } from "./member.constant";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { catchAsync, sendResponse, pick } from "../../shared";

export class MemberController {
  static getAllMembers = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const filters = pick(req.query, memberFilterableFields as any);

    const members = await MemberService.getAllMembers(filters as any);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Members fetched successfully",
      data: members,
    });
  });

  static createMember = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const parsed = memberValidation.createMemberSchema.parse(req.body);
    const result = await MemberService.createMember(parsed);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Member created successfully",
      data: result,
    });
  });

  static updateMember = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const parsed = memberValidation.updateMemberSchema.parse(req.body);
    const result = await MemberService.updateMember(id, parsed);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Member updated successfully",
      data: result,
    });
  });
}
