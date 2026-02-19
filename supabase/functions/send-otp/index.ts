import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import nodemailer from 'npm:nodemailer@6.9.14';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Check if email already has an account
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const emailExists = existingUsers?.users?.some(u => u.email?.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return new Response(JSON.stringify({ error: 'This email is already in use.' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in DB (delete any old ones for this email first)
    await supabase.from('email_otp_codes').delete().eq('email', email.toLowerCase());
    await supabase.from('email_otp_codes').insert({
      email: email.toLowerCase(),
      code,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 32px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #ef4444; font-size: 28px; letter-spacing: 4px; margin: 0;">FITFORGE</h1>
          <p style="color: #888; margin: 8px 0 0;">Email Verification</p>
        </div>
        <p style="color: #ccc; margin-bottom: 24px;">Your verification code is:</p>
        <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 40px; font-weight: bold; letter-spacing: 8px; color: #ef4444;">${code}</span>
        </div>
        <p style="color: #888; font-size: 12px;">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    `;

    const GMAIL_APP_PASSWORD = Deno.env.get('GMAIL_APP_PASSWORD');

    if (GMAIL_APP_PASSWORD) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'verify.fitforge@gmail.com',
          pass: GMAIL_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: '"FitForge" <verify.fitforge@gmail.com>',
        to: email,
        subject: `${code} is your FitForge verification code`,
        html: emailBody,
      });
    } else {
      console.log(`[DEV] OTP for ${email}: ${code}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
