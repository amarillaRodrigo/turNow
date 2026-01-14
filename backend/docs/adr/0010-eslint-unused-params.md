# ADR-010: ESLint con regla para parámetros no usados prefijados con _

## Estado
Aceptado

## Fecha
2026-01-12

## Contexto
En middlewares de Express, a veces necesitas parámetros (`req`, `res`, `next`) solo para cumplir la firma, pero no los usas.

## Decisión
Configurar ESLint para ignorar parámetros prefijados con `_`:
```javascript
{
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_' }
    ]
  }
}
```

## Consecuencias

### Positivas
- ✅ Evita warnings innecesarios
- ✅ Claridad de intención (prefijo `_` = "sé que no lo uso")
- ✅ Patrón estándar en TypeScript/JavaScript

### Negativas
- ❌ Puede ocultar variables realmente no usadas si se abusa

## Alternativas consideradas
1. **Desabilitar regla globalmente**: Pierde detección de código muerto.
2. **eslint-disable en cada línea**: Verbose.

## Referencias
- [ESLint no-unused-vars](https://eslint.org/docs/rules/no-unused-vars)