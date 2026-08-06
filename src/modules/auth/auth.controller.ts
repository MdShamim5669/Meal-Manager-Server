import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { catchAsync, sendResponse } from "../../shared";

export class AuthController {
  static setup = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.setup(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Initial Manager setup completed successfully",
      data: result,
    });
  });

  static login = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Logged in successfully",
      data: result,
    });
  });

  static getMe = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const result = await AuthService.getMe(req.user!.memberId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User profile fetched successfully",
      data: result,
    });
  });

  static changePin = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const result = await AuthService.changePin(req.user!.memberId, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
      data: null,
    });
  });

  static forgotPin = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.forgotPin(req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
      data: {
        resetToken: result.resetToken,
        expiresAt: result.expiresAt,
      },
    });
  });

  static resetPin = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.resetPin(req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
      data: null,
    });
  });

  static adminResetPin = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.adminResetPin(req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
      data: null,
    });
  });

  static getPublicMembers = catchAsync(async (_req: Request, res: Response) => {
    const result = await AuthService.getPublicMembers();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Public members list fetched successfully",
      data: result,
    });
  });
}

