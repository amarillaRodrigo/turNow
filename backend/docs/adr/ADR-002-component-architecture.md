# ADR-002: Arquitectura en capas por componentes

## Estado
Aceptado

## Fecha
2026-01-12

## Contexto
Necesitábamos una estructura escalable que facilite agregar nuevas features sin que el código se vuelva inmanejable.

## Decisión
Cada componente de negocio tiene su propia carpeta con subcarpetas:
```
components/[feature]/
├── api/          # Rutas y controladores Express
├── data-access/  # Queries y mutaciones a DB
├── domain/       # Lógica de negocio pura
├── validators/   # Esquemas de validación
└── index.ts      # Exports públicos
```

Componentes actuales: `auth`, `appointments`, `professionals`, `services`, `clients`, `availability`.

## Consecuencias

### Positivas
- ✅ Fácil de escalar horizontalmente (agregar features)
- ✅ Clara separación de responsabilidades
- ✅ Facilita testing unitario e integración
- ✅ Permite equipos trabajando en paralelo
- ✅ Reduce acoplamiento entre módulos

### Negativas
- ❌ Más archivos y carpetas (overhead inicial)
- ❌ Puede ser excesivo para proyectos pequeños

## Alternativas consideradas
1. **Estructura por tipo** (`/routes`, `/controllers`, `/models`): Dificulta escalar cuando crece el proyecto.
2. **Monolito plano**: Simple pero no escala.
3. **Microservicios**: Demasiado complejo para el scope actual.

## Referencias
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Vertical Slice Architecture](https://jimmybogard.com/vertical-slice-architecture/)