# ADR-003: Variables de entorno centralizadas en env.ts

## Estado
Aceptado

## Fecha
2026-01-12

## Contexto
Acceder directamente a `process.env` en el código dispersa la configuración y dificulta validación y refactoring.

## Decisión
Crear archivo único `src/shared/config/env.ts` que:
- Lee variables de `process.env`
- Aplica valores por defecto
- Transforma tipos (ej: string a number)
- Exporta objeto `env` tipado

```typescript
export const env = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret',
  DATABASE_URL: process.env.DATABASE_URL || '',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:5173'],
};
```

## Consecuencias

### Positivas
- ✅ Single source of truth
- ✅ Fácil validación en un solo lugar
- ✅ Refactoring seguro (TypeScript detecta usos)
- ✅ Mejor DX con autocomplete
- ✅ Transformaciones consistentes

### Negativas
- ❌ Un archivo más para mantener
- ❌ Debe importarse antes de usar variables

## Alternativas consideradas
1. **Acceso directo a process.env**: Simple pero propenso a errores.
2. **Librerías como envalid/dotenv-safe**: Agregan dependencias extra.

## Referencias
- [Twelve-Factor App: Config](https://12factor.net/config)