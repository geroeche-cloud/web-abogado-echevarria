# Roadmap por fases

Principio: **primero los cimientos y lo que da valor rápido**, no lo más vistoso.
Cada fase tiene un criterio de "listo" (Definition of Done). No se pasa de fase sin
cumplirlo.

---

## Fase 0 — Arquitectura y decisiones ✅ (este dossier)

- [x] Análisis de la arquitectura propuesta y sus riesgos.
- [x] Diseño de la arquitectura profesional (multi-tenant, capas, datos).
- [x] Marco de seguridad/legal.
- [x] Diseño funcional de los 6 módulos.
- [x] Costos: pago vs gratis.
- [ ] **Aprobación tuya** de esta arquitectura y este orden.

**DoD:** vos aprobás el enfoque. Recién ahí tocamos infra.

---

## Fase 1 — Fundaciones (infra + multi-tenant + seguridad base)

Sin esto, todo lo demás es un castillo de naipes.

- VPS + Docker Compose: n8n (queue mode) + Postgres + Redis + Caddy (TLS).
- Esquema de base de datos núcleo con `tenant_id` y Row Level Security.
- Vault de secretos / `.env` fuera del repo + `N8N_ENCRYPTION_KEY` respaldada.
- Backups automáticos de Postgres + primer restore de prueba.
- `Error Trigger` global de n8n + logging centralizado.
- Tenant "Abogado Neuquén" creado a mano (todavía sin formulario).

**DoD:** n8n corriendo con HTTPS, un tenant cargado, backups andando, un restore
probado, y ningún secreto en el repo.

---

## Fase 2 — Asistente WhatsApp "Sofía" (triaje + agenda) 🎯 el que da valor primero

- **Identidad del asistente (Módulo 0):** tabla `assistants` + Sofía cargada (nombre,
  personalidad, tono, reglas de derivación, disclaimer). El prompt del LLM se arma
  desde acá — mismo motor, cualquier asistente futuro.
- Número dedicado + Meta Business verificado + Cloud API conectada.
- Webhook → router → máquina de estados de conversación.
- FAQs por RAG desde `knowledge_base` + disclaimer legal + fallback humano.
- **Transparencia:** Sofía se presenta como asistente virtual; no finge ser humana.
- Agenda: chequeo de disponibilidad, evento en Calendar, confirmación al cliente,
  aviso a Nicolás, recordatorio con plantilla aprobada.
- Todo registrado en Postgres + `audit_log`; primeras métricas a `metrics_daily`.

**DoD:** Sofía responde una FAQ en su tono, se presenta como asistente virtual, agenda
un turno real que aparece en Calendar, Nicolás recibe el aviso, y al día del turno
llega el recordatorio. Con "escribí humano" siempre disponible.

---

## Fase 3 — Onboarding automático

Ahora que sabemos qué config necesita un cliente (lo aprendimos armando la Fase 2),
automatizamos el alta.

- Formulario completo (negocio, identidad visual, comunicación, marketing, archivos).
- Webhook → crea tenant + config + **asistente (identidad)** + carpeta Drive con la
  estructura (Identidad/Multimedia/Documentación/Contenido/Reportes) + base de
  conocimiento.
- Validación de archivos y aviso de datos personales de terceros.

**DoD:** completar el formulario deja un tenant nuevo — con su asistente y sus
carpetas — 100% listo para activar módulos, sin tocar nada a mano.

---

## Fase 4 — Sistema de contenido (con aprobación humana + métricas)

- Pipeline semanal: **investigación** (temas, FAQs reales, tendencias) → **generación**
  (borradores: copies, CTAs, reels, carruseles) → estados
  `borrador → en_revision → aprobado → publicado → archivado` → **publicación** por API
  oficial.
- Visual: plantillas de marca primero; IA para piezas puntuales.
- **Métricas:** cada pieza publicada alimenta `metrics_daily` e `insights` (contenido
  que rinde, temas que interesan) — siempre por tenant.
- La aprobación se hace por mensaje ahora y por Dashboard en la Fase 5.

**DoD:** cada semana se genera una propuesta que Nicolás aprueba, lo aprobado se
publica solo en las fechas fijadas, y su rendimiento queda medido. Nada se publica sin
estado `aprobado`.

---

## Fase 5 — Dashboard del cliente (+ comunidad y reportes)

- **Dashboard** con Auth por tenant y Row Level Security: Atención, Redes, Negocio,
  cola de **Aprobaciones** de contenido, y edición de la identidad del asistente.
- **Comunidad:** clasificación de comentarios/DMs, respuestas genéricas, detección de
  interés → aviso a humano (sin DM automático de captación).
- **Reportes:** `metrics_daily`/`insights` → reporte semanal en Drive + resumen, y
  visibles en el panel.

**DoD:** el cliente entra a su panel, ve sólo sus datos, aprueba contenido desde ahí,
recibe un reporte semanal accionable, y los comentarios/DMs quedan clasificados con lo
importante derivado a una persona.

---

## Fase 6 — Escalabilidad SaaS (segundo cliente)

- Onboarding self-service, panel de administración multi-tenant, facturación por cliente.
- Aislar clientes grandes en contenedor dedicado si hace falta (Modelo C).
- Documentación de operación y runbooks.

**DoD:** dar de alta un segundo cliente (Martina para una clínica, Laura para una
inmobiliaria…) es **sólo configuración**: completar el formulario y activar módulos,
sin escribir código nuevo.

---

## Orden y por qué

```
Fase 0  Arquitectura          (pensar antes de construir)
Fase 1  Infraestructura        (sin cimientos no hay nada)
Fase 2  WhatsApp "Sofía"       (valor y plata primero → genera datos)
Fase 3  Onboarding             (automatizar el alta con lo aprendido)
Fase 4  Contenido + métricas   (crecer, con humano aprobando)
Fase 5  Dashboard (+ com/rep)  (que el cliente vea y apruebe)
Fase 6  SaaS                   (segundo cliente sin reescribir)
```

**No** arrancamos por contenido/imágenes (lo vistoso) porque sin fundaciones ni datos
reales sería frágil y genérico. WhatsApp con Sofía primero: es lo que el estudio
necesita ya, y le da materia prima (FAQs reales, consultas) al resto. El Dashboard
llega cuando ya hay datos que mostrar y contenido que aprobar.
