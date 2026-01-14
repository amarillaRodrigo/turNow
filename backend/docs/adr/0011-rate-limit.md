# 11. rate-limit

Date: 2026-01-13

## Status

Accepted

## Context

El constante ataque y fuga de datos en miles de sistemas motiva la necesidad de implementar mecanismos adicionales de seguridad


## Decision

implementamos un middleware de rate-limiting en el backend para limitar la cantidad de solicitudes que un usuario o IP puede hacer en un periodo de tiempo determinado.

## Consequences

Sera mas dificil para atacantes ejecutar scripts automatizados para explotar vulnerabilidades en la aplicacion. Esto evita la fuga masiva de datos y protege la integridad del sistema.