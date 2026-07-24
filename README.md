# Abogado Neuquén

Sitio de **Abogado Neuquén**, estudio de abogados en Neuquén Capital y provincia.
Atiende todas las materias, con **mayor dedicación al derecho penal** (no es una
especialidad formal: no usar "especialista en penal").

Sitio estático sin build: HTML + CSS + JavaScript puro. Sin framework, a propósito.

## Identidad

- Paleta navy `#0E1628` · dorado `#B8924A` (solo acento) · papel `#F7F6F3`
- Tipografías: Cormorant Garamond (títulos) + Instrument Sans (cuerpo)
- **Logo: `assets/img/logo.png` — es el logo real de la marca, es inmodificable.**
  El header es navy justamente para que el emblema crema se lea sin retocarlo.
  `logo-original.png` guarda el archivo tal como lo entregó el cliente.
- El título de arriba a la izquierda dice **solo "Abogado Neuquén"**, sin nombres.
- Voz de copy: **plural institucional** ("Brindamos, Acompañamos, Trabajamos").
- Es un **conjunto de abogados**, pensado para sumar profesionales. No presentarlo
  como el sitio personal de un solo abogado.

## Páginas

```
index.html              Hero + franja de datos + quiénes somos + equipo (resumen)
                        + áreas + certificados + CTA
areas-de-practica.html  Acordeón: Penal destacado y abierto + 5 áreas
equipo.html             Integrantes (perfil completo) + certificados por profesional
contacto.html           Datos + formulario
```

La navegación usa `cleanUrls` de Vercel: en producción las URLs van **sin `.html`**.
`initNav` normaliza ambas formas para marcar la página activa.

## Datos — `lib/manifest.js`

Todo el contenido variable vive acá. `window.__BRAND__`:

| Clave | Qué es |
|---|---|
| `brand`, `tagline` | Marca |
| `contact` | Teléfono, WhatsApp, email, Instagram, ubicación |
| `trust` | Señales de confianza |
| `team[]` | **Integrantes.** Cada uno con `name`, `role`, `matricula`, `photo`, `focus`, `bio[]`, `data[][]` y **`credentials[]` propias** |
| `criminal`, `areas[]` | Áreas de práctica (acordeón) |
| `process[]` | Pasos del proceso |

**Los certificados son de cada abogado y nunca se mezclan**: viven dentro de
`team[i].credentials`, y el carrusel arma un bloque por profesional, encabezado
con su nombre.

### Sumar un abogado

Agregar un objeto a `team[]` con su foto en `assets/img/` y sus certificados en
`assets/certs/`. La home y `equipo.html` se arman solas.

## Certificados

`assets/certs/` tiene el PDF original y un JPG (900 px) de cada uno. El JPG es lo
que se muestra en el carrusel infinito (`.cert-marquee`); el PDF queda como respaldo.
Para regenerar un JPG desde un PDF: `npx pdf-to-img@4` y luego reducir a 900 px.

⚠️ **Los certificados muestran el DNI del titular.** Antes de publicar en el dominio
definitivo, decidir si se tapan esos datos.

## Cómo tocar el sitio

- Contenido → `lib/manifest.js`
- Estilos → `styles.css` · Comportamiento → `main.js`
- **Después de editar CSS/JS hay que bumpear `?v=` en las 4 páginas** (cache busting).

## Pipeline

```
git commit → git push → GitHub (geroeche-cloud/web-abogado-echevarria)
           → Vercel auto-deploy → https://web-abogado-echevarria.vercel.app
```

`npx vercel deploy --yes` genera un link **de preview** (temporal, para mostrar sin
publicar). `npx vercel deploy --prod` publica en producción.

## Pendiente

- Dominio **neuquenabogados.com** (Porkbun): requiere TXT `_vercel` (verificación) +
  A `76.76.21.21` + CNAME `www` → valor del panel de Vercel. Estaba vinculado a otra
  cuenta de Vercel. Ojo: el panel traducido muestra `vc-dominio-verify`; el valor real
  es `vc-domain-verify`.
- Decidir sobre el DNI visible en los certificados.
