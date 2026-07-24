# Diseño de los 6 módulos

Cada módulo se activa/desactiva por tenant. Acá está el diseño funcional y las
decisiones de arquitecto — no el JSON de n8n todavía.

---

## Módulo 1 — Onboarding automático de clientes

**Objetivo:** que dar de alta un cliente nuevo sea un formulario, no un proyecto.

**Flujo:**
1. Formulario (Supabase / Google Forms / typeform-like) con las secciones pedidas:
   negocio, identidad de marca, público, comunicación, y **subida de archivos**
   (logos, fotos, certificados, PDFs).
2. Al enviar → webhook a n8n que:
   - crea el registro `tenants` + `tenant_config`,
   - crea en Google Drive la carpeta del cliente con la estructura estándar,
   - mueve/organiza los archivos subidos a sus subcarpetas,
   - convierte las respuestas en la **base de conocimiento** (`knowledge_base`, con
     embeddings) que después alimenta a los otros módulos,
   - deja la config lista con los módulos que ese cliente contrató (flags).

**Estructura Drive por cliente:**
```
CLIENTES/
  <Nombre del cliente>/
    Logos/
    Fotos/
    Documentos/
    Contenido/         (borradores y piezas aprobadas)
    Reportes/
    _config/           (export de la config, para reconstruir)
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
- Estado de cada pieza en `content_items`: `borrador → aprobado → programado →
  publicado`.

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

## Cómo se encadenan

```
Onboarding ──► define la marca y activa módulos
     │
     ├─► WhatsApp ──► genera FAQs reales + turnos ──┐
     │                                              │
     ├─► Contenido ◄── usa FAQs reales              │ alimentan
     │        │                                     │
     │        └─► Visual (piezas)                   │
     ├─► Comunidad ──► más consultas ───────────────┤
     │                                              ▼
     └────────────────────────────────────────► Reportes
```

El **WhatsApp** es el corazón: genera los datos que hacen bueno a todo lo demás. Por
eso es lo primero que construimos después de las fundaciones.
