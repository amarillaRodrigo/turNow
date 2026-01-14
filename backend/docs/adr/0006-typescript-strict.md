# ADR-006: TypeScript con configuración estricta

## Estado
Aceptado

## Fecha
2026-01-12

## Contexto
TypeScript puede configurarse con diferentes niveles de strictness. Necesitábamos balance entre seguridad y productividad.

## Decisión
Usar configuración estricta en `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true
  }
}
```

## Consecuencias

### Positivas
- ✅ Detecta errores en tiempo de compilación
- ✅ Mejor autocomplete y DX
- ✅ Código más seguro y mantenible
- ✅ Menos bugs en runtime

### Negativas
- ❌ Más verbose (requiere tipos explícitos)
- ❌ Curva de aprendizaje inicial

## Alternativas consideradas
1. **Configuración laxa**: Más rápida pero más bugs.
2. **Sin TypeScript**: Simple pero propenso a errores.

## Referencias
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)