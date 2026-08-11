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
    const { email, name, password, role, phone, adminEmail, adminPassword } = await req.json();

    if (!email || !name || !password || !role) {
      return new Response(
        JSON.stringify({ error: "Email, name, password, and role are required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!adminEmail || !adminPassword) {
      return new Response(
        JSON.stringify({ error: "Admin credentials are required to create staff users" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!['Owner', 'Admin', 'Property Advisor'].includes(role)) {
      return new Response(
        JSON.stringify({ error: "Invalid role. Must be Owner, Admin, or Property Advisor" }),
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: admin, error: adminError } = await supabase
      .from("users")
      .select("id, email, role, password_hash")
      .eq("email", adminEmail)
      .in("role", ["Owner", "Admin"])
      .maybeSingle();

    if (adminError || !admin || !admin.password_hash) {
      return new Response(
        JSON.stringify({ error: "Invalid admin credentials" }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const adminPasswordHash = await hashPassword(adminPassword);
    const isValidAdminPassword = adminPasswordHash === admin.password_hash;
    
    if (!isValidAdminPassword) {
      return new Response(
        JSON.stringify({ error: "Invalid admin credentials" }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { data: existingUser } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "A user with this email already exists" }),
        {
          status: 409,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const passwordHash = await hashPassword(password);
    const avatar = name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2);

    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        email,
        name,
        role,
        phone: phone || null,
        avatar,
        password_hash: passwordHash,
        force_password_change: false,
      })
      .select("id, email, name, role")
      .single();

    if (createError) {
      throw createError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Staff user created successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      }),
      {
        status: 201,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error creating staff user:", error);
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