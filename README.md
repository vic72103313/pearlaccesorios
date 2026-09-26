# Pearl Accesorios — Guía para dejar todo funcionando

No necesitas saber programar para seguir estos pasos. Hazlos en orden.

## PARTE 1 · Crear la base de datos en Supabase

1. Entra a [supabase.com](https://supabase.com), crea una cuenta (o inicia sesión) y crea un **nuevo proyecto**. Elige una contraseña de base de datos y guárdala.
2. Espera a que el proyecto termine de crearse (1-2 minutos).
3. En el menú de la izquierda entra a **SQL Editor** → **New query**.
4. Abre el archivo `supabase/1_schema.sql` de esta carpeta, copia **todo** su contenido y pégalo en el editor. Presiona **Run**. Esto crea todas las tablas, la seguridad y las funciones necesarias.
5. Ahora crea tu usuario administrador:
   - Ve a **Authentication → Users → Add user**.
   - Escribe el correo y la contraseña que usarás para entrar al panel.
   - Si aparece la opción **"Auto Confirm User"**, actívala.
   - Presiona **Create user**.
6. Abre el archivo `supabase/2_set_admin.sql`, reemplaza `admin@tudominio.com` por el correo que acabas de usar, y pégalo/ejecútalo en el **SQL Editor**. Esto hace que ese usuario sea el administrador principal.

## PARTE 2 · Crear los "buckets" para las fotos

1. En Supabase, ve a **Storage → New bucket**.
2. Crea un bucket llamado exactamente: `product-images` — marca la opción **Public bucket**.
3. Crea un segundo bucket llamado exactamente: `store-assets` — también **Public bucket** (aquí va la imagen del QR).

## PARTE 3 · Conectar la aplicación con tu proyecto

1. En Supabase, ve a **Settings → API**.
2. Copia el valor de **Project URL** y el de **Project API keys → anon / public** (a veces se llama "Publishable key").
3. En esta carpeta del proyecto, busca el archivo `.env.example`, haz una copia y renómbrala a `.env`.
4. Abre `.env` y pega tus dos valores:
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anon
   ```

## PARTE 4 · Probar en tu computadora (opcional)

Si tienes Node.js instalado:
```
npm install
npm run dev
```
Abre la dirección que te muestre (normalmente `http://localhost:5173`).

## PARTE 5 · Publicar en Netlify

1. Sube esta carpeta a un repositorio de GitHub (o arrastra el proyecto directamente a Netlify, en **Sites → Add new site → Deploy manually**, subiendo la carpeta ya compilada — ver abajo).
2. Si conectas GitHub: en Netlify elige **Add new site → Import an existing project**, selecciona tu repositorio.
3. Netlify detectará el archivo `netlify.toml` automáticamente:
   - Comando de build: `npm run build`
   - Carpeta a publicar: `dist`
4. Antes de publicar, ve a **Site settings → Environment variables** en Netlify y agrega las mismas dos variables que pusiste en tu `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Presiona **Deploy site**. En unos minutos tendrás tu link público.

## PARTE 6 · Empezar a usar tu tienda

1. Entra a `tu-sitio.netlify.app/admin/login` con el correo y contraseña que creaste en la Parte 1.
2. Ve a **Configuración** y llena: nombre de la tienda, número de WhatsApp, información de delivery y sube la imagen de tu QR de pago.
3. Ve a **Categorías** y crea tus categorías (Joyas de acero, Collares, Manillas, Ropa, etc.).
4. Ve a **Productos → Nuevo producto**, complétalo, guarda, y luego sube sus fotos.
5. Ve a **Usuarios** si necesitas crear accesos para tus empleados/vendedoras — no necesitas volver a Supabase para esto.

## Resumen rápido

| Dónde | Qué hacer |
|---|---|
| Supabase → SQL Editor | Pegar y ejecutar `1_schema.sql`, luego `2_set_admin.sql` |
| Supabase → Authentication | Crear el usuario administrador |
| Supabase → Storage | Crear buckets `product-images` y `store-assets` (públicos) |
| Supabase → Settings → API | Copiar Project URL y anon key |
| Netlify | Configurar esas 2 variables de entorno y publicar |
| Tu sitio → /admin/login | Entrar y configurar tienda, categorías, productos y usuarios |

### Nota técnica sobre "crear usuarios desde el panel"
Para que puedas crear vendedoras/empleados sin volver a Supabase, el script SQL incluye una función (`create_staff_user`) que crea la cuenta directamente. Es una técnica ampliamente usada, pero no es una función oficial documentada por Supabase, así que si Supabase cambia su estructura interna en el futuro podría requerir un ajuste.
