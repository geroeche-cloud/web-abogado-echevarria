# Abogados Neuquén — Estudio Jurídico

Landing premium de la firma **Abogados Neuquén** (representante: Nicolás Camilo Echevarría, Abogado).
Sitio estático sin build: HTML + CSS + JavaScript puro, con GSAP para animaciones de scroll.

## Identidad

- Paleta: navy `#0E1628` / `#1E2D45` · dorado `#B8924A` (solo acento) · blanco
- Tipografías: Cormorant Garamond (títulos) + Instrument Sans (cuerpo)
- Logo: sello NEUQUÉN (balanza + laurel + texto) — favicon, intro, nav, footer y moneda giratoria

## Estructura

```
index.html      ← página única (8 bloques: hero, áreas, por qué, estudio,
                   banda de poder con balanza interactiva, equipo, proceso, contacto, footer)
styles.css      ← design system por capas (tokens → secciones → materiales → lujo en movimiento)
main.js         ← IIFE con mounts data-driven + animaciones (polvo de oro, tilt, balanza, etc.)
lib/manifest.js ← DATOS: contacto, áreas, equipo, proceso  ➜  editar acá para escalar
assets/img/     ← hero.jpg (torre de cristal, CC0), estudio-bg.jpg (columnas, CC0),
                   dr-echevarria.jpg (foto del representante), favicon.svg (sello)
vercel.json     ← deploy estático (framework null, sin build)
.htaccess       ← solo para hosting Apache (Hostinger); Vercel lo ignora
```

## Cómo escalar

- **Agregar un abogado**: sumar objeto en `team` dentro de `lib/manifest.js` (+ su foto en assets/img).
- **Agregar un área**: sumar objeto en `practiceAreas` (usar numeración romana y un glyph existente).
- Tras editar CSS/JS, **bumpear `?v=`** en `index.html` para invalidar caché.

## Pipeline (ya configurado)

```
editar → git commit → git push  →  GitHub (geroeche-cloud/web-abogado-echevarria)
                                    → Vercel auto-deploy (proyecto web-abogado-echevarria)
                                    → https://web-abogado-echevarria.vercel.app
```

## Pendientes conocidos

- **Dominio neuquenabogados.com** (Porkbun): requiere registro TXT `_vercel` para verificar
  (el dominio quedó vinculado a otra cuenta de Vercel; ver instrucciones en la sesión) y
  A `76.76.21.21` + CNAME www → valor que indique Vercel en el panel del proyecto.
- Si el cliente entrega el **logo PNG original**, guardarlo como `assets/img/logo.png`
  y reemplazar los SVG vectoriales del sello.
- Hay una **foto real del edificio judicial de Neuquén** en `../contenido/` disponible
  para reemplazar fondos por material 100% local.
