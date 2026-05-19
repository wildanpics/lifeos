/**
 * Beautiful HTML email template for LIFE OS email verification
 * Sent via Resend API
 */
export function getVerificationEmailHtml(params: {
  displayName: string;
  verificationLink: string;
  appUrl: string;
}): string {
  const { displayName, verificationLink, appUrl } = params;
  const firstName = displayName.split(' ')[0] || 'Pejuang';

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verifikasi Email - LIFE OS</title>
</head>
<body style="margin:0;padding:0;background:#0B0F19;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0B0F19;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

          <!-- Logo header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#6366F1,#8B5CF6);border-radius:14px;padding:12px 16px;display:inline-block;">
                    <span style="font-size:20px;font-weight:900;color:white;letter-spacing:-0.5px;">⚡ LIFE OS</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background:#111827;border:1px solid #1F2937;border-radius:24px;padding:48px 40px;text-align:center;">

              <!-- Icon -->
              <div style="display:inline-block;background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15));border:1px solid rgba(99,102,241,0.3);border-radius:20px;padding:20px;margin-bottom:28px;">
                <span style="font-size:40px;">✉️</span>
              </div>

              <!-- Title -->
              <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px;">
                Halo, ${firstName}! 👋
              </h1>
              <p style="margin:0 0 32px;font-size:15px;color:#6B7280;line-height:1.7;">
                Terima kasih sudah bergabung dengan <strong style="color:#8B5CF6;">LIFE OS</strong>.<br/>
                Verifikasi emailmu untuk mulai membangun disiplin dan<br/>
                mencapai potensi tertinggimu.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 32px;">
                <tr>
                  <td align="center" style="background:linear-gradient(135deg,#6366F1,#8B5CF6);border-radius:14px;padding:0;">
                    <a href="${verificationLink}"
                      target="_blank"
                      style="display:inline-block;padding:16px 40px;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;letter-spacing:0.3px;border-radius:14px;">
                      ✅ Verifikasi Email Saya
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <div style="border-top:1px solid #1F2937;margin:32px 0;"></div>

              <!-- Features teaser -->
              <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:#374151;letter-spacing:2px;text-transform:uppercase;">
                Yang menantimu di LIFE OS
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td width="33%" style="text-align:center;padding:8px;">
                    <div style="font-size:22px;margin-bottom:4px;">🏆</div>
                    <div style="font-size:11px;color:#6B7280;font-weight:600;">Sistem Liga<br/>Gamifikasi XP</div>
                  </td>
                  <td width="33%" style="text-align:center;padding:8px;">
                    <div style="font-size:22px;margin-bottom:4px;">🕌</div>
                    <div style="font-size:11px;color:#6B7280;font-weight:600;">Jadwal Sholat<br/>Realtime</div>
                  </td>
                  <td width="33%" style="text-align:center;padding:8px;">
                    <div style="font-size:22px;margin-bottom:4px;">🎯</div>
                    <div style="font-size:11px;color:#6B7280;font-weight:600;">Fokus Pomodoro<br/>& Duel Arena</div>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <div style="border-top:1px solid #1F2937;margin:0 0 24px;"></div>

              <!-- Link fallback -->
              <p style="margin:0 0 8px;font-size:12px;color:#4B5563;line-height:1.6;">
                Jika tombol di atas tidak berfungsi, salin link ini ke browser:
              </p>
              <p style="margin:0;font-size:11px;word-break:break-all;">
                <a href="${verificationLink}" style="color:#6366F1;text-decoration:underline;">${verificationLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0 0 8px;font-size:12px;color:#374151;">
                Email ini dikirim ke akun yang baru didaftarkan di LIFE OS.
              </p>
              <p style="margin:0;font-size:11px;color:#1F2937;">
                Jika kamu tidak mendaftar, abaikan email ini.
              </p>
              <p style="margin:16px 0 0;font-size:12px;color:#374151;">
                <a href="${appUrl}" style="color:#6366F1;text-decoration:none;">LIFE OS</a>
                &nbsp;·&nbsp; Personal Discipline &amp; Productivity System
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
