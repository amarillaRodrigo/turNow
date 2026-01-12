# ADR-001: Usar ESM (ECMAScript Modules) en lugar de CommonJS

## Estado
Aceptado

## Fecha
2026-01-12

## Contexto
Node.js soporta tanto CommonJS (`require`/`module.exports`) como ESM (`import`/`export`). Necesitábamos elegir un sistema de módulos estándar para el proyecto.

## Decisión
Usar ESM con:
- `"type": "module"` en `package.json`
- `"module": "NodeNext"` y `"moduleResolution": "NodeNext"` en `tsconfig.json`
- Imports locales con sufijo `.js` en archivos TypeScript

## Consecuencias

### Positivas
- ✅ Estándar moderno y alineado con el futuro de JavaScript
- ✅ Mejor tree-shaking y optimizaciones en bundlers
- ✅ Sintaxis más clara y consistente con el ecosistema frontend
- ✅ Soporte nativo en navegadores (útil para shared code)

### Negativas
- ❌ Requiere sufijo `.js` en imports locales de TypeScript
- ❌ Algunas librerías legacy no son totalmente compatibles
- ❌ Curva de aprendizaje para desarrolladores acostumbrados a CommonJS

## Alternativas consideradas
1. **CommonJS**: Más compatible pero considerado legacy. TypeScript usa ESM por defecto.
2. **Ambos (híbrido)**: Complejo de mantener y puede causar problemas de interoperabilidad.

## Referencias
- [Node.js ESM Documentation](https://nodejs.org/api/esm.html)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)