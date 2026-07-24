# Arquitectura técnica

## 1. Principios de diseño

1. **Multi-tenant desde el día cero.** Todo dato, archivo, credencial y ejecución
   está atado a un `tenant_id`. No existe "el cliente" en singular en el código.
2. **Modular y apagable.** Cada módulo (WhatsApp, contenido, reportes…) se activa o
   desactiva por cliente vía un flag en la config. Un cliente puede tener sólo
   WhatsApp; otro, sólo contenido.
3. **Config sobre código.** El comportamiento por cliente vive en base de datos
   (base de conocimiento, tono, horarios, plantillas), no hardcodeado en workflows.
   Un workflow de n8n es genérico y recibe el `tenant_id`.
4. **Humano en el loop donde hay riesgo.** Nada que implique asesorar, captar o
   publicar algo sensible sale sin aprobación humana en las primeras versiones.
5. **Todo se puede reconstruir.** Infra como código (Docker Compose + `.env` fuera
   del repo), backups automáticos, y config exportable.

## 2. Vista de capas

```
┌─────────────────────────────────────────────────────────────────────┐
│  CANALES (donde vive el cliente final)                              │
│  WhatsApp Cloud API · Instagram/FB Graph API · Web/Formulario       │
└───────────────┬─────────────────────────────────────────────────────┘
                │ webhooks / API
┌───────────────▼─────────────────────────────────────────────────────┐
│  ORQUESTACIÓN — n8n (queue mode) en Docker sobre VPS                 │
│  Workflows GENÉRICOS parametrizados por tenant_id                   │
│  · Router de mensajes  · Triaje IA  · Agenda  · Content pipeline    │
└───────┬───────────────────────────┬─────────────────────────────────┘
        │                           │
┌───────▼────────┐        ┌─────────▼──────────┐   ┌──────────────────┐
│ CAPA DE DATOS  │        │  CAPA DE IA        │   │  CAPA DOCUMENTAL │
│ Postgres       │        │  LLM (texto)       │   │  Google Drive    │
│  · tenants     │        │  Visión / imágenes │   │  (por tenant)    │
│  · knowledge   │        │  Embeddings/RAG    │   │  Google Calendar │
│  · conversations│       │  (proveedor conf.  │   │  Gmail           │
│  · appointments│        │   por tenant)      │   └──────────────────┘
│  · content     │        └────────────────────┘
│  · audit_log   │
└───────┬────────┘
        │
┌───────▼─────────────────────────────────────────────────────────────┐
│  SECRETOS Y OBSERVABILIDAD                                          │
│  Vault de credenciales · Logs centralizados · Métricas · Backups   │
└─────────────────────────────────────────────────────────────────────┘
```

## 3. Decisión: ¿un n8n para todos o uno por cliente?

Tres modelos y la recomendación:

| Modelo | Aislamiento | Costo | Veredicto |
|---|---|---|---|
| **A. n8n compartido, workflows genéricos + `tenant_id`** | Lógico (por datos) | 1 VPS | ✅ **Empezamos acá.** Máxima reutilización, un solo lugar que mantener. |
| B. n8n compartido, un juego de workflows por cliente | Bajo (copias divergen) | 1 VPS | ❌ Se vuelve inmanejable al 3.º cliente. |
| C. Un n8n (contenedor) por cliente | Fuerte | N× recursos | 🔜 Sólo para clientes grandes/regulados más adelante. |

**Modelo A.** Los workflows no saben de "Nicolás": reciben un `tenant_id`, cargan la
config de ese tenant desde Postgres y actúan. Migrar un cliente a un contenedor
dedicado (Modelo C) es después una cuestión de infra, no de reescribir lógica.

## 4. Base de datos (esquema conceptual)

Postgres es el cerebro. **Supabase** es Postgres administrado + Auth + Storage + API
REST/realtime → lo usamos para arrancar rápido (y para el formulario de onboarding y
un futuro panel). Se puede migrar a Postgres propio en el VPS sin cambiar el modelo.

Tablas núcleo (todas con `tenant_id` salvo `tenants`):

- `tenants` — cliente/negocio. Rubro, estado, módulos activos (JSON de flags).
- `tenant_config` — tono, palabras vetadas, horarios de atención, plantillas,
  IDs de Drive/Calendar, número de WhatsApp. La "personalidad" del empleado digital.
- `knowledge_base` — FAQs, servicios, textos aprobados. Con embeddings para RAG.
- `contacts` — personas que escriben (con consentimiento y origen).
- `conversations` / `messages` — historial por canal. Base del contexto y auditoría.
- `appointments` — turnos (espejo de Google Calendar, fuente de verdad operativa).
- `content_items` — piezas de contenido (borrador → aprobado → publicado).
- `metrics_daily` — métricas para reportes.
- `audit_log` — **quién/qué/cuándo**. Inmutable. Clave por el tema legal.

**Regla dura:** ninguna query cruza `tenant_id`. Se aplica con Row Level Security en
Supabase/Postgres, no sólo con `WHERE`.

## 5. n8n en producción

- **Docker Compose** con: `n8n` (queue mode: `main` + `worker`), `postgres`
  (backend de n8n, separado del Postgres de negocio), `redis` (cola).
- **Queue mode** desde el inicio: separa la ejecución de la UI, permite reintentos y
  escala horizontal sumando workers. Un solo proceso `main` se satura con volumen.
- **Reverse proxy** (Caddy o Traefik) con TLS automático. n8n nunca expuesto directo.
- **Webhooks** entrantes (WhatsApp/Meta) → dominio con HTTPS válido → n8n.
- **`N8N_ENCRYPTION_KEY`** fuera del repo, respaldada aparte (sin ella, las
  credenciales guardadas en n8n son irrecuperables).

## 6. Capa de IA (abstraída)

No atamos la plataforma a un proveedor de IA. Definimos un **contrato** ("dame texto
en este tono con este contexto", "clasificá esta intención", "generá esta imagen") y
detrás puede haber uno u otro modelo. Esto importa porque:

- El **proveedor de IA es configurable por tenant** (un cliente en rubro sensible
  puede exigir cierto proveedor / no-entrenamiento / retención cero).
- Permite optimizar costo/calidad por tarea (triaje barato, contenido premium).
- El detalle de qué se le manda al modelo y qué NO está en
  [`seguridad-y-legal.md`](./seguridad-y-legal.md).

## 7. GitHub y despliegue

- **Este repo** ya versiona el sitio web. La plataforma vive junto a él (mono-repo)
  o en un repo hermano; para arrancar, `docs/` + `infra/` + `n8n/` acá alcanza.
- Infra como código: `docker-compose.yml`, `.env.example` (nunca `.env`), y los
  workflows de n8n **exportados como JSON** al repo (versionados y revisables).
- CI opcional: validar JSON de workflows y linProxy secretos antes de merge.

## 8. Qué NO hacemos (anti-objetivos)

- No usamos librerías no oficiales de WhatsApp.
- No damos asesoramiento legal automático.
- No hacemos DM masivo ni scraping que viole ToS de las plataformas.
- No guardamos secretos en el repo ni en los workflows en texto plano.
- No mezclamos datos entre clientes: si dudás, es un `tenant_id` nuevo.
