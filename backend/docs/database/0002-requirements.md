# 02 – Requerimientos del Sistema

## 1. Objetivo

Este documento especifica los requerimientos del sistema para el MVP de una PWA orientada a la **gestión del tiempo de atención en consultorios de salud**.  
Los requerimientos aquí definidos sirven como base directa para el diseño conceptual (ER), el diseño lógico y la posterior implementación de la base de datos.

Los requerimientos se organizan en:
- Requerimientos funcionales (RF)
- Requerimientos de datos (RD)
- Reglas de negocio / restricciones (RN)
- Operaciones críticas (OC)

---

## 2. Requerimientos funcionales (RF)

### Gestión de profesionales
- **RF-01:** El sistema debe permitir dar de alta, baja lógica y modificar profesionales de la salud.
- **RF-02:** El sistema debe permitir asociar servicios a cada profesional.

### Configuración de servicios y agenda
- **RF-03:** El profesional debe poder definir servicios que ofrece.
- **RF-04:** Para cada servicio, el profesional debe poder configurar:
  - duración planificada del servicio (en minutos),
  - intervalo de inicio o *slot* (en minutos),
  - capacidad de inicios por slot (cantidad máxima de pacientes que pueden iniciar en el mismo slot),
  - tiempo muerto o buffer (en minutos).
- **RF-05:** El sistema debe generar automáticamente la agenda del profesional en función de la configuración de servicios.

### Gestión de turnos
- **RF-06:** El sistema debe permitir crear turnos asociados a:
  - un profesional,
  - un servicio,
  - un paciente/contacto,
  - una fecha y hora de inicio planificada.
- **RF-07:** El sistema debe permitir visualizar la agenda diaria del profesional.
- **RF-08:** El sistema debe permitir reprogramar turnos existentes.
- **RF-09:** El sistema debe permitir cancelar turnos existentes.
- **RF-10:** El sistema debe permitir marcar la ausencia de un paciente (no-show).

### Gestión del tiempo real de atención
- **RF-11:** El sistema debe permitir marcar que un paciente llegó (check-in).
- **RF-12:** El sistema debe permitir registrar el inicio real de la atención de un turno.
- **RF-13:** El sistema debe permitir registrar el fin real de la atención de un turno.
- **RF-14:** El sistema debe calcular dinámicamente el atraso o adelanto de los turnos del día en función de:
  - duración planificada,
  - tiempo muerto configurado,
  - tiempos reales registrados,
  - eventos como no-show o cancelaciones.

### Comunicación con pacientes
- **RF-15:** El sistema debe enviar notificaciones informativas a los pacientes por hitos del flujo:
  - confirmación del turno,
  - aviso de “vas en 1 turno”,
  - aviso de “serás llamado en breve”,
  - aviso de demora significativa.
- **RF-16:** El sistema debe registrar el estado de cada notificación enviada.

---

## 3. Requerimientos de datos (RD)

- **RD-01:** Debe almacenarse información mínima del profesional para operar el sistema.
- **RD-02:** Debe almacenarse información mínima de pacientes/contactos (por ejemplo, nombre y teléfono).
- **RD-03:** Debe almacenarse la configuración de servicios por profesional, incluyendo:
  - duración planificada,
  - intervalo de slot,
  - capacidad por slot,
  - buffer.
- **RD-04:** Debe almacenarse la información de cada turno, incluyendo:
  - hora de inicio planificada,
  - duración planificada (copiada del servicio al momento de crear el turno),
  - buffer (copiado del servicio),
  - estado operativo.
- **RD-05:** Deben almacenarse marcas de tiempo reales de atención:
  - check-in (opcional),
  - inicio real,
  - fin real.
- **RD-06:** Debe almacenarse un historial de eventos del turno (por ejemplo: creado, reprogramado, iniciado, finalizado, no-show).
- **RD-07:** Debe almacenarse un registro de notificaciones, incluyendo:
  - canal,
  - tipo de notificación,
  - fecha/hora programada,
  - fecha/hora enviada,
  - estado (enviado, fallido),
  - información de error si aplica.

---

## 4. Reglas de negocio y restricciones (RN)

### Reglas generales
- **RN-01:** Cada turno debe pertenecer a un único profesional.
- **RN-02:** Cada turno debe estar asociado a un único servicio del profesional.
- **RN-03:** La duración planificada de un servicio debe ser mayor que 0.
- **RN-04:** El intervalo de slot debe ser mayor que 0.
- **RN-05:** La capacidad de inicios por slot debe ser mayor o igual a 1.
- **RN-06:** El buffer debe ser mayor o igual a 0.

### Capacidad y solapamiento (modelo por slot)
- **RN-07:** Para un profesional y servicio dados, la cantidad de turnos que inician dentro del mismo intervalo de slot no debe exceder la capacidad configurada para ese servicio.
  - Ejemplo: con `slot_interval = 30` y `capacity = 3`, pueden iniciarse hasta 3 turnos a las 10:00 y hasta 3 turnos a las 10:30.
- **RN-08:** Cuando la capacidad por slot es igual a 1, el servicio se comporta como una agenda 1:1 tradicional (sin solapamientos).

### Flujo y estados del turno
- **RN-09:** Un turno debe tener un estado operativo válido. Estados mínimos del MVP:
  - scheduled (programado),
  - waiting (en espera),
  - in_service (en atención),
  - done (finalizado),
  - canceled (cancelado),
  - no_show (ausente).
- **RN-10:** Un turno no puede pasar al estado `done` si no tiene un inicio real registrado.
- **RN-11:** Si un turno tiene fin real, debe tener inicio real y `actual_end_at` debe ser mayor o igual a `actual_start_at`.

### No-show y avance de cola
- **RN-12:** Un turno marcado como no-show libera automáticamente capacidad en la agenda.
- **RN-13:** Al producirse un no-show o cancelación, el sistema debe recalcular la cola y los tiempos estimados.

### Notificaciones
- **RN-14:** El sistema no debe registrar el envío duplicado del mismo hito de notificación para un mismo turno.
- **RN-15:** Las notificaciones deben dispararse únicamente por hitos del flujo o cambios significativos de demora.

---

## 5. Operaciones críticas (OC)

Las siguientes operaciones validan la robustez del diseño del modelo de datos:

- **OC-01:** Crear turno (verificando capacidad por slot).
- **OC-02:** Reprogramar turno (revalidar capacidad).
- **OC-03:** Cancelar turno (actualizar estado y eventos).
- **OC-04:** Marcar check-in del paciente.
- **OC-05:** Marcar inicio real de atención.
- **OC-06:** Marcar fin real de atención.
- **OC-07:** Marcar no-show y recalcular la cola.
- **OC-08:** Registrar envío de notificaciones de forma idempotente.

---

## 6. Trazabilidad preliminar

- RF-03 / RF-04 → SERVICE
- RF-06 / RF-07 / RF-08 → APPOINTMENT
- RF-11 / RF-12 / RF-13 → APPOINTMENT + EVENT
- RF-15 / RF-16 → NOTIFICATION
