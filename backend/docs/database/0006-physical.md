# 06 – Diseño Físico (PostgreSQL)

## 1. Propósito

Este documento define las decisiones de **diseño físico** para la implementación del esnpoquema relacional descrito en `04-logical-design-relational.md`, orientado a **PostgreSQL** y compatible con **Prisma ORM**.

Incluye:

* tipos de datos concretos,
* índices y restricciones,
* reglas implementadas en base de datos versus aplicación,
* y la **estrategia de concurrencia** adoptada para garantizar consistencia con máxima eficiencia.

---

## 2. DBMS objetivo y supuestos

* DBMS: PostgreSQL.
* ORM: Prisma.
* Zona horaria: UTC en persistencia (`timestamptz`).
* Patrón de borrado: soft delete (`deleted_at`) cuando aplique.
* Cargas críticas:

  * lectura frecuente de agenda diaria,
  * creación y reprogramación de turnos bajo concurrencia.

---

## 3. Tipos de datos y convenciones

### 3.1 Claves primarias

* Tipo: `UUID`.
* Generación: por base de datos (`gen_random_uuid()`) o por aplicación.
* Justificación:

  * evita colisiones,
  * facilita escalabilidad,
  * es consistente con prácticas modernas y con Prisma.

### 3.2 Fechas y horas

* Tipo: `timestamptz`.
* Convención: almacenar siempre en UTC; conversión a zona local en la capa de aplicación.

### 3.3 Enteros de dominio

* Duraciones, buffers y capacidades se almacenan como `integer`.
* Validación mediante restricciones `CHECK`.

### 3.4 Datos estructurados

* El campo `payload` en `appointment_event` se almacena como `jsonb` para permitir extensibilidad sin cambios de esquema.

---

## 4. Restricciones implementadas en base de datos

### 4.1 Integridad referencial

* Todas las claves primarias son `NOT NULL`.
* Claves foráneas con política:

  * `ON DELETE RESTRICT` en relaciones críticas.
* Los identificadores son inmutables (no se utiliza `ON UPDATE CASCADE`).

### 4.2 Checks de dominio

En la tabla `service`:

* `service_duration_minutes > 0`
* `slot_interval_minutes > 0`
* `capacity_per_slot >= 1`
* `buffer_minutes >= 0`

En la tabla `appointment`:

* `planned_duration_minutes > 0`
* `planned_buffer_minutes >= 0`
* `actual_end_at IS NULL OR actual_start_at IS NOT NULL`
* `actual_end_at IS NULL OR actual_end_at >= actual_start_at`

### 4.3 Unicidad e idempotencia

* En `notification`, se define unicidad sobre `(appointment_id, notification_type)` para evitar duplicación de hitos.

---

## 5. Índices físicos

### 5.1 Agenda diaria (consulta principal)

* Índice compuesto:

  * `(professional_id, scheduled_start_at)`

### 5.2 Accesos frecuentes

* `appointments(service_id)`
* `appointments(patient_contact_id)`

### 5.3 Historial de eventos

* `appointment_event(appointment_id, occurred_at)`

### 5.4 Notificaciones

* `notification(status, scheduled_at)`
* `notification(appointment_id)`

### 5.5 Soft delete (opcional)

* Índices parciales `WHERE deleted_at IS NULL` para tablas activas.
* Estos índices se agregan mediante migraciones SQL manuales, ya que Prisma no los genera automáticamente.

---

## 6. Concurrencia y consistencia (capacidad por slot)

### 6.1 Problema a resolver

Durante la creación o reprogramación de turnos, múltiples solicitudes concurrentes pueden intentar reservar el mismo **slot de inicio**, excediendo la capacidad configurada.

Este escenario no puede resolverse únicamente mediante restricciones declarativas.

---

## 6.2 Estrategia adoptada: Advisory Locks

Se adopta como estrategia definitiva el uso de **Advisory Locks transaccionales** de PostgreSQL (`pg_advisory_xact_lock`) para garantizar consistencia con **máxima eficiencia**.

### Justificación

* Bloqueo preciso a nivel de slot lógico, no de tabla.
* No requiere tablas auxiliares.
* Evita abortos y reintentos innecesarios.
* Excelente rendimiento bajo concurrencia.
* Adecuado para sistemas de agenda basados en intervalos.

---

## 6.3 Definición de la llave de bloqueo

La llave del bloqueo representa un **slot de inicio específico** y se construye a partir de:

* `professional_id`
* `service_id`
* `slot_bucket`

### Slot bucket

El `slot_bucket` se calcula como:

slot_bucket = floor(extract(epoch from scheduled_start_at) / (slot_interval_minutes * 60))

### Lock key

Se genera un entero de 64 bits a partir del hash de:

(professional_id, service_id, slot_bucket)

Este valor se utiliza como parámetro de `pg_advisory_xact_lock`.

---

## 6.4 Flujo transaccional

Toda operación crítica de creación o reprogramación de turnos se ejecuta dentro de una única transacción:

1. Obtener la configuración del servicio (`slot_interval_minutes`, `capacity_per_slot`).
2. Calcular el `slot_bucket`.
3. Ejecutar `pg_advisory_xact_lock(lock_key)`.
4. Contar turnos existentes que inician en el mismo slot, excluyendo `canceled` y `no_show`.
5. Validar que el conteo sea menor a la capacidad permitida.
6. Crear o actualizar el turno.
7. Confirmar la transacción (el lock se libera automáticamente).

La implementación se realiza mediante `prisma.$transaction()` y `tx.$executeRaw()`.

---

## 6.5 Alcance del bloqueo

* El bloqueo aplica únicamente a la combinación `(professional, service, slot)`.
* Slots distintos y profesionales distintos no se ven afectados.
* Se garantiza serialización local sin impacto global.

---

## 7. Cálculo de demoras y ETA

* Los valores de atraso y tiempo estimado se calculan **on-demand** a partir de:

  * horarios planificados,
  * buffers configurados,
  * tiempos reales,
  * estados de los turnos.
* No se persisten valores derivados para evitar inconsistencias.

Extensión futura:

* Cache por día o vistas materializadas si el volumen lo requiere.

---

## 8. Borrado lógico y consistencia

* El campo `deleted_at` se utiliza para soft delete.
* Entidades inactivas no deben participar en:

  * agenda,
  * conteo de capacidad,
  * cálculo de demoras.
* Estas reglas se aplican en la capa de aplicación y en las consultas.

---

## 9. Auditoría y trazabilidad

* `appointment_event` es el mecanismo central de auditoría del sistema.
* Se registran eventos para:

  * creación,
  * reprogramación,
  * cancelación,
  * check-in,
  * inicio,
  * finalización,
  * no-show.

---
