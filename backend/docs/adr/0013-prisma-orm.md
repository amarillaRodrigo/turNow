# 13. prisma-orm

## Estado
Aceptado

## Contexto
Necesitamos una capa de acceso a datos que:
- Proporcione type-safety con TypeScript
- Simplifique migraciones de base de datos
- Integre bien con PostgreSQL/Supabase
- Soporte transacciones y concurrencia

## Decisión
Adoptamos **Prisma ORM v7** como capa de acceso a datos.

### Configuración:
- Cliente Prisma centralizado en `src/shared/db/prisma.ts`
- Configuración en `prisma.config.ts` (Prisma 7)
- Schema en `prisma/schema.prisma`
- Logs habilitados en desarrollo

### Estrategia de repositorios:
- Cada componente tiene su repositorio en `data-access/`
- Soft delete con campo `deletedAt`
- Advisory locks para concurrencia en slots

## Consecuencias

### Positivas:
- Type-safety completo con tipos generados
- Migraciones versionadas
- Queries optimizadas automáticamente
- Prisma Studio para debugging

### Negativas:
- Learning curve para el equipo
- Migraciones deben gestionarse cuidadosamente
- Queries complejas pueden requerir SQL raw

## Alternativas consideradas
- TypeORM: Más verboso, decorators
- Sequelize: Menos type-safety
- Knex.js: Más bajo nivel, sin tipos generados