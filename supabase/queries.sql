-- ==============================================================================
-- QUERIES DE UTILIDAD Y DEBUGGING
-- ==============================================================================

-- 1. Verificar últimas ventas con sus detalles
SELECT 
    v.id as venta_id, 
    v.created_at, 
    v.total, 
    d.cantidad, 
    d.descripcion, 
    p.nombre as producto_nombre
FROM public.ventas v
JOIN public.detalle_ventas d ON v.id = d.venta_id
LEFT JOIN public.productos p ON d.producto_id = p.id
ORDER BY v.created_at DESC
LIMIT 20;

-- 2. Verificar Stock Bajo
SELECT * FROM public.productos WHERE stock_actual < 5;

-- 3. Resetear una tabla (CUIDADO: Borra datos)
-- TRUNCATE public.detalle_ventas, public.ventas RESTART IDENTITY;
