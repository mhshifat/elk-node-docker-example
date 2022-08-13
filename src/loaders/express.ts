import express, { NextFunction, Request, Response } from "express";
import { errLogger, infoLogger } from "../lib";
import { BadRequestError, NotFoundError } from "../utils";

const router = express.Router();
function routes() {
  router.get("/", (_, res) => {
    throw new NotFoundError("Not found");
  })

  return router;
}

export default function loadExpress() {
  const app = express();

  app.use([
    infoLogger,
    processRequestMiddleware,
    routes(),
    errLogger,
    handleErrorsMiddleware
  ])

  return app;
}

function processRequestMiddleware(req: Request, res: Response, next: NextFunction) {
  let correlationId = req.headers["x-correlation-id"];
  if (!correlationId) {
    correlationId = Date.now().toString();
    req.headers["x-correlation-id"] = correlationId;
  }

  res.set("x-correlation-id", correlationId);
  return next();
}

function handleErrorsMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  let code = 500;

  return res.status(code).json({
    name: err?.name || "Internal Server Error", 
    correlation_id: req?.headers["x-correlation-id"],
    message: err?.message,
  });
}