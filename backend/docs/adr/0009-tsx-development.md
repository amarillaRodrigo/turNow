# ADR-009: tsx para desarrollo en lugar de ts-node-dev

## Estado
Aceptado

## Fecha
2026-01-12

## Contexto
`ts-node-dev` tiene problemas con ESM y `type: "module"`, causando errores al ejecutar en desarrollo.

## Decisión
Usar `tsx` como runtime de desarrollo:
```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts"
  }
}
```

## Consecuencias

### Positivas
- ✅ Soporte completo para ESM
- ✅ Más rápido que ts-node
- ✅ Hot reload confiable
- ✅ Mantenido activamente

### Negativas
- ❌ Menos conocido que ts-node

## Alternativas consideradas
1. **ts-node-dev**: No funciona bien con ESM.
2. **ts-node con --esm**: Funciona pero más lento.
3. **nodemon + tsc --watch**: Más complejo de configurar.

## Referencias
- [tsx GitHub](https://github.com/esbuild-kit/tsx)