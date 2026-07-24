# Seguridad, privacidad y marco legal

> **Leé esto antes que nada.** En una automatización para un abogado, esto no es un
> anexo: es el diseño. Un error acá no es un bug, es responsabilidad profesional.

## 1. Secreto profesional (el riesgo #1)

El abogado está obligado a guardar secreto de lo que le confían sus clientes. Eso
tiene consecuencias técnicas concretas:

- **El asistente de WhatsApp NO asesora.** Tritura, clasifica, pide datos, agenda y
  deriva. Nunca opina sobre un caso, nunca da una estrategia legal, nunca dice "sí
  tenés razón, demandá". Un LLM equivocándose en asesoramiento = mala praxis + posible
  ejercicio no autorizado. **Disclaimer explícito** en el primer mensaje: "Soy un
  asistente que agenda y responde consultas generales. No brindo asesoramiento legal;
  eso lo hace el/la profesional en la consulta."
- **Minimización de datos hacia la IA.** Al modelo se le manda lo mínimo para la
  tarea (intención, disponibilidad, FAQ), no el relato completo de un caso penal con
  nombres. Para triaje alcanza con categoría + urgencia.
- **Proveedor de IA con retención cero / sin entrenamiento.** Elegir un modo de API
  que no entrene con los datos ni los retenga (o mínimo posible). Documentarlo por
  tenant en `tenant_config`.
- **Contenido legal generado por IA = borrador, nunca publicación directa.** Todo lo
  que roza afirmaciones jurídicas pasa por revisión humana del profesional.

## 2. Datos personales (Argentina — Ley 25.326)

- **Base legal y consentimiento.** Guardar datos de una persona que escribe requiere
  finalidad clara y consentimiento. El primer contacto informa qué se guarda y para
  qué, y cómo pedir borrado.
- **Datos sensibles.** Un caso penal puede implicar datos sensibles (antecedentes,
  salud, etc.), que tienen protección reforzada. Cuanto menos se persista, mejor.
- **Derechos ARCO.** Tiene que existir un camino para acceder, rectificar y **borrar**
  los datos de un contacto. Esto se diseña ahora (un flujo de "olvido"), no después.
- **Certificados con DNI (deuda ya identificada en el README).** Antes de exponer
  material en cualquier canal, decidir si se tapan datos de DNI. La plataforma no debe
  reenviar ni publicar documentos con datos personales de terceros.
- **Ubicación de los datos.** Preferir región y proveedores compatibles. Documentar
  dónde vive cada dato (Drive, Postgres, backups).

## 3. WhatsApp — sólo métodos oficiales

- **Usar WhatsApp Cloud API (Meta) o un BSP.** Nada de Baileys, whatsapp-web.js ni
  automatizar WhatsApp Web: violan los ToS, y el número (que es el del estudio) se
  puede banear. El costo reputacional para un abogado es inaceptable.
- **Ventana de 24 h y plantillas.** Fuera de la ventana de 24 h desde el último
  mensaje del usuario, sólo se puede escribir con **plantillas aprobadas** por Meta
  (recordatorios de turno, confirmaciones). Esto condiciona el diseño de recordatorios.
- **Opt-in.** Sólo se le escribe a quien inició la conversación o dio consentimiento.
- **Verificación de negocio.** Cloud API en serio requiere Meta Business verificado y
  un número dedicado (no el personal de Nicolás). Planificarlo temprano.

## 4. Instagram / Facebook — qué se puede y qué no

- **Publicar: sí, con API oficial.** La Content Publishing API (Instagram Graph API,
  para cuentas Business vinculadas a una página) permite programar feed/carruseles.
  Hay límites de publicaciones por día y tipos soportados.
- **Moderar comentarios: sí, con cuidado.** Se pueden leer y responder comentarios vía
  API; respuestas automáticas deben ser genéricas y no dar asesoramiento (ver §1).
- **DM automático a "potenciales clientes": NO.** Mandar mensajes privados no
  solicitados o masivos viola las políticas de Meta y quema la cuenta. La "captación"
  se limita a: detectar interés → notificar a un humano → el humano decide.
- **Nada de scraping de competidores que viole ToS.** El "análisis de competencia" se
  hace con datos públicos y APIs permitidas, no raspando lo que no se puede.

## 5. Manejo de credenciales

- **Un vault, no el repo.** Tokens de Meta, Google, IA, DB → variables de entorno del
  VPS y/o gestor de secretos. `.env` **jamás** commiteado (ya hay `.gitignore`; lo
  auditamos).
- **Credenciales de n8n cifradas** con `N8N_ENCRYPTION_KEY`, respaldada por separado.
- **Rotación y mínimo privilegio.** Cada token con el scope justo. Cuentas de servicio
  de Google con acceso sólo a las carpetas del tenant, no a todo el Drive.
- **Separación por cliente.** Idealmente, credenciales por tenant. Nada de un token
  "maestro" que toque las cuentas de todos.

## 6. Observabilidad, auditoría y errores

- **`audit_log` inmutable:** cada acción sensible (mensaje enviado, turno creado,
  contenido publicado, dato borrado) queda registrada con tenant, actor, timestamp.
- **Logs centralizados** de n8n (a archivo/servicio), sin volcar datos personales en
  texto plano en los logs.
- **Manejo de errores en cada workflow:** un `Error Trigger` que notifica al equipo,
  reintentos con backoff en llamadas a APIs, y **fallback humano**: si la IA no
  entiende o algo falla, el mensaje se deriva a una persona, nunca se pierde.
- **Rate limiting y anti-abuso** en el webhook público (evitar spam/DoS al número).

## 7. Backups y continuidad

- **Postgres:** dump automático diario + retención (p. ej. 7 diarios / 4 semanales),
  guardado fuera del VPS (Drive/almacenamiento de objetos).
- **n8n:** export de workflows al repo + backup del volumen + la encryption key aparte.
- **Drive:** ya es durable; igual documentar la estructura para poder reconstruirla.
- **Prueba de restore.** Un backup no probado no existe. Restore de prueba trimestral.

## 8. Checklist de "no arrancamos sin esto"

- [ ] Número de WhatsApp **dedicado** (no el personal) + Meta Business verificado.
- [ ] Consentimiento/disclaimer definido para el primer contacto.
- [ ] Proveedor de IA con modo sin-entrenamiento/retención mínima, elegido.
- [ ] `.env` fuera del repo y `N8N_ENCRYPTION_KEY` respaldada.
- [ ] Decisión tomada sobre el DNI en los certificados.
- [ ] Flujo de borrado de datos (derecho al olvido) diseñado.
- [ ] Backups de Postgres automatizados y un restore probado.
