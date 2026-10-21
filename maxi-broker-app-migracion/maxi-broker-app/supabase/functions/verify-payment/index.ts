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
const restHeaders = () => ({
  apikey: SUPABASE_SERVICE_ROLE_KEY || "",
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY || ""}`,
  "Content-Type": "application/json",
})
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { ...corsHeaders, "Content-Type": "application/json" },
})
const errorMessage = (error: unknown) => error instanceof Error ? error.message : "No se pudo verificar el pago."

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405)
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !MERCADO_PAGO_ACCESS_TOKEN) {
      throw new Error("El servicio de verificación no está configurado. Contactá al administrador.")
    }
    const { paymentId, courseId, userId } = await req.json()
    if (!paymentId || !/^\d+$/.test(String(paymentId)) || !courseId || !userId) {
      return json({ error: "Los datos de la operación son incompletos o inválidos." }, 400)
    }

    const baseUrl = SUPABASE_URL.replace(/\/$/, "")
    const courseResponse = await fetch(
      `${baseUrl}/rest/v1/courses?id=eq.${encodeURIComponent(String(courseId))}&select=id,title,price,is_free&limit=1`,
      { headers: restHeaders() },
    )
    if (!courseResponse.ok) throw new Error("No pudimos comprobar el curso asociado al pago.")
    const courses = await courseResponse.json()
    const course = courses?.[0]
    if (!course || course.is_free || !Number.isFinite(Number(course.price))) {
      return json({ error: "El curso asociado a esta operación no es válido." }, 400)
    }

    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(String(paymentId))}`, {
      headers: { Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}` },
    })
    const payment = await paymentResponse.json()
    if (!paymentResponse.ok) {
      console.error("[verify-payment] Mercado Pago lookup failed:", paymentResponse.status)
      return json({ error: "Mercado Pago todavía no permite consultar esta operación." }, 502)
    }
    if (String(payment.external_reference || "") !== `${userId}___${courseId}`) {
      return json({ error: "El pago no coincide con el usuario y el curso de esta sesión." }, 403)
    }
    if (payment.status !== "approved") {
      const normalizedStatus = ["pending", "in_process", "authorized"].includes(payment.status) ? payment.status : "rejected"
      return json({ success: false, status: normalizedStatus })
    }

    const expectedAmount = Number(Number(course.price).toFixed(2))
    const paidAmount = Number(Number(payment.transaction_amount).toFixed(2))
    if (payment.currency_id !== "ARS" || !Number.isFinite(paidAmount) || paidAmount !== expectedAmount) {
      console.error("[verify-payment] Approved payment amount/currency does not match course pricing.")
      return json({ error: "El monto confirmado no coincide con el precio del curso. Contactá al soporte antes de volver a pagar." }, 409)
    }

    const filters = `user_id=eq.${encodeURIComponent(String(userId))}&course_id=eq.${encodeURIComponent(String(courseId))}`
    const enrollmentLookup = await fetch(`${baseUrl}/rest/v1/enrollments?${filters}&select=id,payment_status&limit=10`, { headers: restHeaders() })
    if (!enrollmentLookup.ok) throw new Error("No pudimos consultar la inscripción del alumno.")
    const enrollments = await enrollmentLookup.json()
    const now = new Date().toISOString()
    const paidFields = { payment_status: "paid", payment_id: String(payment.id), paid_at: now, updated_at: now }

    if (Array.isArray(enrollments) && enrollments.length > 0) {
      const updateResponse = await fetch(`${baseUrl}/rest/v1/enrollments?${filters}`, {
        method: "PATCH",
        headers: { ...restHeaders(), Prefer: "return=minimal" },
        body: JSON.stringify(paidFields),
      })
      if (!updateResponse.ok) throw new Error("No pudimos habilitar la inscripción luego de verificar el pago.")
    } else {
      const insertResponse = await fetch(`${baseUrl}/rest/v1/enrollments`, {
        method: "POST",
        headers: { ...restHeaders(), Prefer: "return=minimal" },
        body: JSON.stringify({ user_id: String(userId), course_id: String(courseId), ...paidFields, created_at: now }),
      })
      if (!insertResponse.ok) throw new Error("No pudimos registrar la inscripción verificada.")
    }
    return json({ success: true, status: "approved", enrollment: "paid" })
  } catch (error) {
    console.error("[verify-payment] Error:", errorMessage(error))
    return json({ error: errorMessage(error) }, 500)
  }
})
