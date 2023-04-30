import { Express } from "express";
import { AppMiddleware } from "../config/middleware.config";
import { UserController } from "./user.controller";
import { UserMiddleware } from "./user.middleware";
import { loginSchema, signupSchema } from "./user.validation";

export class UserRouter {
  // user middleware that contains authentication , role based middleware
  private userMiddleware: UserMiddleware;
  // user controller that serve all routes based on request
  private userController: UserController;
  // global middleware like validating request body
  private appMiddleware: AppMiddleware;

  // get instance from all dependency of this class
  constructor(private readonly app: Express) {
    this.userMiddleware = new UserMiddleware();
    this.userController = new UserController();
    this.appMiddleware = new AppMiddleware();
  }

  config() {
    // login route that has validation on email and password
    this.app.post(
      "/user/login",
      this.appMiddleware.validation.bind(null, loginSchema, "body"),
      this.userController.login
    );
    // signup route that has validation on email and password and role and bio
    this.app.post(
      "/user/signup",
      this.appMiddleware.validation.bind(null, signupSchema, "body"),
      this.userController.signup
    );
    // profile route that has authentication middleware for recognizing user and show user profile like bio - email - id
    this.app.get(
      "/user",
      this.userMiddleware.auth,
      this.userController.profile
    );
  }
}
