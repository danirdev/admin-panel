-- ==============================================================================
-- CONFIGURACIÓN DE STORAGE (IMAGENES)
-- ==============================================================================

-- 1. Crear el bucket 'productos_img' si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('productos_img', 'productos_img', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de Seguridad (RLS) para Storage
-- IMPORTANTE: Habilitar RLS en la tabla objects de storage (se hace una sola vez)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- LIMPIAR POLÍTICAS ANTIGUAS (Para evitar duplicados si se corre de nuevo)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;

-- A. Acceso Público para ver imágenes (Cualquiera puede ver)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'productos_img' );

-- B. Acceso Total para usuarios autenticados (Admin)
-- Permitir subir (INSERT)
CREATE POLICY "Auth Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'productos_img' );

-- Permitir actualizar (UPDATE)
CREATE POLICY "Auth Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'productos_img' );

-- Permitir borrar (DELETE)
CREATE POLICY "Auth Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'productos_img' );
