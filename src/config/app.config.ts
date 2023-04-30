import express from "express";
import rateLimiter from "express-rate-limit";
import compression from "compression";
import cors from "cors";
import { AppRoutes } from "./routes.config";

const configApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(compression());
  app.use(
    rateLimiter({
      // waiting time after get error
      windowMs: 60 * 1000 * 1,
      // maximum number of request that receive from ip
      max: 10,
      legacyHeaders: false,
    })
  );
  new AppRoutes(app).config();
  return app;
};

export default configApp;
