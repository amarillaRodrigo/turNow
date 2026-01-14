# 04 – Diseño Lógico (Esquema Relacional)

## 1. Propósito

Transformar el modelo conceptual ER (`03-conceptual-design-er.md`) en un **esquema relacional**:
- relaciones (tablas),
- claves primarias (PK),
- claves foráneas (FK),
- restricciones de dominio e integridad,
- consideraciones de normalización,
- y consideraciones de implementación con Prisma ORM.

Este documento describe el esquema lógico independiente de un DBMS específico, aunque el objetivo de implementación es PostgreSQL + Prisma.

---

## 2. Convenciones de diseño

### 2.1 Identificadores
- Cada tabla usa un identificador `id` como PK.
- Recomendación para implementación: `UUID` (por robustez, portabilidad y facilidad en sistemas distribuidos).  
  La elección final se registra como ADR si aún no existe.

### 2.2 Auditoría
Para todas las entidades persistentes se recomienda incluir:
- `created_at`, `updated_at`
- `deleted_at` (soft delete) cuando aplique

> Nota: en Prisma, `updatedAt` puede automatizarse y `deleted_at` puede implementarse como `DateTime?`.

### 2.3 Estados
- Los estados del turno se modelan como un conjunto finito (enum a nivel DB o campo texto con CHECK).
- En Prisma se recomienda modelar el estado como `enum` en el schema para tipado.

---

## 3. Esquema relacional propuesto (MVP)

### 3.1 PROFESSIONAL
**PROFESSIONAL**(
- id PK,
- display_name NOT NULL,
- contact_phone NULL,
- contact_email NULL,
- is_active NOT NULL DEFAULT true,
- created_at NOT NULL,
- updated_at NOT NULL,
- deleted_at NULL
)

**Restricciones**
- (opcional) UNIQUE(contact_email) si se usa como identificador de login.

---

### 3.2 PATIENT_CONTACT
**PATIENT_CONTACT**(
- id PK,
- full_name NOT NULL,
- phone NOT NULL,
- email NULL,
- notes NULL,
- created_at NOT NULL,
- updated_at NOT NULL,
- deleted_at NULL
)

**Restricciones**
- phone debe cumplir formato básico (validación en app + opcional CHECK).
- UNIQUE(phone) puede ser deseable, pero debe evaluarse: un mismo teléfono puede compartirse (familia).

> Recomendación MVP: permitir duplicados de phone y resolver “merge” a futuro.
> Alternativa: UNIQUE(phone) solo dentro de un Professional (requiere campo professional_id en PatientContact).

---

### 3.3 SERVICE
**SERVICE**(
- id PK,
- professional_id FK → PROFESSIONAL(id) NOT NULL,
- name NOT NULL,
- service_duration_minutes NOT NULL,
- slot_interval_minutes NOT NULL,
- capacity_per_slot NOT NULL,
- buffer_minutes NOT NULL DEFAULT 0,
- is_active NOT NULL DEFAULT true,
- created_at NOT NULL,
- updated_at NOT NULL,
- deleted_at NULL
)

**Restricciones (dominio)**
- CHECK(service_duration_minutes > 0)
- CHECK(slot_interval_minutes > 0)
- CHECK(capacity_per_slot >= 1)
- CHECK(buffer_minutes >= 0)

**Restricciones (consistencia recomendada)**
- service_duration_minutes % slot_interval_minutes = 0 (opcional; puede implementarse en app o DB)

**Índices**
- INDEX(service.professional_id)

---

### 3.4 APPOINTMENT
**APPOINTMENT**(
- id PK,
- professional_id FK → PROFESSIONAL(id) NOT NULL,
- service_id FK → SERVICE(id) NOT NULL,
- patient_contact_id FK → PATIENT_CONTACT(id) NOT NULL,

- scheduled_start_at NOT NULL,
- status NOT NULL,

- planned_duration_minutes NOT NULL,
- planned_buffer_minutes NOT NULL,

- checked_in_at NULL,
- actual_start_at NULL,
- actual_end_at NULL,

- reschedule_reason NULL,
- cancel_reason NULL,

- created_at NOT NULL,
- updated_at NOT NULL,
- deleted_at NULL
)

