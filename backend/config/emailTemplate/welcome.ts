// Inline SVG logo (works in Gmail/Apple Mail/iOS Mail, etc.)
const INLINE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 256 256" role="img" aria-label="ResumeRouter logo">
  <rect x="8" y="8" width="240" height="240" rx="40" fill="#2563EB"/>
  <g transform="translate(36,28)">
    <path fill="#FFFFFF" d="M0,16 C0,7.163 7.163,0 16,0 H96 l32,32 v112 c0,8.837-7.163,16-16,16 H16 C7.163,160,0,152.837,0,144 V16z"/>
    <path fill="#60A5FA" d="M96,0 v32 c0,8.837 7.163,16 16,16 h32 L96,0z"/>
    <g transform="translate(16,52)">
      <circle cx="6" cy="6" r="4" fill="#0F172A" opacity="0.9"/>
      <rect x="18" y="2" width="78" height="8" rx="4" fill="#0F172A" opacity="0.9"/>
      <circle cx="6" cy="34" r="4" fill="#0F172A" opacity="0.8"/>
      <rect x="18" y="30" width="92" height="8" rx="4" fill="#0F172A" opacity="0.8"/>
      <circle cx="6" cy="62" r="4" fill="#0F172A" opacity="0.7"/>
      <rect x="18" y="58" width="68" height="8" rx="4" fill="#0F172A" opacity="0.7"/>
    </g>
  </g>
  <g transform="translate(150,148)">
    <g fill="#60A5FA">
      <rect x="2" y="-10" width="6" height="8" rx="2"/><rect x="12" y="-10" width="6" height="8" rx="2"/><rect x="22" y="-10" width="6" height="8" rx="2"/><rect x="32" y="-10" width="6" height="8" rx="2"/><rect x="42" y="-10" width="6" height="8" rx="2"/><rect x="52" y="-10" width="6" height="8" rx="2"/>
      <rect x="2" y="70" width="6" height="8" rx="2"/><rect x="12" y="70" width="6" height="8" rx="2"/><rect x="22" y="70" width="6" height="8" rx="2"/><rect x="32" y="70" width="6" height="8" rx="2"/><rect x="42" y="70" width="6" height="8" rx="2"/><rect x="52" y="70" width="6" height="8" rx="2"/>
      <rect x="-10" y="2" width="8" height="6" rx="2"/><rect x="-10" y="12" width="8" height="6" rx="2"/><rect x="-10" y="22" width="8" height="6" rx="2"/><rect x="-10" y="32" width="8" height="6" rx="2"/><rect x="-10" y="42" width="8" height="6" rx="2"/><rect x="-10" y="52" width="8" height="6" rx="2"/>
      <rect x="70" y="2" width="8" height="6" rx="2"/><rect x="70" y="12" width="8" height="6" rx="2"/><rect x="70" y="22" width="8" height="6" rx="2"/><rect x="70" y="32" width="8" height="6" rx="2"/><rect x="70" y="42" width="8" height="6" rx="2"/><rect x="70" y="52" width="8" height="6" rx="2"/>
    </g>
    <rect x="0" y="0" width="68" height="68" rx="12" fill="#60A5FA"/>
    <g stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round">
      <path d="M14,44 L34,34 L54,44"/>
      <path d="M14,24 L34,34 L54,20"/>
      <path d="M34,14 L34,34"/>
    </g>
    <g fill="#FFFFFF">
      <circle cx="14" cy="44" r="3"/>
      <circle cx="34" cy="34" r="4"/>
      <circle cx="54" cy="44" r="3"/>
      <circle cx="14" cy="24" r="3"/>
      <circle cx="54" cy="20" r="3"/>
      <circle cx="34" cy="14" r="3"/>
    </g>
  </g>
</svg>
`.trim();

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
                <!-- Show inline SVG everywhere except Outlook desktop -->
                <!--[if !mso]><!-- -->
                ${INLINE_SVG}
                <!--<![endif]-->

                <!--[if mso]>
                  <img src="cid:logo" width="120" height="120" alt="ResumeRouter logo" style="display:block;">
                <![endif]-->
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
                  <a href="https://resumerouter.app/onboarding"
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
