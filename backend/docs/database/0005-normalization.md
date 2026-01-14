# 05 – Normalización del Esquema Relacional

## 1. Propósito

El objetivo de este documento es analizar el esquema relacional definido en  
`04-logical-design-relational.md` desde el punto de vista de la **normalización**, con el fin de:

- verificar la corrección del diseño lógico,
- minimizar redundancias innecesarias,
- evitar anomalías de inserción, actualización y eliminación,
- y justificar explícitamente cualquier desnormalización aplicada.

El análisis sigue los criterios clásicos de **Primera, Segunda y Tercera Forma Normal (1NF, 2NF, 3NF)** y **Boyce–Codd Normal Form (BCNF)**, conforme a la bibliografía de referencia.

---

## 2. Primera Forma Normal (1NF)

Una relación se encuentra en **1NF** si:
- todos sus atributos contienen valores atómicos,
- no existen grupos repetitivos,
- no existen atributos multivaluados.

### Evaluación

Todas las relaciones del esquema cumplen 1NF:

- Los atributos son atómicos (fechas, números, strings).
- Las repeticiones lógicas (eventos, notificaciones) se modelan mediante relaciones independientes:
  - `APPOINTMENT_EVENT`
  - `NOTIFICATION`
- No se utilizan estructuras embebidas que representen listas o colecciones dentro de una misma columna.

**Conclusión:**  
El esquema cumple **Primera Forma Normal (1NF)**.

---

## 3. Segunda Forma Normal (2NF)

Una relación se encuentra en **2NF** si:
- está en 1NF,
- y todos los atributos no clave dependen completamente de la clave primaria.

### Evaluación

En el esquema propuesto:

- Todas las tablas utilizan **claves primarias simples** (`id`).
- No existen claves primarias compuestas en el MVP.
- Por lo tanto, no pueden existir dependencias parciales.

Ejemplos:
- En `SERVICE`, todos los atributos de configuración dependen únicamente de `service_id`.
- En `APPOINTMENT`, todos los atributos dependen únicamente de `appointment_id`.

**Conclusión:**  
El esquema cumple **Segunda Forma Normal (2NF)**.

---

## 4. Tercera Forma Normal (3NF)

Una relación se encuentra en **3NF** si:
- está en 2NF,
- y no existen dependencias transitivas entre atributos no clave.

### Análisis por entidad

#### 4.1 PROFESSIONAL
No existen atributos no clave que determinen otros atributos no clave.  
Cumple 3NF.

#### 4.2 PATIENT_CONTACT
Los atributos dependen únicamente del identificador del contacto.  
No existen dependencias transitivas.  
Cumple 3NF.

#### 4.3 SERVICE
Los atributos de configuración (`service_duration_minutes`, `slot_interval_minutes`, `capacity_per_slot`, `buffer_minutes`) dependen únicamente del servicio.  
No se almacenan atributos derivados.  
Cumple 3NF.

#### 4.4 APPOINTMENT
La entidad `APPOINTMENT` almacena copias de:
- `planned_duration_minutes`
- `planned_buffer_minutes`

Estos valores se copian desde `SERVICE` al momento de creación del turno.

Esta decisión introduce **redundancia controlada**, pero:

- los valores copiados dependen exclusivamente de `appointment_id`,
- no existe dependencia funcional interna del tipo `service_id → planned_duration_minutes`,
- no se introduce dependencia transitiva dentro de la relación.

Por lo tanto, `APPOINTMENT` **cumple 3NF**, con una desnormalización deliberada y justificada.

#### 4.5 APPOINTMENT_EVENT
Todos los atributos dependen únicamente del evento.  
Cumple 3NF.

#### 4.6 NOTIFICATION
Todos los atributos dependen únicamente del identificador de la notificación.  
La restricción de unicidad por `(appointment_id, notification_type)` no genera dependencias transitivas.  
Cumple 3NF.

---

## 5. Boyce–Codd Normal Form (BCNF)

Una relación cumple **BCNF** si, para toda dependencia funcional no trivial, el determinante es una superclave.

### Evaluación

- Las entidades principales (`PROFESSIONAL`, `PATIENT_CONTACT`, `SERVICE`, `APPOINTMENT`) cumplen BCNF.
- En `NOTIFICATION`, la combinación `(appointment_id, notification_type)` constituye una clave candidata válida y no viola BCNF.
- La desnormalización en `APPOINTMENT` no introduce dependencias funcionales internas adicionales.

**Conclusión:**  
El esquema cumple **BCNF** en las relaciones principales.

---

## 6. Desnormalización deliberada y justificación

### Copia de configuración temporal en APPOINTMENT

La copia de duración y buffer desde `SERVICE` hacia `APPOINTMENT` se realiza con los siguientes objetivos:

- preservar el histórico de atención,
- evitar efectos colaterales ante cambios futuros en la configuración del servicio,
- simplificar el cálculo de tiempos reales versus planificados,
- reducir ambigüedad semántica en análisis posteriores.

Esta desnormalización:
- es mínima,
- está explícitamente documentada,
- no compromete la integridad del modelo,
- y es coherente con prácticas comunes en sistemas transaccionales reales.

---

## 7. Conclusión

El esquema relacional propuesto:

- cumple **1NF, 2NF y 3NF**,
- cumple **BCNF** en las entidades principales,
- introduce desnormalización solo cuando aporta valor funcional claro,
- evita anomalías clásicas de actualización y borrado,
- es adecuado para implementación con PostgreSQL y Prisma ORM,
- y es consistente con los objetivos del MVP y su evolución futura.

Este nivel de normalización se considera correcto y suficiente para sistemas de agenda y gestión de tiempo en producción.
