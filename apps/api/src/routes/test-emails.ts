import Router from "@koa/router";

import { env } from "@/env";
import {
  clearRecordedEmails,
  disableEmailRecording,
  enableEmailRecording,
  getRecordedEmails,
  isEmailRecordingEnabled,
} from "@/lib/email-recorder";
import { logger } from "@/lib/logger";

const router = new Router({ prefix: "/api/test/emails" });

router.use(async (ctx, next) => {
  if (env.NODE_ENV === "production") {
    ctx.status = 404;
    ctx.body = { error: "Not found" };

    return;
  }
  await next();
});

router.get("/status", async (ctx) => {
  ctx.body = {
    recording: isEmailRecordingEnabled(),
    emailCount: getRecordedEmails().length,
  };
});

router.post("/enable", async (ctx) => {
  enableEmailRecording();
  logger.info("Email recording enabled for e2e tests");
  ctx.body = { success: true, recording: true };
});

router.post("/disable", async (ctx) => {
  disableEmailRecording();
  logger.info("Email recording disabled");
  ctx.body = { success: true, recording: false };
});

router.get("/", async (ctx) => {
  const emails = getRecordedEmails();
  ctx.body = { emails, count: emails.length };
});

router.delete("/", async (ctx) => {
  clearRecordedEmails();
  ctx.body = { success: true, cleared: true };
});

router.get("/find", async (ctx) => {
  const { to, subject } = ctx.query;
  let emails = getRecordedEmails();

  if (typeof to === "string") {
    emails = emails.filter((e) => e.to === to);
  }

  if (typeof subject === "string") {
    const lowerSubject = subject.toLowerCase();
    emails = emails.filter((e) =>
      e.subject.toLowerCase().includes(lowerSubject)
    );
  }

  ctx.body = { emails, count: emails.length };
});

export const testEmailsRouter = router;
