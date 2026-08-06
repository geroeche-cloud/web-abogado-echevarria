(function () {
  "use strict";

  const data = window.__BRAND__ || {};
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, sc) => (sc || document).querySelector(s);
  const $$ = (s, sc) => Array.from((sc || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }

  function waLink() {
    const c = data.contact || {};
    return `https://wa.me/${c.whatsappNumber || ""}?text=${encodeURIComponent(c.whatsappMessage || "Hola, quisiera una consulta.")}`;
  }

  /* ---------- Datos de contacto en toda la web ---------- */
  function mountContactLinks() {
    const c = data.contact || {};
    $$("[data-wa-link]").forEach(el => { el.href = waLink(); });
    $$("[data-phone-link]").forEach(el => { el.href = c.phoneHref || "tel:"; });
    $$("[data-email-link]").forEach(el => { el.href = "mailto:" + (c.email || ""); });
    $$("[data-phone-display]").forEach(el => { el.textContent = c.phoneDisplay || ""; });
    $$("[data-wa-display]").forEach(el => { el.textContent = c.whatsappDisplay || ""; });
    $$("[data-email-display]").forEach(el => { el.textContent = c.email || ""; });
    $$("[data-location-display]").forEach(el => { el.textContent = c.location || ""; });
    $$("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });
  }

  /* ---------- Menú móvil + página activa ---------- */
  function initNav() {
    const burger = $("[data-burger]"), menu = $("[data-mobile-menu]");
    if (burger && menu) {
      burger.addEventListener("click", () => {
        const open = burger.getAttribute("aria-expanded") === "true";
        burger.setAttribute("aria-expanded", String(!open));
        menu.dataset.open = String(!open);
        document.body.style.overflow = !open ? "hidden" : "";
      });
      $$("a", menu).forEach(a => a.addEventListener("click", () => {
        burger.setAttribute("aria-expanded", "false");
        menu.dataset.open = "false"; document.body.style.overflow = "";
      }));
    }
    // Marcar el enlace de la página actual.
    // Vercel usa cleanUrls, así que la URL puede venir sin ".html" (o vacía en la raíz).
    const norm = s => (String(s || "").split("/").pop() || "").toLowerCase().replace(/\.html$/, "") || "index";
    const page = norm(location.pathname);
    $$(".main-nav a").forEach(a => {
      if (norm(a.getAttribute("href")) === page) a.classList.add("is-active");
    });
  }

  /* ---------- Áreas de práctica: acordeón ---------- */
  function mountAreas() {
    const t = $("[data-accordion]");
    if (!t || t.children.length) return;
    const items = [];
    if (data.criminal) {
      items.push({
        featured: true, title: data.criminal.title, text: data.criminal.text, sub: data.criminal.sub || []
      });
    }
    (data.areas || []).forEach(a => items.push({ featured: false, title: a.title, text: a.text, sub: a.sub || [] }));

    t.innerHTML = items.map((it, i) => `
      <div class="acc-item${it.featured ? " is-featured" : ""}" data-open="${i === 0 ? "true" : "false"}">
        <button class="acc-head" type="button" data-acc-toggle aria-expanded="${i === 0}">
          <span class="acc-title">${it.featured ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="4" x2="12" y2="19"/><path d="M5 7 Q12 5 19 7"/><line x1="5" y1="7" x2="3" y2="12"/><line x1="5" y1="7" x2="7" y2="12"/><path d="M2 12 a3 1.5 0 0 0 6 0"/><line x1="19" y1="7" x2="17" y2="12"/><line x1="19" y1="7" x2="21" y2="12"/><path d="M16 12 a3 1.5 0 0 0 6 0"/><line x1="9" y1="20" x2="15" y2="20"/></svg>` : ""}${esc(it.title)}</span>
          <span class="acc-icon" aria-hidden="true"></span>
        </button>
        <div class="acc-panel"><div class="acc-panel-inner"><div class="acc-body">
          <p>${esc(it.text)}</p>
          ${it.sub.length ? `<ul class="acc-sub">${it.sub.map(s => `<li>${esc(s)}</li>`).join("")}</ul>` : ""}
        </div></div></div>
      </div>`).join("");
  }

  function initAccordion() {
    document.addEventListener("click", e => {
      const btn = e.target.closest("[data-acc-toggle]");
      if (!btn) return;
      const item = btn.closest(".acc-item");
      const open = item.dataset.open === "true";
      item.dataset.open = String(!open);
      btn.setAttribute("aria-expanded", String(!open));
    });
  }

  /* ---------- FAQ (páginas de especialidad) ---------- */
  function initFaq() {
    document.addEventListener("click", e => {
      const btn = e.target.closest("[data-faq-toggle]");
      if (!btn) return;
      const item = btn.closest(".faq-item");
      const open = item.dataset.open === "true";
      item.dataset.open = String(!open);
      btn.setAttribute("aria-expanded", String(!open));
    });
  }

  /* ---------- Resumen de áreas (home) ---------- */
  function mountAreasSummary() {
    const t = $("[data-areas-summary]");
    if (!t || t.children.length) return;
    const list = [];
    if (data.criminal) list.push({ title: data.criminal.title, text: data.criminal.text });
    (data.areas || []).forEach(a => list.push(a));
    t.innerHTML = list.slice(0, 6).map(a => `
      <article class="card">
        <h3>${esc(a.title)}</h3>
        <p>${esc(a.text)}</p>
        <a class="card-link" href="areas-de-practica.html">Ver más
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>
      </article>`).join("");
  }

  /* ---------- Equipo ---------- */
  function mountTeam() {
    const full = $("[data-team]");
    if (full && !full.children.length && data.team) {
      full.innerHTML = data.team.map(m => `
        <article class="member">
          <figure class="member-photo">
            <img src="${esc(m.photo)}" alt="${esc(m.name)}, ${esc(m.role || "abogado")} en Neuquén" loading="lazy">
          </figure>
          <div class="member-body">
            <h3>${esc(m.name)}</h3>
            <p class="member-role">${esc(m.role || "")}${m.matricula ? " · " + esc(m.matricula) : ""}</p>
            <div class="rule" style="margin:1rem 0 1.3rem"></div>
            ${(m.bio || []).map(p => `<p>${esc(p)}</p>`).join("")}
            ${(m.data || []).length ? `<ul class="data-list">${m.data.map(d => `<li><span class="k">${esc(d[0])}</span><span>${esc(d[1])}</span></li>`).join("")}</ul>` : ""}
          </div>
        </article>`).join("");
    }

    // Resumen del equipo en la home
    const brief = $("[data-team-brief]");
    if (brief && !brief.children.length && data.team) {
      brief.innerHTML = data.team.map(m => `
        <article class="member-card">
          <img src="${esc(m.photo)}" alt="${esc(m.name)}, ${esc(m.role || "abogado")}" loading="lazy">
          <h3>${esc(m.name)}</h3>
          <p class="member-role">${esc(m.role || "")}${m.matricula ? " · " + esc(m.matricula) : ""}</p>
          ${m.focus ? `<p class="member-focus">${esc(m.focus)}</p>` : ""}
        </article>`).join("");
    }
  }

  /* ---------- Certificados: un carrusel infinito por abogado ----------
     Los certificados pertenecen a cada profesional: nunca se mezclan entre
     integrantes. Cada bloque lleva el nombre de su titular. */
  function mountCredentials() {
    const hosts = $$("[data-certs]");
    if (!hosts.length || !data.team) return;

    const card = c => `
      <figure class="cert-paper" data-cred-file="${esc(c.image)}" data-cred-name="${esc(c.title)}" tabindex="0" role="button" aria-label="Ampliar certificado: ${esc(c.title)}">
        <img src="${esc(c.image)}" alt="Certificado: ${esc(c.title)} — ${esc(c.issuer || "")}" loading="lazy" decoding="async">
        <figcaption>
          <strong>${esc(c.title)}</strong>
          <span>${esc(c.issuer || "")}${c.year ? " · " + esc(c.year) : ""}</span>
        </figcaption>
      </figure>`;

    hosts.forEach(host => {
      if (host.children.length) return;
      host.innerHTML = data.team.map(m => {
        const creds = (m.credentials || []).filter(c => c.image);
        if (!creds.length) return "";
        // El ciclo se cierra con una copia de la serie: al llegar al final
        // se vuelve al principio sin que se note el salto.
        const serie = creds.map(card).join("");
        const copia = serie.replace(/<figure class="cert-paper"/g, '<figure class="cert-paper is-dupe" aria-hidden="true"')
                           .replace(/tabindex="0"/g, 'tabindex="-1"');
        return `
          <div class="cert-group">
            <p class="cert-group-title">
              <span>Certificados de</span>
              <strong>${esc(m.name)}</strong>
            </p>
            <div class="cert-marquee" data-cert-marquee>
              <div class="cert-viewport">
                <div class="cert-track">${serie + copia}</div>
              </div>
            </div>
          </div>`;
      }).join("");
    });
  }

  /* ---------- Vitrina de certificados ----------
     Desplazamiento continuo con requestAnimationFrame: es lo que permite que el
     arrastre y la animación compartan la misma posición, y que al soltar el
     movimiento siga desde donde quedó en vez de saltar. */
  function initCertMarquee() {
    const VELOCIDAD = 26;   // px por segundo
    const ESPERA = 1600;    // ms sin interacción antes de retomar

    $$("[data-cert-marquee]").forEach(mq => {
      const viewport = $(".cert-viewport", mq);
      const track = $(".cert-track", mq);
      if (!viewport || !track || track.children.length < 2) return;

      let periodo = 0;        // ancho de una serie completa (la otra es la copia)
      let offset = 0;         // desplazamiento acumulado
      let enPausa = false, arrastrando = false, visible = true;
      let temporizador = null, previo = 0, raf = 0;
      let inicioX = 0, inicioOffset = 0, recorrido = 0;

      // Cuántos certificados se ven a la vez lo decide el CSS (--per).
      // El ancho exacto se calcula acá para que no queden medios cortados.
      function medir() {
        const por = parseFloat(getComputedStyle(mq).getPropertyValue("--per")) || 3;
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        // clientWidth incluye el padding lateral; hay que descontarlo o las
        // tarjetas salen más anchas de la cuenta y se ven menos de las pedidas.
        const cs = getComputedStyle(viewport);
        const util = viewport.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        const ancho = (util - (por - 1) * gap) / por;
        mq.style.setProperty("--cert-card", Math.max(180, Math.floor(ancho)) + "px");

        // El período se mide después de fijar el ancho: es la distancia entre una
        // tarjeta y su copia, así el bucle cierra sin salto ni medio gap de sobra.
        const mitad = track.children.length / 2;
        const a = track.children[0], b = track.children[mitad];
        periodo = b ? b.offsetLeft - a.offsetLeft : track.scrollWidth / 2;
      }

      function pintar() {
        if (periodo <= 0) return;
        const x = ((offset % periodo) + periodo) % periodo;
        track.style.transform = `translate3d(${x - periodo}px,0,0)`;
      }

      function frame(t) {
        const dt = Math.min(50, t - previo) / 1000;
        previo = t;
        if (!enPausa && !arrastrando && visible && !reduced) offset += VELOCIDAD * dt;
        pintar();
        raf = requestAnimationFrame(frame);
      }

      function retomar() {
        clearTimeout(temporizador);
        temporizador = setTimeout(() => { enPausa = false; }, ESPERA);
      }
      function frenar() { clearTimeout(temporizador); enPausa = true; }

      viewport.addEventListener("pointerenter", frenar);
      viewport.addEventListener("pointerleave", retomar);
      viewport.addEventListener("focusin", frenar);
      viewport.addEventListener("focusout", retomar);

      viewport.addEventListener("pointerdown", e => {
        if (e.button !== undefined && e.button !== 0) return;
        arrastrando = true; recorrido = 0;
        inicioX = e.clientX; inicioOffset = offset;
        frenar();
        viewport.classList.add("is-dragging");
        try { viewport.setPointerCapture(e.pointerId); } catch (_) {}
      });
      viewport.addEventListener("pointermove", e => {
        if (!arrastrando) return;
        const d = e.clientX - inicioX;
        recorrido = Math.max(recorrido, Math.abs(d));
        offset = inicioOffset + d;
      });
      function soltar() {
        if (!arrastrando) return;
        arrastrando = false;
        viewport.classList.remove("is-dragging");
        retomar();
      }
      viewport.addEventListener("pointerup", soltar);
      viewport.addEventListener("pointercancel", soltar);

      // Un arrastre no debe abrir el certificado que quedó bajo el dedo
      viewport.addEventListener("click", e => {
        if (recorrido > 6) { e.preventDefault(); e.stopPropagation(); recorrido = 0; }
      }, true);
      viewport.addEventListener("dragstart", e => e.preventDefault());

      // Fuera de pantalla no se anima: no se gasta batería ni cuadros
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(([e]) => { visible = e.isIntersecting; },
          { rootMargin: "120px" }).observe(mq);
      }
      document.addEventListener("visibilitychange", () => { previo = performance.now(); });

      // ResizeObserver y no "resize": el ancho útil también cambia cuando aparece
      // la barra de scroll o terminan de cargar las imágenes, sin que medie un resize.
      let reMedir = null;
      const recalibrar = () => {
        clearTimeout(reMedir);
        reMedir = setTimeout(() => { medir(); pintar(); }, 120);
      };
      addEventListener("resize", recalibrar);
      addEventListener("orientationchange", recalibrar);
      addEventListener("load", recalibrar);
      if ("ResizeObserver" in window) {
        try { new ResizeObserver(recalibrar).observe(viewport); } catch (_) {}
      }

      medir(); pintar();
      // Segunda pasada: al aparecer la barra de scroll o al asentar las fuentes
      // el ancho útil cambia, y las tarjetas quedarían con la medida vieja.
      setTimeout(recalibrar, 400);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(recalibrar);
      previo = performance.now();
      raf = requestAnimationFrame(frame);
    });
  }

  function initCredModal() {
    const modal = $("[data-cred-modal]");
    if (!modal) return;
    const img = $("[data-cred-img]", modal), title = $("[data-cred-title]", modal), openLink = $("[data-cred-open]", modal);
    let last = null;
    function open(file, name) {
      last = document.activeElement;
      if (title) title.textContent = name || "Certificado";
      if (img) { img.src = file; img.alt = "Certificado: " + (name || ""); }
      if (openLink) openLink.href = file;
      modal.classList.add("is-open"); modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      const cl = $("[data-cred-close]", modal); if (cl) cl.focus();
    }
    function close() {
      modal.classList.remove("is-open"); modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (img) setTimeout(() => { img.removeAttribute("src"); }, 300);
      if (last && last.focus) last.focus();
    }
    document.addEventListener("click", e => {
      const card = e.target.closest("[data-cred-file]");
      if (card) { open(card.getAttribute("data-cred-file"), card.getAttribute("data-cred-name")); return; }
      if (e.target.closest("[data-cred-close]")) close();
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) { close(); return; }
      if (e.key === "Enter" || e.key === " ") {
        const card = e.target.closest && e.target.closest(".cert-paper[data-cred-file]");
        if (card) { e.preventDefault(); open(card.getAttribute("data-cred-file"), card.getAttribute("data-cred-name")); }
      }
    });
  }

  /* ---------- Formulario ---------- */
  function initContactForm() {
    const form = $("[data-contact-form]"), success = $("[data-contact-success]");
    if (!form || !success) return;
    const submitBtn = $("[type=submit]", form), msg = $("[data-contact-success-msg]", success);
    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Enviando…"; }
      await new Promise(r => setTimeout(r, 600));
      const first = (form.elements.nombre.value.trim().split(/\s+/)[0]) || "";
      if (msg) msg.textContent = `${first ? first + ", g" : "G"}racias por escribirnos. Te vamos a contactar a la brevedad. Si tu consulta es urgente, escribinos por WhatsApp.`;
      form.classList.add("is-sent");
      success.classList.add("is-visible");
      success.setAttribute("aria-hidden", "false");
    });
  }

  /* ---------- Reveal discreto ---------- */
  function initReveals() {
    const els = $$("[data-reveal]");
    if (!els.length) return;
    if (reduced) { els.forEach(el => el.classList.add("is-in")); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.05, rootMargin: "0px 0px -3% 0px" });
    els.forEach(el => io.observe(el));
    setTimeout(() => $$("[data-reveal]:not(.is-in)").forEach(el => {
      if (el.getBoundingClientRect().top < innerHeight) el.classList.add("is-in");
    }), 5000);
  }

  function boot() {
    safe(mountContactLinks, "mountContactLinks");
    safe(mountAreas, "mountAreas");
    safe(mountAreasSummary, "mountAreasSummary");
    safe(mountTeam, "mountTeam");
    safe(mountCredentials, "mountCredentials");
    safe(initNav, "initNav");
    safe(initAccordion, "initAccordion");
    safe(initFaq, "initFaq");
    safe(initCertMarquee, "initCertMarquee");
    safe(initCredModal, "initCredModal");
    safe(initContactForm, "initContactForm");
    safe(initReveals, "initReveals");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
