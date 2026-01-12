# ADR-007: Pre-commit hooks con Husky y lint-staged

## Estado
Aceptado

## Fecha
2026-01-12

## Contexto
Sin automatización, el código puede commitearse sin pasar linting/formatting.

## Decisión
Usar Husky + lint-staged para ejecutar automáticamente:
- ESLint con `--fix`
- Prettier con `--write`

Solo en archivos modificados antes de cada commit.

```json
{
  "lint-staged": {
    "*.ts": ["eslint --fix", "prettier --write"]
  }
}
```

## Consecuencias

### Positivas
- ✅ Code quality garantizado
- ✅ Sin necesidad de CI/CD para linting
- ✅ Consistencia de estilo automática
- ✅ Feedback inmediato

### Negativas
- ❌ Commits más lentos (segundos)
- ❌ Puede ser frustrante si hay muchos errores

## Alternativas consideradas
1. **CI/CD only**: Feedback tardío.
2. **Manual**: Propenso a olvidos.
3. **Git hooks manuales**: Difícil de mantener.

## Referencias
- [Husky](https://typicode.github.io/husky/)
- [lint-staged](https://github.com/okonet/lint-staged)