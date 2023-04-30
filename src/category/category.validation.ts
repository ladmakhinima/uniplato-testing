import joi from "joi";
import { CategoryMessage } from "./category.message";

// Validation Schema For Create Category That Contains title - amount That title is Required
export const createCategorySchema = joi
  .object()
  .keys({
    title: joi.string().required().messages({
      // Customizing Error Messages
      "string.base": CategoryMessage.titleStringFormat,
      "any.required": CategoryMessage.titleRequired,
    }),
    amount: joi.number().optional().messages({
      // Customizing Error Messages
      "any.number": CategoryMessage.amountNumberFormat,
    }),
  })
  .unknown();

// Validation Schema For Update Category That Contains Title And Amount That Is Optional
export const updateCategorySchema = joi
  .object()
  .keys({
    title: joi.string().optional().messages({
      // Customizing Error Messages
      "string.base": CategoryMessage.titleStringFormat,
    }),
    amount: joi.number().optional().messages({
      // Customizing Error Messages
      "number.base": CategoryMessage.amountNumberFormat,
    }),
  })
  .unknown();

export const categoryIdParam = joi
  .object()
  .keys({
    categoryId: joi.number().required().messages({
      "number.base": CategoryMessage.categoryIdInavlidFormat,
    }),
  })
  .unknown();
