# Diseño de los módulos

Cada módulo se activa/desactiva por tenant. Acá está el diseño funcional y las
decisiones de arquitecto — no el JSON de n8n todavía.

---

## Módulo 0 — Identidad del asistente (capa transversal)

**Objetivo:** que cada cliente tenga su propio asistente (Sofía, Martina, Laura…)
**por configuración**, no por código.

**Qué es:** una fila en `assistants` por tenant con nombre, rol, personalidad, tono,
estilo de comunicación, horarios, reglas de derivación y disclaimer (tabla completa en
[`arquitectura.md`](./arquitectura.md) §9). Los workflows construyen el prompt del LLM
a partir de esa fila + la base de conocimiento del tenant.

**Ejemplo primer cliente:** *Sofía*, asistente de comunicaciones de Abogado Neuquén —
cordial, resolutiva, sobria, trato de usted, Lu–Vi 9–18, deriva urgencias a un humano.

**Decisiones de arquitecto:**
- Es **transversal**: el mismo motor de WhatsApp, comunidad y contenido toma la
  identidad del tenant en curso. Cambiar de cliente = cambiar de fila, nada más.
- **Personalidad sí, engaño no.** Sofía siempre se presenta como asistente virtual;
  no finge ser humana ni abogada (ver [`seguridad-y-legal.md`](./seguridad-y-legal.md)
  §8). Ese límite es parte del diseño, no una restricción externa.
- La identidad se genera en el onboarding y se puede editar desde el dashboard.

---

## Módulo 1 — Onboarding automático de clientes

**Objetivo:** que dar de alta un cliente nuevo sea un formulario, no un proyecto.

**Flujo:**
1. Formulario (Supabase / Google Forms / typeform-like) con las secciones pedidas:
   negocio, **identidad visual** (logo, colores, tipografías, manual de marca, fotos,
   videos, material comercial), **comunicación** (tono, público, servicios,
   diferenciales, FAQs), **marketing** (competidores, referencias, cuentas que
   admiran, tipo de contenido deseado) y **subida de archivos**.
2. Al enviar → webhook a n8n que:
   - crea el registro `tenants` + `tenant_config`,
   - **crea el asistente** (`assistants`): nombre, personalidad, tono y reglas de
     derivación a partir de las respuestas (ver Módulo 0),
   - crea en Google Drive la carpeta del cliente con la estructura estándar,
   - mueve/organiza los archivos subidos a sus subcarpetas,
   - convierte las respuestas en la **base de conocimiento** (`knowledge_base`, con
     embeddings) que después alimenta a los otros módulos,
   - deja la config lista con los módulos que ese cliente contrató (flags).

**Estructura Drive por cliente:**
```
CLIENTES/
  <Nombre del cliente>/
    Identidad/
      Logos/
      Colores/
      Recursos visuales/
    Multimedia/
      Fotos/
      Videos/
    Documentación/
      PDFs/
      Información interna/
    Contenido/
      Publicaciones/
      Historias/
      Campañas/
    Reportes/
    _config/           (export de la config y de la identidad del asistente)
```

**Decisiones de arquitecto:**
- El formulario es la **única fuente de verdad de la marca**; todo lo demás la
  consume. Si cambia el tono, se cambia acá y se propaga.
- Subida de archivos con **validación** (tipo, tamaño, y aviso si un doc trae datos
  personales de terceros → ver seguridad §2).
- El onboarding **no** dispara nada público automáticamente; deja todo preparado y
  en estado "revisar".

---

## Módulo 2 — Asistente inteligente de WhatsApp (el que da plata primero)

**Objetivo:** atender, triar y agendar 24/7 **sin asesorar**.

**Capacidades:**
- Responde FAQs desde `knowledge_base` (RAG), en el tono del cliente.
- Detecta **intención** (consulta general, pedir turno, urgencia, otro) y **clasifica**
  la materia a alto nivel.
- Pide los datos mínimos necesarios (nombre, motivo en una línea, preferencia horaria).
- **Detecta urgencias** y las deriva a un humano de inmediato.
- Agenda turnos y maneja confirmaciones/recordatorios.

**Al crear una cita:**
1. Crea el evento en Google Calendar (chequeando disponibilidad real).
2. Envía confirmación al cliente final.
3. Avisa a Nicolás por WhatsApp (o canal interno).
4. Programa el recordatorio del día del turno (con **plantilla aprobada**, por la
   ventana de 24 h — ver seguridad §3).

**Integra con:** Google Calendar, Postgres (`conversations`, `appointments`),
notificaciones internas.

**Decisiones de arquitecto:**
- **Router primero, IA después.** Un nodo clasifica; sólo lo que amerita va al LLM.
  Barato y predecible.
- **Máquina de estados** de la conversación (saludo → intención → datos → agenda →
  confirmación), no un chat libre. Menos alucinación, más control.
- **Disclaimer legal** en el primer mensaje. **Fallback humano** siempre disponible
  ("escribí *humano* para hablar con una persona").
- Toda la conversación queda en `messages` para contexto y auditoría.

---

## Módulo 3 — Sistema de contenido para Instagram

**Objetivo:** contenido con criterio, no genérico. **Con humano aprobando.**

**Flujo semanal:**
1. **Análisis** (datos públicos/APIs permitidas): qué temas del estudio generan
   interacción, preguntas frecuentes reales (de WhatsApp), tendencias del sector legal.
2. **Propuesta:** calendario semanal → 3 publicaciones, historias, ideas de reels,
   carruseles educativos, con copies y CTAs, **en el tono del cliente**.
