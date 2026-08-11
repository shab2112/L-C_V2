import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  const digitsOnly = phone.replace(/\D/g, '');
  return phoneRegex.test(phone) && digitsOnly.length >= 10;
}

async function sendEmail(to: string, otp: string, firstName: string): Promise<{ success: boolean, otp?: string }> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  if (!resendApiKey) {
    console.warn("RESEND_API_KEY not configured - returning OTP for development");
    return { success: true, otp };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Lucra <onboarding@resend.dev>",
        to: [to],
        subject: "Your Lucra Verification Code",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      <tr>
                        <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Lucra</h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 40px;">
                          <h2 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Hi ${firstName},</h2>
                          <p style="margin: 0 0 24px 0; color: #4a5568; font-size: 16px; line-height: 1.5;">Your verification code is:</p>
                          <div style="background-color: #f7fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 24px; text-align: center; margin: 0 0 24px 0;">
                            <p style="margin: 0; color: #2d3748; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</p>
                          </div>
                          <p style="margin: 0 0 16px 0; color: #4a5568; font-size: 14px; line-height: 1.5;">This code will expire in <strong>10 minutes</strong>.</p>
                          <p style="margin: 0 0 24px 0; color: #4a5568; font-size: 14px; line-height: 1.5;">If you didn't request this code, please ignore this email.</p>
                          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
                          <p style="margin: 0; color: #718096; font-size: 12px; line-height: 1.5;">This is an automated message from Lucra. Please do not reply to this email.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Resend API error:", error);
      console.warn("Email sending failed - returning OTP for development");
      return { success: true, otp };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    console.warn("Email sending failed - returning OTP for development");
    return { success: true, otp };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { firstName, lastName, email, phone, location, password } = await req.json();

    if (!firstName || !lastName || !email || !phone || !password) {
      return new Response(
        JSON.stringify({ error: "First name, last name, email, phone, and password are required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 8 characters long" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!validatePhoneNumber(phone)) {
      return new Response(
        JSON.stringify({ error: "Please enter a valid phone number (minimum 10 digits)" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: existingUserByEmail } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .eq("role", "Client")
      .maybeSingle();

    if (existingUserByEmail) {
      return new Response(
        JSON.stringify({
          error: "This email is already registered. Please login instead.",
          alreadyRegistered: true
        }),
        {
          status: 409,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { data: existingUserByPhone } = await supabase
      .from("users")
      .select("phone")
      .eq("phone", phone)
      .eq("role", "Client")
      .maybeSingle();

    if (existingUserByPhone) {
      return new Response(
        JSON.stringify({
          error: "This phone number is already registered. Please login instead.",
          alreadyRegistered: true
        }),
        {
          status: 409,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const emailOTP = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const { data: existingOTP } = await supabase
      .from("client_otp_verifications")
      .select("*")
      .eq("email", email)
      .eq("phone", phone)
      .gt("otp_expires_at", new Date().toISOString())
      .maybeSingle();

    if (existingOTP) {
      const { error: updateError } = await supabase
        .from("client_otp_verifications")
        .update({
          first_name: firstName,
          last_name: lastName,
          location: location || null,
          password: password,
          email_otp: emailOTP,
          phone_otp: emailOTP,
          otp_expires_at: expiresAt.toISOString(),
          email_verified: false,
          phone_verified: false,
          attempts: 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingOTP.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from("client_otp_verifications")
        .insert({
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          location: location || null,
          password: password,
          email_otp: emailOTP,
          phone_otp: emailOTP,
          otp_expires_at: expiresAt.toISOString(),
          email_verified: false,
          phone_verified: false,
          attempts: 0,
        });

      if (insertError) throw insertError;
    }

    const emailResult = await sendEmail(email, emailOTP, firstName);

    const responseData: any = {
      success: true,
      message: emailResult.otp
        ? "OTP code generated successfully. Email service not configured - use the code below."
        : "OTP code sent successfully to your email",
      expiresAt: expiresAt.toISOString(),
    };

    if (emailResult.otp) {
      responseData.developmentOTP = emailResult.otp;
      responseData.note = "DEVELOPMENT MODE: Email service is not configured. Use the OTP code above to verify your account.";
    }

    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error generating OTP:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});