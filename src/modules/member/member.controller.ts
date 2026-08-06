import { Response } from "express";
import { MemberService } from "./member.service";
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
    const result = await MemberService.createMember(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Member created successfully",
      data: result,
    });
  });

  static updateMember = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const result = await MemberService.updateMember(id, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Member updated successfully",
      data: result,
    });
  });

  static searchMember = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { identifier } = req.body;
    const result = await MemberService.searchByIdentifier(identifier);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.exists ? "Member found" : "Member not found",
      data: result,
    });
  });

  static createPlaceholder = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const result = await MemberService.createPlaceholderMember(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Placeholder member created successfully",
      data: result,
    });
  });
}
