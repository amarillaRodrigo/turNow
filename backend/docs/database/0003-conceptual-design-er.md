# 03 – Diseño Conceptual (Modelo ER / EER)

## 1. Propósito

Definir el **modelo conceptual** del sistema mediante un esquema ER/EER que represente:
- entidades del dominio,
- atributos principales,
- relaciones,
- cardinalidades y participación,
- restricciones semánticas relevantes.

Este modelo es independiente del DBMS y sirve como base para el diseño lógico relacional.

---

## 2. Entidades y atributos

> Nota: Los atributos listados son los mínimos para el MVP. Atributos de auditoría (created_at, updated_at, deleted_at) se detallarán en el diseño lógico.

### 2.1 Professional
Representa al profesional de la salud que utiliza el sistema.

**Atributos (principales)**
- professional_id (identificador)
- display_name (nombre visible)
- contact_phone (opcional)
- contact_email (opcional)
- is_active

---

### 2.2 PatientContact
Representa a un paciente como **contacto** (sin cuenta autenticada en el MVP).

**Atributos (principales)**
- patient_id (identificador)
- full_name
- phone (principal)
- email (opcional)
- notes (opcional)

---

### 2.3 Service
Representa un tipo de servicio ofrecido por un profesional (define estándar de tiempo y capacidad).

**Atributos (principales)**
- service_id (identificador)
- name
- service_duration_minutes (duración planificada del servicio)
- slot_interval_minutes (tamaño del intervalo de inicio / slot)
- capacity_per_slot (cantidad máxima de inicios dentro del mismo slot)
- buffer_minutes (tiempo muerto / buffer entre bloques)
- is_active

---

### 2.4 Appointment
Representa un turno planificado para un paciente con un profesional, asociado a un servicio.

**Atributos (principales)**
- appointment_id (identificador)
- scheduled_start_at (inicio planificado)
- status (scheduled, waiting, in_service, done, canceled, no_show)
- planned_duration_minutes (copia de Service.service_duration_minutes al crear el turno)
- planned_buffer_minutes (copia de Service.buffer_minutes al crear el turno)
- checked_in_at (opcional)
- actual_start_at (opcional)
- actual_end_at (opcional)
- reschedule_reason (opcional)
- cancel_reason (opcional)

---

### 2.5 AppointmentEvent
Registra eventos relevantes de un turno para auditabilidad y reconstrucción de flujo.

**Atributos (principales)**
- event_id (identificador)
- event_type (created, rescheduled, canceled, checked_in, started, ended, no_show, status_changed, etc.)
- occurred_at (timestamp)
- actor (opcional: referencia conceptual a “quién ejecutó el evento”; se concreta en diseño lógico)
- payload (opcional: datos adicionales)

---

### 2.6 Notification
Representa una notificación informativa asociada a un turno (confirmación, “vas en 1 turno”, “en breve”, demora).

**Atributos (principales)**
- notification_id (identificador)
- channel (email, whatsapp, etc.)
- notification_type (confirmation, queue_1, soon, delay_update, etc.)
- scheduled_at (opcional)
- sent_at (opcional)
- status (pending, sent, failed)
- error_message (opcional)
- provider_message_id (opcional)

---

## 3. Relaciones y cardinalidades

### R1: Professional “offers” Service
- Un **Professional** puede ofrecer **0..N Services**
- Un **Service** pertenece a **1 Professional**

**Cardinalidad:** Professional (1) —— (N) Service  
**Participación:** Service total (siempre debe tener un Professional)

---

### R2: Professional “has” Appointment
- Un **Professional** puede tener **0..N Appointments**
- Un **Appointment** pertenece a **1 Professional**

**Cardinalidad:** Professional (1) —— (N) Appointment  
**Participación:** Appointment total

---

### R3: PatientContact “books” Appointment
- Un **PatientContact** puede tener **0..N Appointments**
- Un **Appointment** pertenece a **1 PatientContact**

**Cardinalidad:** PatientContact (1) —— (N) Appointment  
**Participación:** Appointment total

---

### R4: Service “defines” Appointment
- Un **Service** puede estar asociado a **0..N Appointments**
- Un **Appointment** pertenece a **1 Service**

**Cardinalidad:** Service (1) —— (N) Appointment  
**Participación:** Appointment total

---

### R5: Appointment “records” AppointmentEvent
- Un **Appointment** puede tener **0..N AppointmentEvents**
- Un **AppointmentEvent** pertenece a **1 Appointment**

**Cardinalidad:** Appointment (1) —— (N) AppointmentEvent  
**Participación:** AppointmentEvent total

---

### R6: Appointment “triggers” Notification
- Un **Appointment** puede tener **0..N Notifications**
- Una **Notification** pertenece a **1 Appointment**

**Cardinalidad:** Appointment (1) —— (N) Notification  
**Participación:** Notification total

---

## 4. Restricciones semánticas (conceptuales)

Estas restricciones derivan de RN del documento `02-requirements.md`.  
Se expresan a nivel conceptual y se implementarán mediante constraints/validaciones transaccionales en el diseño lógico/físico.

### 4.1 Restricciones de configuración de Service
- service_duration_minutes > 0
- slot_interval_minutes > 0
- capacity_per_slot >= 1
- buffer_minutes >= 0

### 4.2 Capacidad por slot (modelo “inicios por intervalo”)
Para un (Professional, Service) dado, el número de **Appointments** que inician dentro del mismo intervalo `slot_interval_minutes` no debe exceder `capacity_per_slot`.

> Nota: Esto reemplaza el “anti-solapamiento” tradicional.  
> Si capacity_per_slot = 1, el comportamiento equivale a agenda 1:1.

### 4.3 Reglas de estado y tiempo real
- Si status = done ⇒ actual_start_at existe y actual_end_at existe
- Si actual_end_at existe ⇒ actual_start_at existe y actual_end_at >= actual_start_at
- No se permite transicionar a done sin haber iniciado (started).

### 4.4 Notificaciones idempotentes por hito
Para un mismo Appointment, no deben existir duplicados del mismo notification_type (por ejemplo, dos “confirmation”).

---

## 5. Observaciones de modelado (decisiones conceptuales)

- **Service define estándares** (duración/slot/capacidad/buffer) para evitar seteo manual turno a turno.
- **Appointment copia duración y buffer** desde Service al crearse, preservando histórico aunque el Service cambie.
- **AppointmentEvent** permite auditabilidad y soporta reconstrucción de flujo, análisis futuro y consistencia ante fallos.
- El paciente se modela como **PatientContact** (sin cuenta), reduciendo fricción y simplificando el MVP.

---

## 6. Próximo paso

Convertir este modelo conceptual ER a un esquema relacional en `04-logical-design-relational.md`:
- tablas,
- PK/FK,
- dominios,
- constraints,
- y consideraciones iniciales de normalización.
