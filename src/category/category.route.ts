import { UserRole } from "@prisma/client";
import { Express } from "express";
import { AppMiddleware } from "../config/middleware.config";
import { UserMiddleware } from "../user/user.middleware";
import { CategoryController } from "./category.controller";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParam,
} from "./category.validation";

export class CategoryRouter {
  // category controller that serve all routes based on request that related to category
  private categoryController: CategoryController;
  // user middleware that contains authentication , role based middleware
  private userMiddleware: UserMiddleware;
  // global middleware like validating request body
  private appMiddleware: AppMiddleware;

  // get instance from all dependency of this class
  constructor(private readonly app: Express) {
    this.categoryController = new CategoryController();
    this.userMiddleware = new UserMiddleware();
    this.appMiddleware = new AppMiddleware();
  }

  config() {
    // get all category routes for retreiving all categories
    this.app.get("/category", this.categoryController.getAll);

    // get single category route for retreiving single category
    this.app.get(
      "/category/:categoryId",
      // validating category id params
      this.appMiddleware.validation.bind(
        null,
        categoryIdParam,
        "param"
      ),
      this.categoryController.getOne
    );

    // create category if you have admin role that send title and amount
    this.app.post(
      "/category",
      // validation middleware binding
      this.appMiddleware.validation.bind(
        null,
        createCategorySchema,
        "body"
      ),
      // auth middleware
      this.userMiddleware.auth,
      // role middleware binding that must be admin
      this.userMiddleware.checkRole.bind(null, UserRole.ADMIN),
      this.categoryController.create
    );

    this.app.patch(
      "/category/:categoryId",
      // validation middleware binding
      this.appMiddleware.validation.bind(
        null,
        updateCategorySchema,
        "body"
      ),
      // auth middleware
      this.userMiddleware.auth,
      // validating category id params
      this.appMiddleware.validation.bind(
        null,
        categoryIdParam,
        "param"
      ),
      // pipe for converting string format to number
      this.appMiddleware.numberPipe,
      // role middleware binding that must be admin or collaborator
      this.userMiddleware.checkRole.bind(null, [
        UserRole.COLLABORATOR,
        UserRole.ADMIN,
      ]),
      this.categoryController.update
    );
  }
}
