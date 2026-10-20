import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN")

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    if (!MERCADO_PAGO_ACCESS_TOKEN) {
      throw new Error("MERCADO_PAGO_ACCESS_TOKEN no está configurado")
    }

    const { courseId, courseTitle, price, userId, userEmail, returnUrl } = await req.json()

    console.log("[Edge Function] Creating preference for:", { courseId, courseTitle, price, userEmail })

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items: [
          {
            id: courseId,
            title: courseTitle,
            quantity: 1,
            unit_price: Number(price),
            currency_id: "ARS",
          }
        ],
        payer: {
          email: userEmail,
        },
        back_urls: {
          success: returnUrl,
          failure: `${returnUrl}&status=failure`,
          pending: `${returnUrl}&status=pending`,
        },
        external_reference: `${userId}___${courseId}`,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[Edge Function] Mercado Pago Error:", data)
      throw new Error(data.message || "Error al crear preferencia en Mercado Pago")
    }

    console.log("[Edge Function] Preference created:", data.id)

    return new Response(
      JSON.stringify({ id: data.id, init_point: data.init_point }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("[Edge Function] Error:", error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
