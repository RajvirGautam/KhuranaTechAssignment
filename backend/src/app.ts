import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import authRoutes from "./routes/authRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import aiRoutes from "./routes/aiRoutes";
import { errorHandler, notFoundHandler } from "./middleware/error";

export const app = express();

const allowedOrigins = new Set<string>([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  env.CLIENT_ORIGIN,
  ...(env.CLIENT_ORIGINS
    ? env.CLIENT_ORIGINS.split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [])
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (env.NODE_ENV === "development") {
        callback(null, true);
        return;
      }

      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/ai", aiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
