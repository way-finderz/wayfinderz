import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";

import { env } from "@/env";

// Create SES client with optional LocalStack endpoint
const sesClient = new SESClient({
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

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(params: SendEmailParams): Promise<string> {
  const command = new SendEmailCommand({
    Source: env.SES_FROM_EMAIL,
    Destination: {
      ToAddresses: [params.to],
    },
    Message: {
      Subject: {
        Data: params.subject,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: params.html,
          Charset: "UTF-8",
        },
        Text: {
          Data: params.text,
          Charset: "UTF-8",
        },
      },
    },
  });

  const response = await sesClient.send(command);
  if (!response.MessageId) {
    throw new Error(
      "SES returned success but no MessageId - email may not have been sent"
    );
  }

  return response.MessageId;
}
