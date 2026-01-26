/**
 * Email Worker - Long-polling SQS consumer for sending emails via SES
 *
 * This worker runs as a separate process and continuously polls the SQS queue
 * for email jobs. When a message is received, it sends the email via SES and
 * deletes the message from the queue.
 *
 * Features:
 * - Exponential backoff on consecutive failures
 * - Health tracking for monitoring
 * - Graceful shutdown handling
 *
 * Usage:
 *   pnpm worker:email       (development with tsx)
 *   pnpm worker:email:prod  (production with compiled JS)
 */

import http from "node:http";

import { logger } from "@/lib/logger";
import { sendEmail } from "@/services/ses.service";
import { deleteFromEmailQueue, receiveFromEmailQueue } from "@/services/sqs.service";

import "dotenv/config";

const POLL_INTERVAL_MS = 1000; // Wait between polling attempts if queue is empty
const HEALTH_PORT = parseInt(process.env.WORKER_HEALTH_PORT ?? "3002", 10);

// Exponential backoff configuration
const MIN_BACKOFF_MS = 1000; // 1 second
const MAX_BACKOFF_MS = 60000; // 1 minute
const BACKOFF_MULTIPLIER = 2;

let isShuttingDown = false;
let consecutiveFailures = 0;

// Health tracking
const healthStatus = {
  status: "starting" as "starting" | "healthy" | "unhealthy" | "shutting_down",
  lastProcessedAt: null as Date | null,
  messagesProcessed: 0,
  messagesFailed: 0,
  consecutiveFailures: 0,
  startedAt: new Date(),
};

/**
 * Calculate backoff delay with exponential increase
 */
function getBackoffDelay(): number {
  if (consecutiveFailures === 0) return 0;
  const delay = MIN_BACKOFF_MS * Math.pow(BACKOFF_MULTIPLIER, consecutiveFailures - 1);

  return Math.min(delay, MAX_BACKOFF_MS);
}

/**
 * Process a batch of messages from the queue
 */
async function processBatch(): Promise<number> {
  const messages = await receiveFromEmailQueue(10, 20);

  if (messages.length === 0) {
    return 0;
  }

  logger.info("Received messages from queue", { messageCount: messages.length });

  let successCount = 0;

  for (const message of messages) {
    try {
      logger.info("Sending email", {
        type: message.body.type,
        to: message.body.to,
      });

      await sendEmail({
        to: message.body.to,
        subject: message.body.subject,
        html: message.body.html,
        text: message.body.text,
      });

      logger.info("Email sent successfully, deleting message");
      await deleteFromEmailQueue(message.receiptHandle);

      successCount++;
      healthStatus.messagesProcessed++;
      healthStatus.lastProcessedAt = new Date();
    } catch (error) {
      logger.error("Failed to send email", error, {
        to: message.body.to,
        type: message.body.type,
        subject: message.body.subject,
        messageId: message.messageId,
      });
      healthStatus.messagesFailed++;
      // Don't delete the message - it will be retried or sent to DLQ
    }
  }

  return successCount;
}

/**
 * Main worker loop
 */
async function runWorker(): Promise<void> {
  logger.info("Starting email worker", {
    queueUrl: process.env.SQS_EMAIL_QUEUE_URL,
    region: process.env.AWS_REGION ?? "us-east-1",
    healthPort: HEALTH_PORT,
  });

  healthStatus.status = "healthy";

  while (!isShuttingDown) {
    try {
      const processed = await processBatch();

      // Reset consecutive failures on success
      if (processed > 0) {
        consecutiveFailures = 0;
        healthStatus.consecutiveFailures = 0;
      }

      // If no messages were processed, add a small delay before next poll
      if (processed === 0) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }
    } catch (error) {
      consecutiveFailures++;
      healthStatus.consecutiveFailures = consecutiveFailures;

      logger.error("Error in worker loop", error);

      // Mark as unhealthy after too many consecutive failures
      if (consecutiveFailures >= 5) {
        healthStatus.status = "unhealthy";
      }

      // Apply exponential backoff
      const backoffDelay = getBackoffDelay();
      logger.warn("Applying backoff delay", {
        backoffDelay,
        consecutiveFailures,
      });
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
    }
  }

  healthStatus.status = "shutting_down";
  logger.info("Worker shut down gracefully");
}

/**
 * Start health check HTTP server
 */
function startHealthServer(): http.Server {
  const server = http.createServer((req, res) => {
    if (req.url === "/health" && req.method === "GET") {
      const isHealthy = healthStatus.status === "healthy";
      res.writeHead(isHealthy ? 200 : 503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        ...healthStatus,
        uptime: Date.now() - healthStatus.startedAt.getTime(),
      }));
    } else {
      res.writeHead(404);
      res.end("Not found");
    }
  });

  server.listen(HEALTH_PORT, () => {
    logger.info("Health server started", { port: HEALTH_PORT });
  });

  return server;
}

/**
 * Handle graceful shutdown
 */
function setupGracefulShutdown(healthServer: http.Server): void {
  const shutdown = (signal: string) => {
    logger.info("Shutdown signal received", { signal });
    isShuttingDown = true;
    healthStatus.status = "shutting_down";

    healthServer.close(() => {
      logger.info("Health server closed");
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

// Start the worker
const healthServer = startHealthServer();
setupGracefulShutdown(healthServer);
runWorker().catch((error) => {
  logger.fatal("Fatal error in email worker", error);
  process.exit(1);
});
