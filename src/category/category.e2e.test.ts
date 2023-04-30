import request from "supertest";
import app from "../config/app.config";
import jwt from "jsonwebtoken";
import { PrismaClient, UserRole } from "@prisma/client";
import { createValidCategoryStub } from "./category.stub";
import { StatusCode } from "../config/statusCode.config";
import { UserMessage } from "../user/user.message";

describe("Category Endpoints", () => {
  let prisma: PrismaClient;
  beforeAll(() => {
    prisma = new PrismaClient();
  });
  afterAll(() => {
    prisma.$disconnect();
  });

  // FETCH ALL CATEGORIES
  describe("FETCH ALL : /category", () => {
    it("Success", async () => {
      // SEND GET REQUEST TO /category
      const response = await request(app()).get("/category");
      // CHECK RESPONSE SHAPE
      expect(response.body).toEqual({
        categories: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            title: expect.any(String),
            amount: expect.any(Number),
          }),
        ]),
      });
      // CHECK RESPONSE STATUS CODE
      expect(response.statusCode).toBe(StatusCode.OK);
    });
  });

  // GET SINGLE CATEGORY
  describe("FETCH SINGLE : /category/:id", () => {
    // FAIL CASE
    it("Failed", async () => {
      // SEND REQUEST TO WRONG CATEGORY ID
      const response = await request(app()).get("/category/123456");
      expect(response.statusCode).toBe(StatusCode.NOT_FOUND);
    });

    // SUCCESS CASE
    it("Success", async () => {
      // GET SPECEFIC RECORD FROM DATABASE TO USE IDS FOR SENDING REQUEST
      const data = await prisma.category.findFirst();
      // SEND REQUEST TO GET SPECEFIC CATEGORY BASED ON ID
      const response = await request(app()).get(
        `/category/${data?.id}`
      );
      // CHECK RESPONSE SHAPE
      expect(response.body).toEqual({
        category: expect.objectContaining({
          title: expect.any(String),
          id: expect.any(Number),
          amount: expect.any(Number),
        }),
      });
      // CHECK RESPONSE CODE
      expect(response.statusCode).toBe(StatusCode.OK);
    });
  });

  // CREATE CATEGORY
  describe("CREATE CATEGORY : /category", () => {
    // TEST FOR WRONG PERMISSION
    it("Failed PERMISSION DENIED", async () => {
      // GET COLLOBRATOR USER BUT FOR THIS ROUTE ADMIN CAN CREATE CATEGORY
      const collaboratorUser = await prisma.user.findFirst({
        where: { role: UserRole.COLLABORATOR },
      });
      // GENERATE TOKEN
      const token = jwt.sign(
        { id: collaboratorUser?.id, role: collaboratorUser?.role },
        "supersecretkey",
        { expiresIn: "1m" }
      );
      // SEND REQUEST TO SPECEFIC ROUTES
      const response = await request(app())
        .post("/category")
        .set({ authorization: `Bearer ${token}` })
        .send(createValidCategoryStub());

      // CHECK RESPONSE MESSAGE ON FAILING
      expect(response.body).toEqual({
        message: UserMessage.permissionDenined,
      });

      // CHECK REQUEST STATUS CODE
      expect(response.statusCode).toEqual(StatusCode.FORBIDDEN);
    });

    // TEST FOR UNAUTHORIZED USER , WHEN DONT HAVE TOKEN
    it("Failed UNAUTH", async () => {
      // SEND REQUEST TO /category TO CREATE OWN CATEGORY
      const response = await request(app())
        .post("/category")
        .send(createValidCategoryStub());

      // CHECK RESPONSE OF FAILING
      expect(response.body).toEqual({
        message: UserMessage.unauth,
      });

      // CHECK STATUS CODE
      expect(response.statusCode).toEqual(StatusCode.UN_AUTH);
    });

    // SUCCESS CASE FOR CREATING CATEGORY
    it("SUCCESS", async () => {
      // GET USER ADMIN FROM DATABASE
      const adminUser = await prisma.user.findFirst({
        where: { role: UserRole.ADMIN },
      });
      // GENERATE TOKEN
      const token = jwt.sign(
        { id: adminUser?.id, role: adminUser?.role },
        "supersecretkey",
        { expiresIn: "1m" }
      );
      // SEND REQUEST TO CREATE CATEGORY
      const response = await request(app())
        .post("/category")
        .set({ authorization: `Bearer ${token}` })
        .send(createValidCategoryStub());

      // CHECK RESPONSE SHARE
      expect(response.body).toEqual({
        category: expect.objectContaining({
          id: expect.any(Number),
          title: expect.any(String),
          amount: expect.any(Number),
        }),
      });

      // CHECK RESPONSE STATUS CODE
      expect(response.statusCode).toEqual(StatusCode.CREATE);
    });
  });

  // UPDATE CATEGORY
  describe("UPDATE CATEGORY : /category", () => {
    // SUCCESS CASE FOR UPDATING TITLE
    it("SUCCESS - TITLE UPDATE", async () => {
      // GET SINGLE USER THAT CAN BE ADMIN OR COLLABRATOR
      const user = await prisma.user.findFirst({});
      // GET SINGLE CATEGORY TO UPDATE
      const category = await prisma.category.findFirst({});
      // GENERATE TOKEN BASED ON SELECTED USER
      const token = jwt.sign(
        { id: user?.id, role: user?.role },
        "supersecretkey",
        { expiresIn: "1m" }
      );
      // SEND REQUEST TO UPDATE CATEGORY
      const response = await request(app())
        .patch(`/category/${category?.id}`)
        .set({ authorization: `Bearer ${token}` })
        .send({ title: createValidCategoryStub().title });

      // CHECK RESPONSE STATUS CODE
      expect(response.statusCode).toEqual(StatusCode.OK);
      // CHECK RESPONSE SHAPE
      expect(response.body).toEqual({
        category: {
          title: createValidCategoryStub().title,
          amount: expect.any(Number),
          id: expect.any(Number),
        },
      });
      // SELECT AGAIN CATEGORY THAT UPDATED TO CHECK IS UPDATE DONE SUCCESSFULLY
      const updatedCategory = await prisma.category.findUnique({
        where: { id: category?.id },
      });
      // DATA SHAPE FOR UPDATED CATEGORY
      expect(updatedCategory).toEqual(
        expect.objectContaining({
          title: createValidCategoryStub().title,
          amount: expect.any(Number),
          id: expect.any(Number),
        })
      );
    });

    // SUCCESS CASE FOR UPDATING AMOUNT
    it("SUCCESS - AMOUNT UPDATE", async () => {
      const user = await prisma.user.findFirst({});
      const category = await prisma.category.findFirst({});
      const token = jwt.sign(
        { id: user?.id, role: user?.role },
        "supersecretkey",
        { expiresIn: "1m" }
      );
      const response = await request(app())
        .patch(`/category/${category?.id}`)
        .set({ authorization: `Bearer ${token}` })
        .send({ amount: createValidCategoryStub().amount });
      expect(response.statusCode).toEqual(StatusCode.OK);
      expect(response.body).toEqual({
        category: expect.objectContaining({
          title: expect.any(String),
          amount: createValidCategoryStub().amount,
          id: expect.any(Number),
        }),
      });
      const updatedCategory = await prisma.category.findUnique({
        where: { id: category?.id },
      });
      expect(updatedCategory).toEqual(
        expect.objectContaining({
          title: expect.any(String),
          amount: createValidCategoryStub().amount,
          id: expect.any(Number),
        })
      );
    });

    // SUCCESS CASE FOR UPDATING BOTH AMOUNT AND TITLE
    it("SUCCESS - BOTH UPDATE", async () => {
      const user = await prisma.user.findFirst({});
      const category = await prisma.category.findFirst({});
      const token = jwt.sign(
        { id: user?.id, role: user?.role },
        "supersecretkey",
        { expiresIn: "1m" }
      );
      // SEND PATCH REQUEST TO UPDATE TITLE AND AMOUNT CATEGORY
      const response = await request(app())
        .patch(`/category/${category?.id}`)
        .set({ authorization: `Bearer ${token}` })
        .send(createValidCategoryStub());
      // CHECK RESPONSE STATUS CODE
      expect(response.statusCode).toEqual(StatusCode.OK);
      // CHECK RESPONSE SHAPE
      expect(response.body).toEqual({
        category: expect.objectContaining({
          ...createValidCategoryStub(),
          id: expect.any(Number),
        }),
      });
      const updatedCategory = await prisma.category.findUnique({
        where: { id: category?.id },
      });
      expect(updatedCategory).toEqual(
        expect.objectContaining({
          ...createValidCategoryStub(),
          id: expect.any(Number),
        })
      );
    });

    // FAILED CASE FOR UPDATE TITLE OR AMOUNT
    it("FAILED - UPDATE TITLE OR AMOUNT", async () => {
      const user = await prisma.user.findFirst({});
      const token = jwt.sign(
        { id: user?.id, role: user?.role },
        "supersecretkey",
        { expiresIn: "1m" }
      );
      // SEND REQUEST TO NOT EXISTING CATEGORY ON DATABASE
      const response = await request(app())
        .patch("/category/123456789")
        .set({ authorization: `Bearer ${token}` })
        .send({ title: createValidCategoryStub().title });
      // CHECK CORRECT STATUS CODE
      expect(response.statusCode).toBe(StatusCode.NOT_FOUND);
    });
  });
});
