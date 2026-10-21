import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin",
}
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN")
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { ...corsHeaders, "Content-Type": "application/json" },
})

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405)
  try {
    if (!MERCADO_PAGO_ACCESS_TOKEN) throw new Error("El servicio de pagos no está configurado. Contactá al administrador.")
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("La conexión segura con la Academia no está configurada.")
    const { courseId, userId, userEmail, returnUrl } = await req.json()
    if (!courseId || !userId || !userEmail || !returnUrl) return json({ error: "Faltan datos para iniciar el pago." }, 400)

    const parsedReturnUrl = new URL(returnUrl)
    const isLocalhost = ["localhost", "127.0.0.1"].includes(parsedReturnUrl.hostname)
    if ((!isLocalhost && parsedReturnUrl.protocol !== "https:") ||
        (!isLocalhost && !parsedReturnUrl.hostname.endsWith(".vercel.app"))) {
      return json({ error: "El sitio de retorno no es válido." }, 400)
    }

    const courseResponse = await fetch(
      `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/courses?id=eq.${encodeURIComponent(String(courseId))}&select=id,title,price,is_free,status&limit=1`,
      { headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } },
    )
    if (!courseResponse.ok) throw new Error("No pudimos consultar el curso. Intentá nuevamente.")
    const courses = await courseResponse.json()
    const course = courses?.[0]
    if (!course || course.status !== "active") return json({ error: "Este curso no está disponible para la compra." }, 404)
    const price = Number(course.price)
    if (course.is_free || !Number.isFinite(price) || price <= 0) return json({ error: "Este curso no requiere un pago." }, 400)

    const preferenceResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}` },
      body: JSON.stringify({
        items: [{ id: String(course.id), title: String(course.title), quantity: 1, unit_price: price, currency_id: "ARS" }],
        payer: { email: String(userEmail).trim().toLowerCase() },
        back_urls: {
          success: returnUrl,
          failure: `${returnUrl}&status=failure`,
          pending: `${returnUrl}&status=pending`,
        },
        auto_return: "approved",
        external_reference: `${userId}___${courseId}`,
      }),
    })
    const data = await preferenceResponse.json()
    if (!preferenceResponse.ok) {
      console.error("[create-payment-preference] Mercado Pago rejected preference:", data?.message || preferenceResponse.status)
      return json({ error: "Mercado Pago no pudo iniciar el pago. Revisá los datos del curso e intentá nuevamente." }, 502)
    }
    if (!data.id || !data.init_point) throw new Error("Mercado Pago no devolvió el enlace de pago.")
    return json({ id: data.id, init_point: data.init_point })
  } catch (error) {
    console.error("[create-payment-preference] Error:", error instanceof Error ? error.message : "unknown error")
    return json({ error: error instanceof Error ? error.message : "No pudimos iniciar el pago." }, 500)
  }
})
