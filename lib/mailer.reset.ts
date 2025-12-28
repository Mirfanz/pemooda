import mailer, { sender } from "./mailer";

export function sendResetPassword(to: string, code: string) {
  return mailer.send({
    to,
    from: sender,
    subject: "Verification Code",
    html: `<strong>Your verification code:</strong><h2>${code}</h2>`,
  });
}
