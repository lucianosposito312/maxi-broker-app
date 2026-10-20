# Migración del proyecto original Maxi Broker a Vercel

- El frontend conserva la estructura React + Vite del proyecto original.
- Usa el Supabase existente **Maximiliano Broker**, proyecto `veumbiuduznfnrumkukf`; no crea ni migra otra base.
- Los dos videos de portada/bienvenida se optimizaron y ahora se sirven desde `/public/assets`, sin depender del dominio anterior.
- `vercel.json` configura el fallback de rutas para React Router.
- `.env`, `node_modules/` y `dist/` quedan excluidos de Git. No subas secretos.
- Variables públicas necesarias en Vercel: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- El token privado `MERCADO_PAGO_ACCESS_TOKEN` y cualquier `SUPABASE_SERVICE_ROLE_KEY` deben seguir exclusivamente en Supabase Edge Function Secrets; jamás en el frontend.
- No ejecutar automáticamente los scripts SQL antiguos. La base remota original no se modifica con esta migración.
