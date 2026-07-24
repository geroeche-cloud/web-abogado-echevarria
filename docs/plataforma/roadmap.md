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

## Fase 2 — Módulo WhatsApp (triaje + agenda) 🎯 el que da valor primero

- Número dedicado + Meta Business verificado + Cloud API conectada.
- Webhook → router → máquina de estados de conversación.
- FAQs por RAG desde `knowledge_base` + disclaimer legal + fallback humano.
- Agenda: chequeo de disponibilidad, evento en Calendar, confirmación al cliente,
  aviso a Nicolás, recordatorio con plantilla aprobada.
- Todo registrado en Postgres + `audit_log`.

**DoD:** una persona escribe, el bot responde una FAQ en el tono correcto, agenda un
turno real que aparece en Calendar, Nicolás recibe el aviso, y al día del turno llega
el recordatorio. Con "escribí humano" siempre disponible.

---

## Fase 3 — Onboarding automático

Ahora que sabemos qué config necesita un cliente (lo aprendimos armando la Fase 2),
automatizamos el alta.

- Formulario completo (negocio, marca, público, comunicación, archivos).
- Webhook → crea tenant + config + carpeta Drive con estructura + base de conocimiento.
- Validación de archivos y aviso de datos personales de terceros.

**DoD:** completar el formulario deja un tenant nuevo 100% listo para activar módulos,
sin tocar nada a mano.

---

## Fase 4 — Contenido + Visual (con humano aprobando)

- Pipeline semanal: análisis → propuesta de calendario → borradores (copies, CTAs,
  ideas de reels/carruseles) → **aprobación humana** → publicación por API oficial.
- Visual: plantillas de marca primero; IA para piezas puntuales.

**DoD:** cada semana se genera una propuesta que Nicolás aprueba con un clic, y lo
aprobado se publica solo en las fechas fijadas. Nada se publica sin OK.

---

## Fase 5 — Comunidad + Reportes

- Comunidad: clasificación de comentarios/DMs, respuestas genéricas, detección de
  interés → aviso a humano (sin DM automático de captación).
- Reportes: métricas diarias acumuladas → reporte semanal en Drive + resumen.

**DoD:** llega un reporte semanal claro y accionable, y los comentarios/DMs quedan
clasificados con lo importante derivado a una persona.

---

## Fase 6 — Producto SaaS (segundo cliente)

- Onboarding self-service, panel de administración, facturación por cliente.
- Aislar clientes grandes en contenedor dedicado si hace falta (Modelo C).
- Documentación de operación y runbooks.

**DoD:** dar de alta un segundo cliente (médico, inmobiliaria, etc.) no requiere
escribir código nuevo: sólo completar el formulario y activar módulos.

---

## Orden y por qué

```
Fase 0  Arquitectura        (pensar antes de construir)
Fase 1  Fundaciones          (sin cimientos no hay nada)
Fase 2  WhatsApp             (valor y plata primero → genera datos)
Fase 3  Onboarding           (automatizar el alta con lo aprendido)
Fase 4  Contenido + Visual   (crecer, con humano en el loop)
Fase 5  Comunidad + Reportes (ordenar y medir)
Fase 6  SaaS                 (segundo cliente sin reescribir)
```

**No** arrancamos por contenido/imágenes (lo vistoso) porque sin fundaciones ni datos
reales sería frágil y genérico. WhatsApp primero: es lo que el estudio necesita ya, y
es lo que le da materia prima (FAQs reales, consultas) al resto.
