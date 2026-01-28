import { Resend } from "resend";

import { env } from "@/env";

const apiKey = env.RESEND_API_KEY || "re_placeholder_no_api_key";

export const resend = new Resend(apiKey);
