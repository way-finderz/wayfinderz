import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";
import { z } from "zod";

import { env } from "@/env";

const emailJobMessageSchema = z.object({
  type: z.enum(["verification", "password-reset"]),
  to: z.string().email(),
  subject: z.string().min(1),
  html: z.string().min(1),
  text: z.string().min(1),
});

const sqsClient = new SQSClient({
  region: env.AWS_REGION,
  ...(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
    ? {
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    }
    : {}),
  ...(env.AWS_ENDPOINT_URL ? { endpoint: env.AWS_ENDPOINT_URL } : {}),
});

export interface EmailJobMessage {
  type: "verification" | "password-reset";
  to: string;
  subject: string;
  html: string;
  text: string;
}

function getQueueUrl(): string {
  const queueUrl = env.SQS_EMAIL_QUEUE_URL;
  if (!queueUrl) {
    throw new Error("SQS_EMAIL_QUEUE_URL is not configured");
  }

  return queueUrl;
}

export async function sendToEmailQueue(message: EmailJobMessage): Promise<string> {
  const queueUrl = getQueueUrl();

  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(message),
    MessageAttributes: {
      Type: {
        DataType: "String",
        StringValue: message.type,
      },
    },
  });

  const response = await sqsClient.send(command);
  if (!response.MessageId) {
    throw new Error(
      "SQS returned success but no MessageId - message may not have been queued"
    );
  }

  return response.MessageId;
}

export async function receiveFromEmailQueue(
  maxMessages: number = 10,
  waitTimeSeconds: number = 20
): Promise<
  Array<{
    messageId: string;
    receiptHandle: string;
    body: EmailJobMessage;
  }>
> {
  const queueUrl = getQueueUrl();

  const command = new ReceiveMessageCommand({
    QueueUrl: queueUrl,
    MaxNumberOfMessages: maxMessages,
    WaitTimeSeconds: waitTimeSeconds,
    MessageAttributeNames: ["All"],
  });

  const response = await sqsClient.send(command);

  if (!response.Messages) {
    return [];
  }

  return response.Messages.map((message) => {
    if (!message.MessageId || !message.ReceiptHandle) {
      console.error("SQS message missing required fields:", {
        hasMessageId: !!message.MessageId,
        hasReceiptHandle: !!message.ReceiptHandle,
      });
      throw new Error("SQS message missing MessageId or ReceiptHandle");
    }

    const parsed = emailJobMessageSchema.safeParse(
      JSON.parse(message.Body ?? "{}")
    );

    if (!parsed.success) {
      console.error("Invalid SQS message body:", parsed.error.issues);
      throw new Error(`Invalid SQS message format: ${parsed.error.message}`);
    }

    return {
      messageId: message.MessageId,
      receiptHandle: message.ReceiptHandle,
      body: parsed.data,
    };
  });
}

export async function deleteFromEmailQueue(receiptHandle: string): Promise<void> {
  const queueUrl = getQueueUrl();

  const command = new DeleteMessageCommand({
    QueueUrl: queueUrl,
    ReceiptHandle: receiptHandle,
  });

  await sqsClient.send(command);
}
