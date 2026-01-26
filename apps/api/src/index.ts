import { app } from "@/app";
import { env } from "@/env";
import { logger } from "@/lib/logger";

app.listen(env.API_PORT, "0.0.0.0", () => {
  logger.info("API server started", {
    port: env.API_PORT,
    environment: env.NODE_ENV,
    logLevel: env.LOG_LEVEL,
  });
});
