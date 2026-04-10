import type { NextFunction, Request, Response } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { env } from "../config/env";

interface JwtPayload {
  sub: string;
  email: string;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.header("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Missing or invalid token" });
    return;
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (error) {
    const decoded = jwt.decode(token) as Partial<JwtPayload> | null;
    const email = typeof decoded?.email === "string" ? decoded.email : "unknown";

    if (error instanceof TokenExpiredError) {
      console.log(`[AUTH] SESSION_EXPIRED | email=${email}`);
    } else if (error instanceof JsonWebTokenError) {
      console.log(`[AUTH] TOKEN_INVALID | email=${email}`);
    } else {
      console.log(`[AUTH] TOKEN_REJECTED | email=${email}`);
    }

    res.status(401).json({ message: "Token is invalid or expired" });
  }
};
