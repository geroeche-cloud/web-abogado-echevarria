# Web — Nicolás Camilo Echevarría, Abogado (Neuquén)

Sitio web estático de defensa penal. Sin frameworks ni build: HTML + CSS + JavaScript puro.

## Estructura

```
index.html      ← página única
styles.css      ← estilos
main.js         ← interacciones (alertas, formulario, animaciones)
lib/            ← GSAP, ScrollTrigger y datos de contacto (manifest.js)
assets/img/     ← fotografías
.htaccess       ← configuración de caché para Hostinger/Apache
```

## Cómo publicar

**Hostinger / hosting con Apache:** subir todo el contenido de esta carpeta (incluido el `.htaccess`, que es un archivo oculto) a `public_html`.

**GitHub Pages:** en Settings → Pages, elegir la rama `main` y carpeta `/ (root)`.

## Cómo editar los datos de contacto

Los teléfonos, email e Instagram están en `lib/manifest.js` y también escritos directamente en `index.html` (buscar `5492994081616`, `abogacianqn@gmail.com`).

Al modificar `styles.css` o `main.js`, actualizar el número de versión `?v=...` en las referencias dentro de `index.html` para que los visitantes reciban la versión nueva y no la de caché.
