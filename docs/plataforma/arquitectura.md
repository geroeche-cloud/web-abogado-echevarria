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
│  IDENTIDAD DEL ASISTENTE (por tenant)                               │
│  Nombre · personalidad · tono · horarios · reglas de derivación     │
│  Ej.: "Sofía – Abogado Neuquén"  (config, no código)               │
└───────────────┬─────────────────────────────────────────────────────┘
                │
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
└───────┬─────────────────────────────────────────────────────────────┘
        │ lectura autenticada por tenant (RLS)
┌───────▼─────────────────────────────────────────────────────────────┐
│  DASHBOARD DEL CLIENTE (SaaS)                                       │
│  Login por tenant · Atención · Redes · Negocio · Aprobar contenido  │
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
- `tenant_config` — horarios de atención, plantillas, IDs de Drive/Calendar, número
  de WhatsApp, palabras vetadas. La config operativa del negocio.
- **`assistants`** — **identidad del asistente por tenant** (ver §9). Nombre,
  personalidad, tono, reglas de derivación, disclaimer. Ej.: "Sofía".
- `knowledge_base` — FAQs, servicios, textos aprobados. Con embeddings para RAG.
- `contacts` — personas que escriben (con consentimiento y origen).
- `conversations` / `messages` — historial por canal. Base del contexto y auditoría.
- `appointments` — turnos (espejo de Google Calendar, fuente de verdad operativa).
- `content_items` — piezas de contenido con **estado** (ver §10):
  `borrador → en_revision → aprobado → publicado → archivado`.
- `approvals` — decisiones humanas sobre contenido (quién aprobó/rechazó, cuándo, por
  qué). Alimenta la auditoría y el aprendizaje.
- `metrics_daily` — métricas acumuladas por día para reportes y dashboard.
- `insights` — aprendizajes derivados (FAQs top, horarios pico, contenido que rinde).
  **Siempre por tenant.** Ver riesgo de aprendizaje cruzado en seguridad §11.
- `dashboard_users` — usuarios que acceden al panel, atados a un `tenant_id`.
- `audit_log` — **quién/qué/cuándo**. Inmutable. Clave por el tema legal.

**Regla dura:** ninguna query cruza `tenant_id`. Se aplica con Row Level Security en
Supabase/Postgres, no sólo con `WHERE`. Esto vale igual para el dashboard: un usuario
sólo ve las filas de su tenant, garantizado por la base, no por la aplicación.

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
- No hacemos que el asistente se haga pasar por una persona humana (ver §9).
- No usamos datos de un cliente para "entrenar" o alimentar a otro (ver seguridad §11).

## 9. Identidad del asistente por tenant

Cada cliente tiene **un asistente con identidad propia** — "Sofía" para Abogado
Neuquén, "Martina" para una clínica, "Laura" para una inmobiliaria — **resuelto por
configuración, no por código**. Es una fila en `assistants`, no un sistema nuevo.

La identidad se compone de:

| Campo | Ejemplo (Sofía) |
|---|---|
| `name` | Sofía |
| `role` | Asistente de comunicaciones de Abogado Neuquén |
| `personality` | Cordial, resolutiva, sobria; trato de usted |
| `tone` | Profesional y cálido, sin tecnicismos legales |
| `communication_style` | Frases cortas, confirma antes de agendar |
| `business_hours` | Lu–Vi 9–18 (deriva/avisa fuera de horario) |
| `business_info` | Datos del estudio (desde `tenant_config`) |
| `faqs` | Referencia a `knowledge_base` |
| `derivation_rules` | Urgencia/tema X → humano; "humano" → humano |
| `disclaimer` | "Soy la asistente virtual del estudio; no brindo asesoramiento legal" |

**Cómo se usa:** los workflows arman el *system prompt* del LLM a partir de la fila
`assistants` del tenant + `knowledge_base` (RAG). El mismo workflow, distinto tenant,
da una Sofía o una Martina sin tocar una línea de código.

**Límite duro (transparencia):** Sofía tiene personalidad, **pero nunca finge ser una
persona humana.** Se presenta como asistente virtual del estudio. El detalle legal de
por qué esto es obligatorio (y no un capricho) está en seguridad §9.

## 10. Estados de contenido y aprobación humana

Nada sensible se publica solo. `content_items.status` es una **máquina de estados**:

```
borrador ──► en_revision ──► aprobado ──► publicado
    │             │              │
    └─────────────┴──────────────┴────────► archivado
```

- **borrador** — la IA generó la propuesta (copy, CTA, idea de pieza).
- **en_revision** — le llegó al cliente (dashboard o mensaje) para decidir.
- **aprobado** — el humano dio OK; queda listo para programarse/publicarse.
- **publicado** — salió por la API oficial; se registra fecha y resultado.
- **archivado** — rechazado o retirado; no se borra (queda para aprendizaje/auditoría).

Cada transición humana se registra en `approvals` + `audit_log`. **Sin estado
`aprobado`, ningún workflow publica.** Es una regla del sistema, no una convención.

## 11. Dashboard del cliente (capa SaaS)

Panel web donde cada cliente ve **sus** resultados y **aprueba contenido**. Secciones:

- **Atención:** consultas recibidas, clasificadas, citas agendadas, seguimientos.
- **Redes:** seguidores, alcance, interacciones, publicaciones, mejores contenidos.
- **Negocio:** nuevos contactos, conversiones, tendencias detectadas.
- **Aprobaciones:** cola de contenido en_revision → aprobar/rechazar.

**Cómo:** lee de Postgres/Supabase con **Auth por tenant y Row Level Security** — un
usuario sólo puede ver filas de su `tenant_id`, garantizado por la base de datos. El
panel **no** ejecuta automatizaciones: dispara acciones (aprobar) que n8n procesa.
Arranca simple (puede ser una app sobre Supabase) y evoluciona a producto SaaS. El
riesgo de aislamiento del dashboard está en seguridad §10.
