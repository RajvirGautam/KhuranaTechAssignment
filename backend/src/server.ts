import { app } from "./app";
import { connectDb } from "./config/db";
import { env } from "./config/env";

const start = async (): Promise<void> => {
  await connectDb();
  app.listen(env.PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${env.PORT}`);
  });
};

start().catch((error: unknown) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
