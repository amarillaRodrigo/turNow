# ADR-005: Manejo centralizado de errores con middleware

## Estado
Aceptado

## Fecha
2026-01-12

## Contexto
Sin manejo centralizado, los errores se manejan inconsistentemente en cada ruta y no se logean adecuadamente.

## Decisión
Implementar:

1. **Clase `ApiError`**: Para errores esperados con código HTTP
```typescript
export class ApiError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
  }
}
```

2. **Middleware `errorHandler`**: Captura todos los errores
```typescript
export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    logger.warn(`API Error: ${err.message}`, { statusCode: err.statusCode });
    return res.status(err.statusCode).json({ message: err.message });
  }
  logger.error('Unhandled Error', { error: String(err), stack: err.stack });
  return res.status(500).json({ message: 'Internal Server Error' });
}
```

## Consecuencias

### Positivas
- ✅ Consistencia en respuestas de error
- ✅ Logs automáticos de todos los errores
- ✅ Separa errores esperados de bugs
- ✅ No expone stack traces al cliente en producción
- ✅ DRY: no repetir try-catch en cada ruta

### Negativas
- ❌ Requiere throw new ApiError en lugar de res.status().json()

## Alternativas consideradas
1. **Try-catch en cada ruta**: Repetitivo y propenso a olvidos.
2. **Middleware por ruta**: Menos centralizado.

## Referencias
- [Express Error Handling](https://expressjs.com/en/guide/error-handling.html)