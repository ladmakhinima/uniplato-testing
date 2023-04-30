import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { BaseController } from "../config/controller.config";
import { config } from "../config";
import { UserMessage } from "./user.message";
import { StatusCode } from "../config/statusCode.config";

export class UserController extends BaseController {
  // Login Action For User Route
  login = async (request: Request, response: Response) => {
    const { email, password } = request.body;
    const user = await this.repo.user.findUnique({
      where: { email },
    });
    // If User With This Email Not Exist
    if (!user) {
      return response.status(StatusCode.BAD_REQUEST).json({
        message: UserMessage.invalidEmailOrPassword,
      });
    }
    const isMatchPassword = await bcrypt.compare(
      password,
      user.password
    );
    // If User Exist But Dosn't Match Password
    if (!isMatchPassword) {
      return response.status(StatusCode.BAD_REQUEST).json({
        message: UserMessage.invalidEmailOrPassword,
      });
    }

    // Generate Token That Contains Role And Id
    const token = jwt.sign(
      { id: user.id, role: user.role },
      config.SECRET_KEY,
      { expiresIn: config.TOKEN_EXP }
    );

    return response.status(StatusCode.OK).json({ token });
  };

  // Signup Action
  signup = async (request: Request, response: Response) => {
    const { email, password, bio, role } = request.body;
    // If The User With This Email Exist Throw Error
    const isExistUser = await this.repo.user.findUnique({
      where: { email },
    });
    if (isExistUser) {
      return response
        .status(StatusCode.BAD_REQUEST)
        .json({ message: UserMessage.emailTaken });
    }
    // Hashing Password For Security Reason
    const hashPassword = await bcrypt.hash(password, 8);
    // Insert User In Database
    const user = await this.repo.user.create({
      data: { email, password: hashPassword, bio, role },
    });
    // Generate Token That Contains Role And ID
    const token = jwt.sign(
      { id: user.id, role: user.role },
      config.SECRET_KEY,
      { expiresIn: config.TOKEN_EXP }
    );
    return response.status(StatusCode.CREATE).json({ token });
  };

  // Get User Profile Information
  profile = async (request: Request, response: Response) => {
    // Get User Information Based On Authorized Request That Contains User Data Like ID and Role
    const user = await this.repo.user.findUnique({
      where: { id: +request?.user?.id! },
    });
    // If No One Exist With This ID Throw Error
    if (!user) {
      return response
        .status(StatusCode.NOT_FOUND)
        .json({ message: UserMessage.notFound });
    }
    return response.status(StatusCode.OK).json({ user });
  };
}
