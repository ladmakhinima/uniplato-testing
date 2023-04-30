import { UserRole } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { StatusCode } from "../config/statusCode.config";
import { IRequestUser } from "../custom";
import { UserMessage } from "./user.message";

// Middleware That Interact Directly With User
export class UserMiddleware {
  // Check Authentication - Check Based On Token That Set On Header
  auth(request: Request, response: Response, next: NextFunction) {
    const token = request.get("authorization")?.split("Bearer ")[1];
    if (!token) {
      return response
        .status(StatusCode.UN_AUTH)
        .json({ message: UserMessage.unauth });
    }
    const decodedToken = jwt.decode(token) as JwtPayload &
      IRequestUser;
    if (decodedToken.exp! * 1000 < Date.now()) {
      return response
        .status(StatusCode.UN_AUTH)
        .json({ message: UserMessage.unauth });
    }
    request.user = { id: decodedToken.id, role: decodedToken.role };
    return next();
  }

  // Check User Role For Protected Route Based On User Information On The Request
  checkRole(
    type: UserRole | UserRole[],
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    // User Role Come From Decoded Token
    const userRole = request?.user?.role!;

    // Route Can Contains Multiple Role Or Single Role For Multiple Role Get Array For Single Role Get String
    const arrayCheckingRole =
      Array.isArray(type) && (type as UserRole[]).includes(userRole);
    const stringCheckingRole =
      typeof type === "string" && userRole === type;
    if (!arrayCheckingRole && !stringCheckingRole) {
      return response
        .status(StatusCode.FORBIDDEN)
        .json({ message: UserMessage.permissionDenined });
    }
    return next();
  }
}
