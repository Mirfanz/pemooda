import mailer from "@sendgrid/mail";

const { SENDGRID_API_KEY, SENDGRID_EMAIL_SENDER } = process.env;

if (!SENDGRID_API_KEY || !SENDGRID_EMAIL_SENDER) {
  throw new Error("Missing SendGrid configuration");
}

mailer.setApiKey(SENDGRID_API_KEY);

export const sender = SENDGRID_EMAIL_SENDER;
export default mailer;
