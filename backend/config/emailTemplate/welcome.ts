
export const welcomeEmailTemplate = function (name: string) {
  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />  
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Welcome to ResumeRouter</title>
    <style>
      /* hidden preheader for inbox preview */
      .preheader { display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; overflow:hidden; mso-hide:all; }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#f6f8fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <span class="preheader">Welcome aboard! Get started in under a minute.</span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f8fb;">
      <tr>
        <td align="center" style="padding:32px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(2,6,23,.06);">
            <tr>
              <td style="padding:20px 24px;">
                <img src="https://resumerouter.app/logo.png" width="120" height="120" alt="ResumeRouter logo" style="display:block;">
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 8px;">
                <h1 style="margin:0 0 8px;font-size:24px;line-height:1.25;">Welcome to ResumeRouter, ${name}! 🎉</h1>
                <p style="margin:0 0 12px;font-size:16px;line-height:1.6;">
                  Thank you for signing up. We're excited to have you on board.
                </p>
                <p style="margin:0 0 20px;font-size:16px;line-height:1.6;">
                  To get started, open your dashboard and complete the quick setup checklist.
                </p>
                <p style="margin:0 0 24px;">
                  <a href="https://resumerouter.app/dashboard"
                     style="display:inline-block;padding:12px 20px;border-radius:10px;background:#4f46e5;color:#ffffff;font-weight:700;text-decoration:none;">
                    Open Dashboard
                  </a>
                </p>
                <p style="margin:0 0 4px;font-size:14px;color:#475569;">
                  Questions? Just reply to this email—we’re here to help.
                </p>
                <p style="margin:0 0 24px;font-size:14px;color:#475569;">
                  — The ResumeRouter Team
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 24px 22px;text-align:center;font-size:12px;color:#94a3b8;">
                You’re receiving this because you created an account.
                <br />
                <a href="https://resumerouter.app/privacy" style="color:#94a3b8;text-decoration:underline;">Privacy</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
};