3. **Aprobación humana** (panel / mensaje). Nada se publica sin OK.
4. **Publicación** vía API oficial (Content Publishing API) en las fechas fijadas.

**Decisiones de arquitecto:**
- El contenido legal es **borrador hasta aprobación** (ver seguridad §1). Un carrusel
  "educativo" con una imprecisión jurídica es un problema real.
- Reutiliza la base de conocimiento y las FAQs reales de WhatsApp → contenido que
  responde lo que la gente efectivamente pregunta.
- Estado de cada pieza en `content_items` (máquina de estados de
  [`arquitectura.md`](./arquitectura.md) §10): `borrador → en_revision → aprobado →
  publicado → archivado`. **Sin `aprobado`, nada se publica.** La aprobación ocurre en
  el Dashboard (Módulo 7).

---

## Módulo 4 — Generación visual

**Objetivo:** piezas visuales coherentes con la marca definida en el onboarding.

**Cómo respeta la marca:** colores, tipografía, estilo y público salen de
`tenant_config`. El generador recibe esa "guía de marca" en cada pedido.

**Decisiones de arquitecto:**
- Empezar con **plantillas de marca** (más barato, más consistente, más rápido) y
  sumar generación por IA para piezas puntuales, no al revés.
- **Cuidado con derechos y con caras de personas reales.** Nada de generar imágenes
  que parezcan personas identificables sin consentimiento, ni usar fotos de clientes
  sin permiso.
- Control de costo: la generación por IA se dispara sólo para piezas aprobadas.

---

## Módulo 5 — Comunidad

**Objetivo:** ordenar la interacción, **respetando las políticas de plataforma**.

**Qué hace:**
- Clasifica comentarios y DMs entrantes (consulta, spam, potencial cliente, otro).
- Responde comentarios genéricos apropiados (sin asesorar).
- **Detecta interés comercial → avisa a un humano.** No hace DM automático de
  captación (ver seguridad §4).
- Deriva lo importante al canal interno.

**Decisiones de arquitecto:** humano en el loop para todo lo que sea contacto
proactivo. El módulo **asiste** la comunidad, no la reemplaza.

---

## Módulo 6 — Reportes

**Objetivo:** un reporte semanal que se lee en 2 minutos y sirve para decidir.

**Contenido:** crecimiento, alcance, publicaciones destacadas, consultas recibidas
(de WhatsApp), turnos agendados/conversión, y **recomendaciones accionables**.

**Cómo:** `metrics_daily` se llena a diario desde cada módulo; el domingo un workflow
arma el reporte (documento en la carpeta `Reportes/` del Drive del cliente + resumen
por WhatsApp/mail).

**Decisiones de arquitecto:**
- Las métricas se **acumulan a diario**, el reporte sólo las lee. Nada de recalcular
  todo el domingo.
- Las "recomendaciones" salen de reglas + IA sobre datos propios, no de opiniones
  genéricas.

---

## Módulo 7 — Dashboard del cliente

**Objetivo:** que el cliente vea sus resultados y **apruebe contenido** desde un panel.

**Secciones:**
- **Atención:** consultas recibidas, clasificadas, citas agendadas, seguimientos.
- **Redes:** seguidores, alcance, interacciones, publicaciones, mejores contenidos.
- **Negocio:** nuevos contactos, conversiones, tendencias detectadas.
- **Aprobaciones:** cola de contenido `en_revision` → aprobar / rechazar (Módulo 3).
- **Ajustes:** editar la identidad del asistente (Módulo 0) y horarios.

**Decisiones de arquitecto:**
- Lee de Postgres/Supabase con **Auth por tenant y Row Level Security** — un usuario
  sólo ve su `tenant_id`, garantizado por la base (ver
  [`seguridad-y-legal.md`](./seguridad-y-legal.md) §9). Es la pieza que más rápido
  filtra datos si se hace mal: aislamiento primero, features después.
- El panel **no ejecuta** automatizaciones: registra decisiones (aprobar, editar) que
  n8n procesa. Separa la cara visible del motor.
- Arranca mínimo (atención + aprobaciones) y evoluciona hacia el SaaS.

---

## Sistema de métricas y aprendizaje (transversal)

Todos los módulos escriben a `metrics_daily`; un proceso deriva `insights` (FAQs top,
servicios más consultados, horarios pico, contenido que rinde, temas que interesan).
Esos insights alimentan las recomendaciones de contenido y el reporte.

**Regla dura:** los insights son **por tenant y no se cruzan** entre clientes (ver
[`seguridad-y-legal.md`](./seguridad-y-legal.md) §10). Un benchmark de rubro, si algún
día se hace, va con datos anonimizados y agregados, no antes.

---

## Cómo se encadenan

```
Onboarding ──► crea Sofía (identidad) + marca + activa módulos
     │
     ├─► WhatsApp (Sofía) ──► FAQs reales + turnos ─┐
     │                                              │
     ├─► Contenido ◄── usa FAQs reales              │ alimentan
     │     (estados: borrador→revisión→aprobado)    │ métricas
     │        │        ▲                            │
     │        │        └── aprueba en el Dashboard  │
     │        └─► Visual (piezas)                   │
     ├─► Comunidad ──► más consultas ───────────────┤
     │                                              ▼
     └──────────────────────────► Métricas ──► Reportes + Dashboard
```

El **WhatsApp** es el corazón: genera los datos que hacen bueno a todo lo demás. Por
eso es lo primero que construimos después de las fundaciones. El **Dashboard** y el
**aprendizaje** son transversales: consumen lo que los demás producen.
