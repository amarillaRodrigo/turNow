# ADR-008: CORS con whitelist dinámico desde variables de entorno

## Estado
Aceptado

## Fecha
2026-01-12

## Contexto
CORS es necesario para permitir requests desde el frontend en navegadores, pero debe ser seguro.

## Decisión
Configurar CORS con:
- Whitelist de orígenes desde `ALLOWED_ORIGINS` en `.env`
- `credentials: true` para soportar JWT en headers
- Permitir requests sin origin (Postman, mobile apps)

```typescript
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (env.ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

## Consecuencias

### Positivas
- ✅ Seguridad: solo orígenes autorizados
- ✅ Flexible entre dev/staging/prod
- ✅ Soporta autenticación con JWT
- ✅ Permite testing con Postman

### Negativas
- ❌ Requiere actualizar `.env` al cambiar dominios
- ❌ Error CORS puede confundir a desarrolladores nuevos

## Alternativas consideradas
1. **origin: '*'**: Inseguro en producción.
2. **Sin CORS**: Bloquea requests desde browsers.
3. **Hardcoded origins**: No flexible entre ambientes.

## Referencias
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS Middleware](https://expressjs.com/en/resources/middleware/cors.html)