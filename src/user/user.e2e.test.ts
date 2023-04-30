import { StatusCode } from "./../config/statusCode.config";
import request from "supertest";
import app from "../config/app.config";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import {
  createInvalidUserStub,
  createInvalidValidationUserStub,
  createValidUserStub,
  validUserStub,
} from "./user.stub";
import { UserMessage } from "./user.message";

describe("User Endpoints", () => {
  let prisma: PrismaClient;
  beforeAll(() => {
    prisma = new PrismaClient();
  });
  afterAll(() => {
    prisma.$disconnect();
  });

  // LOGIN ENDPOINTS
  describe("LOGIN USER : /user/login", () => {
    it("SUCCESS", async () => {
      const response = await request(app())
        .post("/user/login")
        .send(validUserStub());
      expect(response.statusCode).toBe(StatusCode.OK);
      expect(response.body).toEqual({ token: expect.any(String) });
    });

    // TEST CASE FOR INVALID USER
    it("FAILED INVALID USER", async () => {
      // SEND REQUEST TO LOGIN
      const response = await request(app())
        .post("/user/login")
        .send(createInvalidUserStub());

      // CHECK STATUS CODE
      expect(response.statusCode).toBe(StatusCode.BAD_REQUEST);
      // CHECK RESPONSE SHAPE
      expect(response.body).toEqual({
        message: UserMessage.invalidEmailOrPassword,
      });
    });

    // TEST CASE FOR LOGIN VALIDATION - CREDENTIALS HAS INVALID DATA SO VALIDATION MUST BE FAILED
    it("FAILED VALIDATION FAILED", async () => {
      // SEND REQUEST TO LOGIN
      const response = await request(app())
        .post("/user/login")
        .send(createInvalidValidationUserStub());
      // CHECK STATUS CODE
      expect(response.statusCode).toBe(StatusCode.BAD_REQUEST);
      //   CHECK RESPONSE SHAPE
      expect(response.body).toEqual({
        messages: [
          UserMessage.emailInvalidFormat,
          UserMessage.passwordInvalidFormat,
        ],
      });
    });
  });

  // SIGNUP ENDPOINTS - RANDOM EMAIL WITH SIMPLE PASSWORD TO CREATE
  describe("SIGNUP USER : /user/signup", () => {
    it("SUCCESS", async () => {
      const response = await request(app())
        .post("/user/signup")
        .send(createValidUserStub());
      expect(response.statusCode).toBe(StatusCode.CREATE);
      expect(response.body).toEqual({ token: expect.any(String) });
    });

    // TEST CASE FOR INVALID USER (EMAIL IS ALREADY TAKEN)
    it("FAILED INVALID USER SIGNUP", async () => {
      // SEND REQUEST TO SIGNUP
      const response = await request(app())
        .post("/user/signup")
        .send(createInvalidUserStub());

      // CHECK STATUS CODE
      expect(response.statusCode).toBe(StatusCode.BAD_REQUEST);
      // CHECK RESPONSE SHAPE
      expect(response.body).toEqual({
        message: UserMessage.emailTaken,
      });
    });

    // TEST CASE FOR SIGNUP VALIDATION - CREDENTIALS HAS INVALID DATA SO VALIDATION MUST BE FAILED
    it("FAILED VALIDATION FAILED", async () => {
      // SEND REQUEST TO SIGNUP
      const response = await request(app())
        .post("/user/signup")
        .send(createInvalidValidationUserStub());
      // CHECK STATUS CODE
      expect(response.statusCode).toBe(StatusCode.BAD_REQUEST);
      //   CHECK RESPONSE SHAPE
      expect(response.body).toEqual({
        messages: [
          UserMessage.emailInvalidFormat,
          UserMessage.passwordInvalidFormat,
        ],
      });
    });
  });

  // PROFILE ENDPOINTS
  describe("PROFILE USER : /user", () => {
    // CHECK GET USER PROFILE BASED ON AUTHORIZED TOKEN
    it("SUCCESS - FETCH USER INFORMATION BASED ON TOKEN", async () => {
      // FIND RANDOM USER FROM DB
      const user = await prisma.user.findFirst();
      // GENERATE TOKEN BASED ON RANDOM USER
      const token = jwt.sign(
        { id: user?.id, role: user?.role },
        "supersecretkey",
        { expiresIn: "1m" }
      );
      // SEND REQUEST TO /user
      const response = await request(app())
        .get("/user")
        .set({ authorization: `Bearer ${token}` });

      // CHECK STATUS CODE
      expect(response.statusCode).toBe(StatusCode.OK);
      //   CHECK RESPONSE SHAPE
      expect(response.body).toEqual({
        user: expect.objectContaining({
          id: expect.any(Number),
          email: expect.any(String),
          password: expect.any(String),
          bio: expect.any(String),
          role: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      });
    });

    // SEND REQUEST TO /user WITHOUT TOKEN TO FAILED
    it("FAILED - FETCH USER INFORMATION WITHOUT ANY EXISTTING TOKEN ON HEADER", async () => {
      const response = await request(app()).get("/user");
      expect(response.statusCode).toBe(StatusCode.UN_AUTH);
      expect(response.body).toEqual({ message: UserMessage.unauth });
    });
  });
});
