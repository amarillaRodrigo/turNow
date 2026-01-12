# ADR-004: Logging estructurado con Winston

## Estado
Aceptado

## Fecha
2026-01-12

## Contexto
`console.log` no provee estructura, niveles de severidad ni configuración flexible para producción.

## Decisión
Usar Winston como sistema de logging con:
- Formato JSON para fácil parsing
- Niveles: `info`, `warn`, `error`, `debug`
- Transport a consola (extensible a archivos/servicios externos)
- Timestamp automático

```typescript
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [new winston.transports.Console()],
});
```

**Uso:**
- `logger.info()`: eventos importantes (servidor arrancó, user login)
- `logger.warn()`: errores esperados (validación fallida)
- `logger.error()`: errores críticos (DB down)
- `logger.debug()`: detalles internos (queries, transformaciones)

## Consecuencias

### Positivas
- ✅ Logs estructurados (JSON parseable)
- ✅ Niveles de severidad configurables
- ✅ Fácil integración con ELK, Datadog, CloudWatch
- ✅ Metadata adicional en logs

### Negativas
- ❌ Dependencia extra
- ❌ Requiere import en cada archivo que logea

## Alternativas consideradas
1. **console.log**: Simple pero no escalable.
2. **Pino**: Más rápido pero menos features out-of-the-box.
3. **Bunyan**: Similar a Winston pero menos mantenido.

## Referencias
- [Winston Documentation](https://github.com/winstonjs/winston)