import { UserRole } from "@prisma/client";

export interface IRequestUser {
  role: UserRole;
  id: number;
}

// Add Properties For Authenticated User Request That Contains User Information
declare global {
  namespace Express {
    export interface Request {
      user?: IRequestUser;
    }
  }
}