**Restricciones**
- CHECK(planned_duration_minutes > 0)
- CHECK(planned_buffer_minutes >= 0)
- CHECK(actual_end_at IS NULL OR actual_start_at IS NOT NULL)
- CHECK(actual_end_at IS NULL OR actual_end_at >= actual_start_at)

**Integridad**
- `professional_id` debe ser consistente con `service_id`:
  - SERVICE.professional_id = APPOINTMENT.professional_id  
  Esto se valida en transacción (app) o mediante constraint avanzada (más complejo). MVP: validación en app.

**Índices**
- INDEX(appointment.professional_id, scheduled_start_at)
- INDEX(appointment.service_id)
- INDEX(appointment.patient_contact_id)

---

### 3.5 APPOINTMENT_EVENT
**APPOINTMENT_EVENT**(
- id PK,
- appointment_id FK → APPOINTMENT(id) NOT NULL,

- event_type NOT NULL,
- occurred_at NOT NULL,

- actor_professional_id NULL FK → PROFESSIONAL(id)  (MVP: actor mínimo)
- payload NULL (JSON/text)

- created_at NOT NULL
)

**Restricciones**
- event_type debe pertenecer al conjunto permitido (enum o CHECK).

**Índices**
- INDEX(event.appointment_id, occurred_at)

---

### 3.6 NOTIFICATION
**NOTIFICATION**(
- id PK,
- appointment_id FK → APPOINTMENT(id) NOT NULL,

- channel NOT NULL,
- notification_type NOT NULL,

- scheduled_at NULL,
- sent_at NULL,

- status NOT NULL,
- error_message NULL,
- provider_message_id NULL,

- created_at NOT NULL,
- updated_at NOT NULL
)

**Restricciones**
- UNIQUE(appointment_id, notification_type)  (idempotencia por hito)
- status en conjunto permitido (enum o CHECK)
- channel en conjunto permitido (enum o CHECK)

**Índices**
- INDEX(notification.appointment_id)
- INDEX(notification.status)

---

## 4. Reglas de negocio que requieren lógica transaccional

Algunas reglas no se resuelven solo con PK/FK/CHECK y deben implementarse en transacciones:

### 4.1 Capacidad por slot (RN-07)
Para un (professional_id, service_id) y un `scheduled_start_at`:
- Definir el slot de inicio según `SERVICE.slot_interval_minutes`.
- Contar turnos existentes que inician en el mismo slot (excluyendo cancelados/no-show si corresponde).
- Rechazar si count >= capacity_per_slot.

**Nota Prisma**
- Implementar esta validación en el servicio de dominio con transacción.
- Considerar aislamiento/locking (más adelante) para evitar condiciones de carrera.

### 4.2 Consistencia profesional-servicio
Al crear un Appointment:
- Validar que `service.professional_id == appointment.professional_id`.

---

## 5. Consideraciones de normalización (visión MVP)
- SERVICE separa configuración reusable (duración/capacidad/slot/buffer), evitando redundancia en APPOINTMENT.
- APPOINTMENT almacena copias (planned_duration/buffer) para preservar histórico cuando SERVICE cambie.
- APPOINTMENT_EVENT evita sobrecargar APPOINTMENT con columnas por cada evento futuro y habilita auditabilidad.

---

## 6. Mapeo a Prisma (guía)

- Las tablas se representan como `model` en `schema.prisma`.
- Estados (`AppointmentStatus`, `NotificationStatus`, `NotificationChannel`, `EventType`) se modelan como `enum` para tipado.
- Soft delete: `deletedAt DateTime?`.
- Timestamps: `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`.

> El `UNIQUE(appointment_id, notification_type)` se mapea en Prisma con `@@unique([appointmentId, notificationType])`.

---

## 7. Próximo paso

- Definir `05-normalization.md` (breve, con justificación 3NF/BCNF donde aplique).
- Definir `06-physical-design.md` orientado a PostgreSQL (índices y estrategia de concurrencia para capacidad por slot).
- Implementar el esquema como migración inicial con Prisma.
