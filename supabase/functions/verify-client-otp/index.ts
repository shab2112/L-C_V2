import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { firstName, lastName, email, phone, location, password, emailOTP } = await req.json();

    if (!email || !phone || !emailOTP) {
      return new Response(
        JSON.stringify({ error: "Email, phone, and OTP code are required" }),
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

    const { data: otpRecord, error: fetchError } = await supabase
      .from("client_otp_verifications")
      .select("*")
      .eq("email", email)
      .eq("phone", phone)
      .gt("otp_expires_at", new Date().toISOString())
      .maybeSingle();

    if (fetchError || !otpRecord) {
      return new Response(
        JSON.stringify({ error: "OTP not found or expired. Please request a new OTP." }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (otpRecord.attempts >= 5) {
      return new Response(
        JSON.stringify({ error: "Maximum verification attempts exceeded. Please request a new OTP." }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const emailMatches = otpRecord.email_otp === emailOTP;

    if (!emailMatches) {
      await supabase
        .from("client_otp_verifications")
        .update({
          attempts: otpRecord.attempts + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", otpRecord.id);

      return new Response(
        JSON.stringify({
          error: "Invalid OTP code",
          attemptsRemaining: 5 - (otpRecord.attempts + 1),
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    await supabase
      .from("client_otp_verifications")
      .update({
        email_verified: true,
        phone_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", otpRecord.id);

    let userId: string | null = null;
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, role")
      .eq("email", email)
      .maybeSingle();

    const finalFirstName = firstName || otpRecord.first_name;
    const finalLastName = lastName || otpRecord.last_name;
    const finalLocation = location || otpRecord.location;
    const finalPassword = password || otpRecord.password;

    const passwordHash = await hashPassword(finalPassword);

    if (existingUser) {
      userId = existingUser.id;

      await supabase
        .from("users")
        .update({
          first_name: finalFirstName,
          last_name: finalLastName,
          phone,
          location: finalLocation,
          password_hash: passwordHash,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    } else {
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          email,
          phone,
          first_name: finalFirstName,
          last_name: finalLastName,
          location: finalLocation,
          password_hash: passwordHash,
          role: 'Client',
          avatar_url: `${finalFirstName.charAt(0)}${finalLastName.charAt(0)}`.toUpperCase(),
        })
        .select("id")
        .single();

      if (createError) throw createError;
      userId = newUser.id;

      const { error: clientError } = await supabase
        .from("clients")
        .insert({
          user_id: userId,
        });

      if (clientError) throw clientError;
    }

    await supabase
      .from("client_otp_verifications")
      .delete()
      .eq("id", otpRecord.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "OTP verified successfully",
        userId,
        email,
        phone,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error verifying OTP:", error);
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