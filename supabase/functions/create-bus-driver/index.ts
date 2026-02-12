import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller is admin using their JWT
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller }, error: authError } = await anonClient.auth.getUser();
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: isAdmin } = await anonClient.rpc("has_role", {
      _user_id: caller.id,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const { bus_number, route_name, driver_email, driver_password, driver_name } = await req.json();

    if (!bus_number || !route_name || !driver_email || !driver_password || !driver_name) {
      return new Response(JSON.stringify({ error: "All fields are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role client for admin operations
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check if bus_number already exists
    const { data: existingBus } = await adminClient
      .from("buses")
      .select("id")
      .eq("bus_number", bus_number)
      .maybeSingle();

    if (existingBus) {
      return new Response(JSON.stringify({ error: "Bus number already exists" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Create auth user
    const { data: newUser, error: createUserError } = await adminClient.auth.admin.createUser({
      email: driver_email,
      password: driver_password,
      email_confirm: true,
    });

    if (createUserError) {
      const msg = createUserError.message.includes("already been registered")
        ? "Email already exists"
        : createUserError.message;
      return new Response(JSON.stringify({ error: msg }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = newUser.user.id;

    // 2. Insert bus
    const { data: busData, error: busError } = await adminClient
      .from("buses")
      .insert({ bus_number, route_name, status: "active", driver_name })
      .select("id")
      .single();

    if (busError) {
      // Cleanup: delete the created user
      await adminClient.auth.admin.deleteUser(userId);
      return new Response(JSON.stringify({ error: `Failed to create bus: ${busError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Insert user_role
    const { error: roleError } = await adminClient
      .from("user_roles")
      .insert({ user_id: userId, role: "driver" });

    if (roleError) {
      await adminClient.from("buses").delete().eq("id", busData.id);
      await adminClient.auth.admin.deleteUser(userId);
      return new Response(JSON.stringify({ error: `Failed to assign role: ${roleError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Insert driver record
    const { error: driverError } = await adminClient
      .from("drivers")
      .insert({ user_id: userId, bus_id: busData.id, full_name: driver_name });

    if (driverError) {
      await adminClient.from("user_roles").delete().eq("user_id", userId);
      await adminClient.from("buses").delete().eq("id", busData.id);
      await adminClient.auth.admin.deleteUser(userId);
      return new Response(JSON.stringify({ error: `Failed to create driver: ${driverError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        bus_id: busData.id,
        driver_user_id: userId,
        message: "Bus and Driver account created successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
