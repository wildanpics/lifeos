import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { adminAuth } from '@/lib/firebase/admin';
import { getVerificationEmailHtml } from '@/lib/email/verificationTemplate';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, displayName } = await req.json();

    if (!email || !displayName) {
      return NextResponse.json(
        { error: 'Email dan displayName harus diisi.' },
        { status: 400 }
      );
    }

    // Determine app URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
      (req.headers.get('origin') ?? 'http://localhost:3000');

    // Generate Firebase email verification link (server-side via Admin SDK)
    const verificationLink = await adminAuth.generateEmailVerificationLink(email, {
      url: `${appUrl}/login`,
    });

    // Send beautiful HTML email via Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'LIFE OS <onboarding@resend.dev>',
      to: [email],
      subject: '✅ Verifikasi Email LIFE OS Kamu',
      html: getVerificationEmailHtml({
        displayName,
        verificationLink,
        appUrl,
      }),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Gagal mengirim email. Coba lagi.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (err: any) {
    console.error('send-verification error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
