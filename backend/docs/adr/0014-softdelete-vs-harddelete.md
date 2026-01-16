# 14. softDelete-vs-hardDelete

Date: 2026-01-16

## Status

Accepted

## Context

Eliminar profesionales de manera permanente de la base de datos, es decir, hacer hard delete puede llevar a perder información valiosa que podría ser necesaria en el futuro para auditorías, análisis históricos o recuperación de datos.

## Decision

Implementar soft delete usando timestamps en lugar de borrar los registros. 

## Consequences

Los registros que tengan los timestamps en el campo `deletedAt` serán considerados como eliminados por los filtros de las consultas, pero permanecerán en la base de datos para posibles recuperaciones o auditorías futuras.
