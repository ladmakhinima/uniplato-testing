import { UserRole } from "@prisma/client";
import joi from "joi";
import { UserMessage } from "./user.message";

// Validation Schema For Signup That Contains Email - Password - Bio - Role
export const signupSchema = joi.object().keys({
  email: joi.string().email().required().messages({
    // Customizing Error Messages
    "string.base": UserMessage.emailInvalidFormat,
    "any.required": UserMessage.emailRequired,
    "string.email": UserMessage.emailInvalidFormat,
  }),
  password: joi.string().min(8).required().messages({
    // Customizing Error Messages
    "string.base": UserMessage.passwordString,
    "any.required": UserMessage.passwordRequired,
    "string.min": UserMessage.passwordInvalidFormat,
  }),
  bio: joi.string().optional().messages({
    // Customizing Error Messages
    "string.base": UserMessage.bioInvalidFormat,
  }),
  role: joi
    .string()
    .valid(...Object.values(UserRole))
    .optional()
    .messages({
      // Customizing Error Messages
      "string.base": UserMessage.roleString,
      "any.valid": UserMessage.roleInvalidEnum,
    }),
});

// Validation Schema For Login That Contains Email - Password
export const loginSchema = joi.object().keys({
  email: joi.string().email().required().messages({
    // Customizing Error Messages
    "string.base": UserMessage.emailInvalidFormat,
    "any.required": UserMessage.emailRequired,
    "string.email": UserMessage.emailInvalidFormat,
  }),
  password: joi.string().min(8).required().messages({
    // Customizing Error Messages
    "string.base": UserMessage.passwordString,
    "any.required": UserMessage.passwordRequired,
    "string.min": UserMessage.passwordInvalidFormat,
  }),
});
