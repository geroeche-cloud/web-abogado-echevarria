# Costos: qué se paga y qué se reemplaza por gratis

> Valores orientativos; el detalle real hay que confirmarlo al contratar. La idea es
> que puedas arrancar barato y pagar sólo cuando el volumen lo justifique.

## Se paga sí o sí (o casi)

| Ítem | Por qué es inevitable | Alternativa / mitigación |
|---|---|---|
| **VPS** | Corre n8n + DB 24/7. | El más chico alcanza para arrancar; se escala después. Es el gasto fijo base. |
| **Dominio** | Webhooks con HTTPS válido + el sitio. | Ya en marcha (neuquenabogados.com). |
| **WhatsApp Cloud API** | Canal oficial; cobra por conversación fuera del tier gratis. | Hay un tramo gratuito mensual de conversaciones; las de servicio (respuesta dentro de 24 h) son más baratas o gratis según el esquema vigente de Meta. Se paga por volumen real. |
| **IA (texto)** | Triaje, FAQs, contenido. | Costo por uso: se controla mandando poco contexto y usando el router para no llamar al modelo de más. |
| **IA (imágenes)**, si se usa | Generación visual. | **Reemplazable**: empezar con plantillas de marca (gratis) y usar IA sólo para piezas puntuales. |

## Se puede empezar gratis (y pagar sólo si crece)

| Necesidad | Opción gratis / incluida | Cuándo conviene pagar |
|---|---|---|
| **Orquestación (n8n)** | **n8n self-hosted** (Community, gratis) en tu VPS. | n8n Cloud si no querés mantener infra. Con VPS propio, gratis. |
| **Base de datos** | **Supabase free tier** o Postgres propio en el VPS (gratis). | Supabase de pago cuando crezcan datos/usuarios del panel. |
| **Almacenamiento documental** | **Google Drive** del plan que ya tenga el estudio. | Google Workspace si hace falta más espacio/cuentas de servicio. |
| **Calendario / Mail** | **Google Calendar / Gmail** ya existentes. | — |
| **Publicación en Instagram/FB** | **Graph API oficial** (gratis; el costo es el desarrollo). | — |
| **Analítica de redes** | APIs oficiales + métricas propias en Postgres (gratis). | Una herramienta de analytics paga sólo si el cliente la pide. |
| **Backups** | Scripts de dump + Drive/almacenamiento de objetos barato. | Servicio de backup administrado a mayor escala. |
| **Control de versiones / CI** | **GitHub** (gratis para esto). | — |
| **Reverse proxy / TLS** | **Caddy** (gratis, TLS automático). | — |

## Estrategia de costos del CTO

1. **Fundaciones y WhatsApp con casi todo gratis:** VPS + n8n self-hosted + Supabase
   free + Google que ya existe. El único costo variable real al principio es la IA de
   texto (poca) y las conversaciones de WhatsApp por encima del tier gratis.
2. **La IA de imágenes se pospone.** Plantillas primero; generación por IA cuando haya
   demanda y presupuesto.
3. **Pagás por cliente, no por adelantado.** Como todo es multi-tenant, sumar un
   segundo cliente casi no agrega costo fijo — mejora el margen. Ese es el modelo SaaS.
4. **Presupuesto mensual inicial esperable:** VPS + dominio (fijos y bajos) + un
   variable chico de IA/WhatsApp que crece sólo si crece el uso. Sin sorpresas.

## Regla para decidir "pago o no pago"

> ¿Es un canal oficial obligatorio (WhatsApp/Meta) o infra que debe estar 24/7 (VPS)?
> → se paga. ¿Es una comodidad que tiene equivalente self-hosted o free tier?
> → gratis hasta que el volumen lo justifique.
