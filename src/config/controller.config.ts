import { PrismaClient } from "@prisma/client";

// Inject Prisma Client To All Controller
export class BaseController {
  protected repo = new PrismaClient();
}
