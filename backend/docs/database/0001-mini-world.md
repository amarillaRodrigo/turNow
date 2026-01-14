# 01 – Miniworld y Alcance del Sistema

## 1. Introducción

Este documento describe el *miniworld* del sistema, es decir, el subconjunto del mundo real que será modelado por la base de datos.  
El sistema tiene como propósito **reducir la espera y la incertidumbre del paciente en consultorios de salud**, mediante la gestión del tiempo real de atención y la comunicación clara del estado de los turnos.

El sistema se desarrolla como una **Progressive Web Application (PWA)** orientada principalmente a profesionales de la salud, y se enfoca exclusivamente en la dimensión temporal del proceso de atención.

---

## 2. Problema identificado

A partir de la observación de prácticas reales en consultorios médicos y del análisis de experiencias de pacientes, se identificaron los siguientes problemas recurrentes:

- Las consultas suelen extenderse más allá de su duración planificada, generando atrasos acumulados.
- El paciente desconoce cuánto tiempo falta realmente para ser atendido, lo que incrementa la ansiedad y la percepción de mala atención.
- El profesional carece de herramientas simples para **visualizar y controlar el tiempo real de cada consulta**.
- La comunicación manual de atrasos y reprogramaciones genera fricción operativa y pérdida de tiempo.

Estos problemas no se originan en la asignación del turno, sino en la **falta de gestión explícita del tiempo durante la jornada de atención**.

---

## 3. Objetivo del sistema

El sistema tiene como objetivo:

- Gestionar turnos médicos con foco en el **tiempo planificado vs. tiempo real de atención**.
- Permitir al profesional registrar de forma simple el inicio y la finalización de cada consulta.
- Calcular y actualizar dinámicamente el atraso o adelanto de los turnos siguientes.
- Comunicar a los pacientes, mediante canales externos, información clara sobre confirmaciones y demoras estimadas.
- Reducir la incertidumbre del paciente sin exigirle interacción directa con el sistema.

---

## 4. Alcance del sistema (MVP)

### 4.1 Incluido en el MVP

- Gestión de agenda diaria por profesional.
- Registro de turnos con duración planificada.
- Registro de tiempos reales de inicio y fin de cada turno.
- Estados operativos del turno (programado, en espera, en atención, finalizado, no-show, cancelado).
- Cálculo automático de atrasos y tiempos estimados.
- Envío de avisos básicos a pacientes (confirmación y actualizaciones de demora).

### 4.2 Fuera de alcance del MVP

- Visualización pública en sala de espera.
- Historia clínica del paciente.
- Gestión de pagos, facturación o seguros.
- Autenticación y cuentas de pacientes.
- Estadísticas avanzadas o reportes históricos complejos.
- Integraciones con sistemas externos de terceros.

Estas funcionalidades se consideran extensiones futuras y no forman parte del alcance actual del diseño de la base de datos.

---

## 5. Actores del miniworld

### 5.1 Profesional de la salud
- Usuario principal del sistema.
- Define su agenda y los servicios que ofrece.
- Registra explícitamente el inicio y finalización de cada consulta.
- Visualiza el estado de su agenda y el atraso acumulado.

### 5.2 Personal administrativo (opcional)
- Puede asistir en la gestión de turnos.
- No es un actor obligatorio en el MVP.

### 5.3 Paciente
- No es un usuario autenticado del sistema.
- Es tratado como un **contacto**, identificado por datos mínimos (por ejemplo, nombre y teléfono).
- Recibe información pasiva a través de mensajes informativos.
- No interactúa directamente con la aplicación.

---

## 6. Suposiciones y restricciones

- Cada turno pertenece a un único profesional.
- No se permiten turnos solapados para un mismo profesional.
- El profesional registra explícitamente el inicio y el fin de la atención.
- La duración planificada del turno es conocida al momento de su creación.
- El sistema debe ser utilizable desde dispositivos con capacidades técnicas heterogéneas.
- La comunicación con pacientes se realiza mediante canales externos al sistema.

---

## 7. Relación con el diseño de la base de datos

El miniworld definido en este documento constituye la base para:

- La identificación de entidades, atributos y relaciones en el diseño conceptual.
- La definición de reglas de negocio que se traducirán en restricciones de integridad.
- El posterior diseño lógico y normalización del esquema relacional.

Las decisiones de diseño posteriores deberán mantenerse coherentes con el alcance y las suposiciones aquí establecidas.
