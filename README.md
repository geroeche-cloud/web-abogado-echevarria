# Abogado Neuquén — Nicolás Camilo Echevarría

Landing de **marca personal** (NO firma/estudio) del abogado Nicolás Camilo Echevarría,
Matrícula N° 4085, Neuquén. Especialidad en Derecho Penal, atiende todas las materias.
Sitio estático sin build: HTML + CSS + JavaScript puro, GSAP para animaciones de scroll.

## Identidad

- Paleta navy `#0E1628` / `#1E2D45` · dorado `#B8924A` (solo acento) · blanco
- Tipografías: Cormorant Garamond (títulos) + Instrument Sans (cuerpo)
- Logo: sello NEUQUÉN (balanza + laurel) en favicon / intro / nav / footer
- Voz de copy: **plural** ("Brindamos, Acompañamos, Nos especializamos") aunque hay un solo abogado
- **Nunca** usar "firma / estudio / equipo / socios / Dr." — es marca personal

## Estructura (7 bloques, lectura 2–4 min)

```
1 Hero          ← retrato real (nicolas.jpg) + posicionamiento + CTAs
2 Franja confianza (matrícula, especialidad, diplomas)
3 Perfil profesional (about del abogado, stats, highlights) — voz plural
4 Áreas         ← Penal DESTACADO con 6 sub-materias + 5 áreas secundarias
5 Credenciales  ← 10 certificados reales; tarjetas → modal con PDF (assets/certs/)
6 Proceso       ← 5 pasos con viga de oro que se dibuja al scroll
7 Contacto      ← formulario + WhatsApp + footer
```

## Archivos

```
index.html       lib/manifest.js (DATOS: contacto, criminal, areas, credentials, process)
styles.css       main.js (mounts + animaciones + modal credenciales)
assets/img/      nicolas.jpg (retrato), favicon.svg (sello)
assets/certs/    10 PDFs de certificados/diplomas
vercel.json      .htaccess (solo Apache; Vercel lo ignora)
```

Fuentes originales del cliente: `../foto profesional editada nicolas.png`,
`../nuevo contenido/` (CV + ZIP de certificados), `../contenido/` (foto edificio judicial).

## Cómo escalar

- Agregar credencial/área/paso = editar `lib/manifest.js`.
- Tras editar CSS/JS, bumpear `?v=` en `index.html`.

## Pipeline (configurado)

```
git commit → git push → GitHub (geroeche-cloud/web-abogado-echevarria)
           → Vercel auto-deploy → https://web-abogado-echevarria.vercel.app
```

## Pendiente

- Dominio **neuquenabogados.com** (Porkbun): requiere TXT `_vercel` (verificación) +
  A `76.76.21.21` + CNAME www → valor del panel de Vercel. Está vinculado a otra cuenta.
- Si el cliente da el **logo PNG original**, guardarlo como `assets/img/logo.png` y
  reemplazar los SVG del sello.
