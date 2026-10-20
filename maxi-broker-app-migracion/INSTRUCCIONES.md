# Migración Maxi Broker — proyecto original

El paquete conserva la app React + Vite, mantiene Supabase **Maximiliano Broker** como backend original y optimiza los dos videos del sitio. No contiene el `.env` local, `node_modules/` ni `dist/`.

## 1. Publicar el código en GitHub

1. Extraé `maxi-broker-app-migracion.zip`.
2. Abrí una terminal dentro de `maxi-broker-app-migracion/maxi-broker-app` (la carpeta donde está `package.json`).
3. Confirmá que Git en esa computadora tenga acceso a tu cuenta GitHub.
4. Ejecutá `../PUSH_TO_GITHUB.sh`, o estos comandos manualmente:

   ```bash
   git init -b main
   git remote add origin https://github.com/lucianosposito312/maxi-broker-app.git
   git add .
   git commit -m "Migrate original Maxi Broker to Vercel"
   git push -u origin main
   ```

   Si ya existe `origin`, usá `git remote set-url origin https://github.com/lucianosposito312/maxi-broker-app.git`.

## 2. Conectar el repositorio a Vercel

El proyecto de Vercel `maxi-broker-app` ya está creado y tiene las variables de Supabase configuradas. La conexión GitHub automática no se pudo completar desde la integración por un error de permisos de Vercel; por eso el proyecto aún no tiene un despliegue ni un dominio activo.

Después de hacer `git push`:

1. Abrí Vercel y entrá al proyecto **maxi-broker-app**.
2. Abrí **Settings → Git → Connect Git Repository**.
3. Elegí `lucianosposito312/maxi-broker-app` y la rama de producción `main`.
4. Guardá los cambios y verificá el primer build en **Deployments**.

El proyecto ya está configurado con `npm ci`, `npm run build`, directorio de salida `dist`, y la protección SSO limitada a previews. Una vez conectado y desplegado, Vercel debe asignar el dominio `maxi-broker-app.vercel.app`.

## 3. Supabase, pagos y seguridad

- Las variables públicas `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` ya están en Vercel para Production, Preview y Development y apuntan al proyecto original `Maximiliano Broker`.
- No subas `.env` ni compartas credenciales privadas.
- `MERCADO_PAGO_ACCESS_TOKEN` y cualquier `SUPABASE_SERVICE_ROLE_KEY` deben permanecer en Supabase Edge Function Secrets; nunca en variables `VITE_`.
- No se cambiaron las tablas ni los datos de Supabase. Tampoco ejecutes automáticamente `supabase-certificates.sql` ni otros scripts SQL heredados.
- El auditor de Supabase detecta tablas públicas con RLS deshabilitado en la base original. Ese tema requiere una revisión de políticas separada antes de modificar permisos para no romper la Academia ni exponer datos.
