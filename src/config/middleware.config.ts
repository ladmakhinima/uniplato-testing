import { StatusCode } from "./statusCode.config";
import { NextFunction, Request, Response } from "express";
import joi from "joi";

// Class For Implementing Global Middleware That Share across The App
export class AppMiddleware {
  // Validate Request Body
  validation(
    schema: joi.Schema<any>,
    type: "body" | "param",
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    // Schema Come From Router That Specify Request Body What Specefic Option Have
    // Schema Make By JOI
    const { error } = schema.validate(
      type === "body" ? request.body : request.params,
      {
        // Check All Properties
        abortEarly: false,
      }
    );
    // If Request Body Contain At Least One Error Throw It
    if (error?.message) {
      return response.status(StatusCode.BAD_REQUEST).json({
        messages: error?.message?.split(".")?.map((e) => e.trim()),
      });
    }
    return next();
  }

  numberPipe(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    Object.keys(request.body).map((k) => {
      if (!joi.number().validate(request.body[k])?.error?.message) {
        request.body[k] = +request.body[k];
      }
    });

    next();
  }
}
