import mailer, { sender } from "./mailer";

export function sendEmailVerification(to: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify/${token}`;

  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifikasi Email - PEMOODA</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f7fa; padding: 40px 0;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <div style="width: 80px; height: 80px; margin-bottom: 20px;">
                      <svg style="width: 100%; height: 100%;" width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_3_18)"><path d="M429.75 429.75C525.986 333.514 525.986 177.486 429.75 81.25M81.25 429.75C-14.9856 333.514 -14.9856 177.486 81.25 81.25" stroke="#EE981B" stroke-width="15" stroke-linecap="round"/><circle cx="255.5" cy="255.5" r="218.5" fill="#103153"/><circle cx="255.5" cy="255.5" r="129.5" fill="white"/><ellipse cx="299.379" cy="297.929" rx="58.405" ry="87.6989" transform="rotate(45 299.379 297.929)" fill="#103153"/><ellipse cx="289.605" cy="267.215" rx="11.7829" ry="33.0261" transform="rotate(51 289.605 267.215)" fill="white"/><ellipse cx="254.174" cy="310.262" rx="9.75302" ry="14.2208" transform="rotate(20 254.174 310.262)" fill="white"/></g><defs><clipPath id="clip0_3_18"><rect width="512" height="512" fill="white"/></clipPath></defs></svg>
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Verifikasi Email Anda</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 20px; color: #1a202c; font-size: 22px; font-weight: 600;">Selamat Datang di PEMOODA! 🎉</h2>
                    <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                      Terima kasih telah mendaftar di <strong>PEMOODA</strong> - Aplikasi Karang Taruna No.1 di Indonesia.
                    </p>
                    <p style="margin: 0 0 30px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                      Untuk melanjutkan dan mengakses semua fitur, silakan verifikasi alamat email Anda dengan mengklik tombol di bawah ini:
                    </p>

                    <!-- CTA Button -->
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" style="padding: 10px 0 30px;">
                          <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
                            ✓ Verifikasi Email Sekarang
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Info Box -->
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f7fafc; border-left: 4px solid #667eea; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                      <tr>
                        <td>
                          <p style="margin: 0 0 10px; color: #2d3748; font-size: 14px; font-weight: 600;">
                            ⏰ Link ini akan kadaluarsa dalam 24 jam
                          </p>
                          <p style="margin: 0; color: #718096; font-size: 14px; line-height: 1.5;">
                            Jika Anda tidak mendaftar akun PEMOODA, abaikan email ini.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Alternative Link -->
                    <p style="margin: 0 0 10px; color: #718096; font-size: 14px;">
                      Jika tombol tidak berfungsi, salin dan tempel link berikut ke browser Anda:
                    </p>
                    <p style="margin: 0; padding: 15px; background-color: #f7fafc; border-radius: 8px; word-break: break-all; font-size: 13px; color: #667eea; font-family: monospace;">
                      ${verificationUrl}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <p style="margin: 0 0 15px; color: #1a202c; font-size: 16px; font-weight: 600;">
                      PEMOODA
                    </p>
                    <p style="margin: 0 0 15px; color: #718096; font-size: 14px;">
                      Aplikasi Karang Taruna No.1 di Indonesia
                    </p>
                    <p style="margin: 0 0 20px; color: #a0aec0; font-size: 12px;">
                      Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
                    </p>
                    
                    <!-- Social Links (Optional) -->
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center">
                          <p style="margin: 0; color: #a0aec0; font-size: 11px;">
                            © ${new Date().getFullYear()} PEMOODA. All rights reserved.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return mailer.send({
    to,
    from: sender,
    subject: "✓ Verifikasi Email Anda - PEMOODA",
    html: htmlContent,
  });
}
