# Plataforma de Automatización — "Empleado Digital"

> Dossier de arquitectura (Fase 0). **Antes de escribir un solo workflow de n8n.**
> Autor: rol CTO del proyecto · Estado: propuesta para aprobación.

Este directorio define **cómo** vamos a construir la plataforma antes de construirla.
El primer cliente es el estudio **Abogado Neuquén** (contacto: Nicolás Camilo
Echevarría), pero todo se diseña **multi-cliente y reutilizable** desde el día uno.

## Índice

| Doc | Qué responde |
|---|---|
| [`arquitectura.md`](./arquitectura.md) | Cómo se conectan las piezas. Multi-tenant, VPS, n8n, datos, diagrama. |
| [`seguridad-y-legal.md`](./seguridad-y-legal.md) | **El documento más importante.** Secreto profesional, Ley 25.326, políticas de Meta/WhatsApp, credenciales, backups. |
| [`modulos.md`](./modulos.md) | Diseño de los 6 módulos (onboarding, WhatsApp, contenido, visual, comunidad, reportes). |
| [`costos.md`](./costos.md) | Qué se paga sí o sí y qué se reemplaza por gratis. Números reales. |
| [`roadmap.md`](./roadmap.md) | Fases de desarrollo, en orden, con criterio de "listo". |

## Resumen ejecutivo (TL;DR del CTO)

1. **La idea es buena y es construible**, pero tal como está planteada tiene
   **cuatro riesgos que hundirían el proyecto** si no se resuelven primero:
   - **Secreto profesional / responsabilidad legal.** Un abogado no puede filtrar
     consultas de clientes a modelos de IA de terceros ni dar asesoramiento legal
     automático. El asistente **tritura, deriva y agenda — nunca asesora.**
   - **WhatsApp oficial.** Sólo Cloud API (Meta) o un BSP. Nada de librerías no
     oficiales (Baileys / whatsapp-web.js) → baneo garantizado y riesgo reputacional.
   - **Automatización en Instagram/Facebook.** Publicar sí (API oficial). Auto-DM
     masivo a "potenciales clientes" **viola las políticas de Meta** y quema la
     cuenta. La captación se hace con humano en el loop.
   - **Multi-tenant de verdad.** Un n8n con workflows sueltos por cliente no escala.
     Necesitamos separación por `tenant_id`, config en base de datos y un vault de
     credenciales.

2. **El stack propuesto es correcto** (n8n + Docker + VPS + Postgres/Supabase +
   Google Workspace + Cloud API + IA), con matices que están en cada doc.

3. **Construimos en fases.** No arrancamos por lo vistoso (contenido IA) sino por
   los cimientos: identidad multi-tenant, seguridad, y el módulo que da valor y
   plata más rápido → **WhatsApp de triaje + agenda**.

4. **Regla de oro:** cada módulo tiene que poder **apagarse por cliente** sin tocar
   a los demás. Modularidad no es un adorno; es la condición para vender esto a un
   segundo cliente sin reescribir nada.

## Cómo seguir

Leé los docs en el orden de la tabla. Cuando apruebes la arquitectura y el roadmap,
arrancamos por la **Fase 1** (fundaciones + módulo WhatsApp), módulo por módulo.
