-- =====================================================================
-- PEARL ACCESORIOS · SCRIPT 2 de 2 · CONVERTIR TU USUARIO EN ADMIN
-- =====================================================================
-- Antes de ejecutar esto:
-- 1. Ve a Supabase -> tu proyecto -> Authentication -> Users -> "Add user"
-- 2. Crea el usuario con el correo y la contraseña que tú elijas
--    (marca "Auto Confirm User" si aparece la opción).
-- 3. Reemplaza abajo 'admin@tudominio.com' por ESE MISMO correo.
-- 4. Pega y ejecuta este script en el SQL Editor (Run).
-- =====================================================================

update public.profiles
set role = 'admin'
where email = 'admin@tudominio.com';

-- Verifica que sí quedó como admin (debe mostrar 1 fila con role = admin):
select id, email, role from public.profiles where email = 'admin@tudominio.com';
