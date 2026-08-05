import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { authValidation } from "./auth.validation";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { catchAsync, sendResponse } from "../../shared";

export class AuthController {
  static setup = catchAsync(async (req: Request, res: Response) => {
    const parsed = authValidation.setupSchema.parse(req.body);
    const result = await AuthService.setup(parsed);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Initial Manager setup completed successfully",
      data: result,
    });
  });

  static login = catchAsync(async (req: Request, res: Response) => {
    const parsed = authValidation.loginSchema.parse(req.body);
    const result = await AuthService.login(parsed);

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
}
