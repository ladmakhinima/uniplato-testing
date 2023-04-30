import { UserRole } from "@prisma/client";

export class UserMessage {
  static invalidEmailOrPassword =
    "Email Address Dosn't Match With Password";

  static emailTaken = "Email is already taken";
  static notFound = "User Not Found";
  static permissionDenined = "Permission Denied";
  static unauth = "Unauthorization";

  // validation message

  // EMAIL
  static emailInvalidFormat = "you must enter valid email address";
  static emailRequired = "you must enter email address";

  // PASSWORD
  static passwordInvalidFormat =
    "your password must contain at least 8 character";
  static passwordString = "you must enter string for password";
  static passwordRequired = "you must enter password";

  // BIO
  static bioInvalidFormat = "you must enter string for bio";

  // ROLE
  static roleString = "you must enter string for role";
  static roleInvalidEnum = `user role must be ${Object.values(
    UserRole
  )}`;
}
