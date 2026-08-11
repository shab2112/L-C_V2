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
    const { email, password } = await req.json();

    console.log("Login attempt for email:", email);

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
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

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, role, password_hash, temp_password, temp_password_expires_at, force_password_change")
      .eq("email", email)
      .maybeSingle();

    if (userError) {
      console.error("Error fetching user:", userError);
    }

    if (user) {
      let isValidPassword = false;
      let requiresPasswordChange = false;

      if (user.temp_password && user.temp_password_expires_at) {
        const expiresAt = new Date(user.temp_password_expires_at);
        if (expiresAt > new Date()) {
          isValidPassword = user.temp_password === password;
          requiresPasswordChange = true;
        }
      }

      if (!isValidPassword && user.password_hash) {
        const passwordHash = await hashPassword(password);
        isValidPassword = passwordHash === user.password_hash;
        requiresPasswordChange = user.force_password_change || false;
      }

      if (isValidPassword) {
        const userType = user.role === "Client" ? "client" : "staff";

        return new Response(
          JSON.stringify({
            success: true,
            message: "Login successful",
            userType,
            userId: user.id,
            email: user.email,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            role: user.role,
            requiresPasswordChange,
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        console.log("Password validation failed for user:", email);
        console.log("Computed hash:", await hashPassword(password));
        console.log("Stored hash:", user.password_hash);
      }
    } else {
      console.log("No user found for email:", email);
    }

    return new Response(
      JSON.stringify({ error: "Invalid email or password" }),
      {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error during unified login:", error);
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