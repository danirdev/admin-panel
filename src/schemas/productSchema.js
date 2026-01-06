import { z } from 'zod';

export const productSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  precio_venta: z.coerce.number().min(0.01, "El precio debe ser mayor a 0"),
  precio_costo: z.coerce.number().min(0, "El costo no puede ser negativo").optional().default(0),
  stock_actual: z.coerce.number().int("Debe ser entero").min(0, "El stock no puede ser negativo").optional().default(0),
  stock_minimo: z.coerce.number().int().min(0).optional().default(5),
  categoria: z.string().min(1, "Selecciona una categoría"),
  sku: z.string().optional(),
  imagen_url: z.string().optional().nullable()
});
