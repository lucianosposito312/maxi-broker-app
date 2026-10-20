# Maxi Broker — web y academia

Proyecto original de Maximiliano González: React + Vite, conectado al proyecto Supabase existente **Maximiliano Broker**.

## Desarrollo local

1. Usar Node.js 22 o una versión soportada por Vite 7.
2. Ejecutar `npm ci`.
3. Copiar `.env.example` a `.env` y completar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
4. Ejecutar `npm run dev`; para validar producción, `npm run build`.

## Despliegue en Vercel

- Instalación: `npm ci`
- Build: `npm run build`
- Directorio de salida: `dist`
- Variables del frontend: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`, configuradas en el panel de Vercel.
- `vercel.json` conserva las rutas de React Router al recargar páginas internas.

No se versionan `.env`, `node_modules/` ni `dist/`. Nunca incluyas claves privadas, `service_role` ni el token privado de Mercado Pago en código de navegador, GitHub o variables con prefijo `VITE_`. Ver `MIGRATION.md` para el detalle.
