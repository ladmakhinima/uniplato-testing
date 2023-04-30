import { Request, Response } from "express";
import { BaseController } from "../config/controller.config";
import { StatusCode } from "../config/statusCode.config";
import { CategoryMessage } from "./category.message";

// category controller for handing category route
export class CategoryController extends BaseController {
  // get all categories action
  getAll = async (request: Request, response: Response) => {
    const categories = await this.repo.category.findMany();
    return response.status(StatusCode.OK).json({ categories });
  };

  // get single category action
  getOne = async (request: Request, response: Response) => {
    const { categoryId } = request.params;
    const selectedCategory = await this.repo.category.findUnique({
      where: {
        id: +categoryId,
      },
    });
    if (!selectedCategory) {
      return response
        .status(StatusCode.NOT_FOUND)
        .json({ message: CategoryMessage.notFound });
    }
    return response
      .status(StatusCode.OK)
      .json({ category: selectedCategory });
  };

  // create category action
  create = async (request: Request, response: Response) => {
    const { title, amount } = request.body;
    const newCategory = await this.repo.category.create({
      data: {
        title,
        amount,
      },
    });
    return response
      .status(StatusCode.CREATE)
      .json({ category: newCategory });
  };

  // update category action
  update = async (request: Request, response: Response) => {
    const { categoryId } = request.params;
    const categorySelected = await this.repo.category.findUnique({
      where: { id: +categoryId },
    });
    if (!categorySelected) {
      return response
        .status(StatusCode.NOT_FOUND)
        .json({ message: CategoryMessage.notFound });
    }
    const updatedCategory = await this.repo.category.update({
      where: { id: +categoryId },
      data: request.body,
    });
    if (!updatedCategory) {
      return response
        .status(StatusCode.INTERNAL_SERVER)
        .json({ message: CategoryMessage.updateFailed });
    }
    return response
      .status(StatusCode.OK)
      .json({ category: updatedCategory });
  };
}
