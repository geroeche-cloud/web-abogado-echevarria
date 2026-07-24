(function () {
  "use strict";

  const data = window.__BRAND__ || {};
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const $ = (s, sc) => (sc || document).querySelector(s);
  const $$ = (s, sc) => Array.from((sc || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }

  function waLink(msg) {
    const c = data.contact || {};
    const text = encodeURIComponent(msg || c.whatsappMessage || "Hola, quisiera una consulta.");
    return `https://wa.me/${c.whatsappNumber || ""}?text=${text}`;
  }

  /* ---------- Mounts (idempotentes, data-driven) ---------- */

  function mountContactLinks() {
    const c = data.contact || {};
    $$("[data-wa-link]").forEach(el => { el.href = waLink(); });
    $$("[data-phone-link]").forEach(el => { el.href = c.phoneHref || "tel:"; });
    $$("[data-email-link]").forEach(el => { el.href = "mailto:" + (c.email || ""); });
    $$("[data-wa-display]").forEach(el => { el.textContent = c.whatsappDisplay || ""; });
    $$("[data-phone-display]").forEach(el => { el.textContent = c.phoneDisplay || ""; });
    $$("[data-email-display]").forEach(el => { el.textContent = c.email || ""; });
  }

  // Glifos dorados por área (línea fina, 1 trazo de identidad por materia)
  const GLYPHS = {
    balanza: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><line x1="24" y1="8" x2="24" y2="38"/><path d="M10 14 Q24 10 38 14"/><line x1="10" y1="14" x2="6" y2="24"/><line x1="10" y1="14" x2="14" y2="24"/><path d="M4 24 a6 3 0 0 0 12 0"/><line x1="38" y1="14" x2="34" y2="24"/><line x1="38" y1="14" x2="42" y2="24"/><path d="M32 24 a6 3 0 0 0 12 0"/><line x1="17" y1="40" x2="31" y2="40"/><circle cx="24" cy="6" r="1.6" fill="currentColor"/></svg>`,
    pluma: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M38 8 C28 10 16 20 13 33 L11 39 L17 37 C30 34 40 22 40 10 Z"/><path d="M13 33 C20 26 28 18 36 12"/><line x1="8" y1="42" x2="13" y2="37"/></svg>`,
    engranaje: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="8"/><circle cx="24" cy="24" r="2.6"/><line x1="24" y1="10" x2="24" y2="15"/><line x1="24" y1="33" x2="24" y2="38"/><line x1="10" y1="24" x2="15" y2="24"/><line x1="33" y1="24" x2="38" y2="24"/><line x1="14" y1="14" x2="17.6" y2="17.6"/><line x1="30.4" y1="30.4" x2="34" y2="34"/><line x1="34" y1="14" x2="30.4" y2="17.6"/><line x1="17.6" y1="30.4" x2="14" y2="34"/></svg>`,
    pilar: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="40" x2="38" y2="40"/><line x1="12" y1="36" x2="36" y2="36"/><line x1="10" y1="12" x2="38" y2="12"/><line x1="12" y1="8" x2="36" y2="8"/><line x1="16" y1="16" x2="16" y2="32"/><line x1="24" y1="16" x2="24" y2="32"/><line x1="32" y1="16" x2="32" y2="32"/></svg>`
  };

  function mountAreas() {
    const t = $("[data-areas]");
    if (!t || t.children.length || !data.practiceAreas) return;
    t.innerHTML = data.practiceAreas.map(a => `
      <article class="area-card">
        <span class="area-glyph" aria-hidden="true">${GLYPHS[a.glyph] || ""}</span>
        <span class="area-roman" aria-hidden="true">${esc(a.num)}</span>
        <span class="area-num">${esc(a.num)}</span>
        <h3>${esc(a.title)}</h3>
        <p>${esc(a.text)}</p>
        <span class="area-arrow">Consultar
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </span>
      </article>`).join("");
    // Con GSAP disponible, la entrada la maneja la animación 3D escalonada
    if (window.gsap && window.ScrollTrigger && !reduced) t.removeAttribute("data-reveal");
  }

  function mountWhy() {
    const t = $("[data-why]");
    if (!t || t.children.length || !data.whyUs) return;
    t.innerHTML = data.whyUs.map(w => `
      <div class="why-item">
        <h3>${esc(w.title)}</h3>
        <p>${esc(w.text)}</p>
      </div>`).join("");
  }

  function mountTeam() {
    const t = $("[data-team]");
    if (!t || t.children.length || !data.team) return;
    const cards = data.team.map(m => `
      <article class="team-card">
        <div class="team-photo">
          <img src="${esc(m.photo)}" alt="Retrato de ${esc(m.name)}" loading="lazy" decoding="async">
        </div>
        <div class="team-info">
          <span class="role">${esc(m.role)}</span>
          <h3>${esc(m.name)}</h3>
          <p class="focus">${esc(m.focus || "")}</p>
        </div>
      </article>`).join("");
    // Tarjeta "preparada para crecer"
    const soon = `
      <article class="team-card team-card--soon" aria-hidden="true">
        <p>Estudio en crecimiento — nuevos profesionales se incorporan próximamente.</p>
      </article>`;
    t.innerHTML = cards + soon;
  }

  function mountProcess() {
    const t = $("[data-process]");
    if (!t || t.children.length || !data.process) return;
    t.innerHTML = data.process.map(s => `
      <div class="process-step">
        <span class="process-num">${esc(s.num)}</span>
        <div class="process-body">
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.text)}</p>
        </div>
      </div>`).join("");
  }

  /* ---------- Inits ---------- */

  function initIntro() {
    const intro = $("[data-intro]");
    if (!intro) return;
    // Solo primera visita en la sesión
    if (sessionStorage.getItem("introShown") === "1") { intro.classList.add("is-out"); return; }
    try { sessionStorage.setItem("introShown", "1"); } catch (_) {}
    document.body.style.overflow = "hidden";
    const done = () => { intro.classList.add("is-out"); document.body.style.overflow = ""; };
    const delay = reduced ? 300 : 1200;
    setTimeout(done, delay);
    setTimeout(() => { intro.classList.add("is-out"); document.body.style.overflow = ""; }, 3400); // red de seguridad
  }

  function initNav() {
    const nav = $("[data-nav]");
    if (nav) {
      const onScroll = () => { nav.classList.toggle("is-scrolled", scrollY > 40); };
      onScroll(); addEventListener("scroll", onScroll, { passive: true });
    }
    const burger = $("[data-burger]");
    const mobile = $("[data-nav-mobile]");
    if (burger && mobile) {
      burger.addEventListener("click", () => {
        const open = burger.getAttribute("aria-expanded") === "true";
        burger.setAttribute("aria-expanded", String(!open));
        mobile.dataset.open = String(!open);
        document.body.style.overflow = !open ? "hidden" : "";
      });
      $$("a", mobile).forEach(a => a.addEventListener("click", () => {
        burger.setAttribute("aria-expanded", "false");
        mobile.dataset.open = "false";
        document.body.style.overflow = "";
      }));
    }
  }

  function initSmoothAnchors() {
    document.addEventListener("click", e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      scrollTo({ top: el.getBoundingClientRect().top + scrollY - 70, behavior: reduced ? "auto" : "smooth" });
    });
  }

  function initReveals() {
    const els = $$("[data-reveal], .stagger");
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.04, rootMargin: "0px 0px -4% 0px" });
    els.forEach(el => io.observe(el));
    // red de seguridad
    setTimeout(() => {
      $$("[data-reveal]:not(.is-in), .stagger:not(.is-in)").forEach(el => {
        if (el.getBoundingClientRect().top < innerHeight) el.classList.add("is-in");
      });
    }, 6000);
  }

  function initContactForm() {
    const form = $("[data-contact-form]");
    const success = $("[data-contact-success]");
    if (!form || !success) return;
    const submitBtn = $("[type=submit]", form);
    const msg = $("[data-contact-success-msg]", success);
    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (form.classList.contains("is-sending")) return;
      if (!form.reportValidity()) return;
      form.classList.add("is-sending");
      if (submitBtn) submitBtn.disabled = true;
      await new Promise(r => setTimeout(r, 650 + Math.random() * 400));
      const first = (form.elements.nombre.value.trim().split(/\s+/)[0]) || "";
      if (msg) msg.textContent = `${first ? first + ", g" : "G"}racias por escribirnos. Te vamos a contactar a la brevedad. Si es urgente, escribinos por WhatsApp.`;
      form.classList.add("is-sent");
      success.setAttribute("aria-hidden", "false");
      success.classList.add("is-visible");
    });
  }

  function initScrollProgress() {
    const bar = $("[data-progress]");
    if (!bar) return;
    let raf = null;
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
      raf = null;
    };
    addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    update();
  }

  function initHeroTitleReveal() {
    const h1 = $(".hero h1");
    if (!h1 || reduced) { if (h1) h1.classList.add("is-in"); return; }
    // Envolver palabras preservando <em>
    const wrapWords = (node) => {
      const out = [];
      node.childNodes.forEach(n => {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach(w => {
            if (/^\s+$/.test(w)) out.push(document.createTextNode(w));
            else if (w) { const s = document.createElement("span"); s.className = "w"; s.textContent = w; out.push(s); }
          });
        } else if (n.nodeType === 1) {
          const clone = n.cloneNode(false);
          wrapWords(n).forEach(c => clone.appendChild(c));
          const s = document.createElement("span"); s.className = "w"; s.appendChild(clone); out.push(s);
        }
      });
      return out;
    };
    const parts = wrapWords(h1);
    h1.textContent = "";
    parts.forEach(p => h1.appendChild(p));
    $$(".w", h1).forEach((w, i) => w.style.setProperty("--d", (i * 0.07) + "s"));
    // Arranca después de la intro de marca
    const firstVisit = sessionStorage.getItem("introShown") !== "1" ? 0 : 1; // ya seteado por initIntro
    setTimeout(() => h1.classList.add("is-in"), 350 + (document.querySelector("[data-intro]:not(.is-out)") ? 1000 : 0));
  }

  function initTilt() {
    if (reduced || !matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    $$(".area-card, .team-card").forEach(card => {
      card.classList.add("tilt");
      const MAX = 3.2;
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5;
        const py = (e.clientY - r.top) / r.height - .5;
        tx = -py * MAX; ty = px * MAX;
        card.style.setProperty("--mx", ((px + .5) * 100) + "%");
        card.style.setProperty("--my", ((py + .5) * 100) + "%");
        if (!raf) raf = requestAnimationFrame(loop);
      });
      card.addEventListener("mouseleave", () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
      function loop() {
        cx += (tx - cx) * .18; cy += (ty - cy) * .18;
        card.style.setProperty("--rx", cx.toFixed(2) + "deg");
        card.style.setProperty("--ry", cy.toFixed(2) + "deg");
        raf = (Math.abs(tx - cx) > .04 || Math.abs(ty - cy) > .04) ? requestAnimationFrame(loop) : null;
      }
    });
  }

  function initMagnetic() {
    if (reduced || !matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    $$(".hero-actions .btn-gold, .nav-cta").forEach(el => {
      const S = .18;
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      el.addEventListener("mousemove", e => {
        const r = el.getBoundingClientRect();
        tx = ((e.clientX - r.left) - r.width / 2) * S;
        ty = ((e.clientY - r.top) - r.height / 2) * S;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      el.addEventListener("mouseleave", () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
      function loop() {
        cx += (tx - cx) * .2; cy += (ty - cy) * .2;
        el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
        raf = (Math.abs(tx - cx) > .1 || Math.abs(ty - cy) > .1) ? requestAnimationFrame(loop) : null;
      }
    });
  }

  function initCounters() {
    $$("[data-count]").forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      if (isNaN(target)) return;
      const io = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (!en.isIntersecting) return;
          io.unobserve(el);
          if (reduced) { el.textContent = target; return; }
          const t0 = performance.now(), dur = 1200;
          const tick = (now) => {
            const p = Math.min(1, (now - t0) / dur);
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      }, { threshold: .6 });
      io.observe(el);
    });
  }

  // Polvo de oro flotando (hero + banda de poder), solo cuando la sección es visible
  function initDust() {
    if (reduced) return;
    [$(".hero"), $(".power-band")].filter(Boolean).forEach(host => {
      const c = document.createElement("canvas");
      c.className = "dust"; c.setAttribute("aria-hidden", "true");
      host.appendChild(c);
      const ctx = c.getContext("2d");
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      const N = innerWidth < 720 ? 32 : 58;
      let w, h, parts = [], running = false, raf = null;
      function size() {
        const r = host.getBoundingClientRect();
        w = r.width; h = r.height;
        c.width = w * dpr; c.height = h * dpr;
        c.style.width = w + "px"; c.style.height = h + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      function seed() {
        parts = Array.from({ length: N }, () => ({
          x: Math.random() * w, y: Math.random() * h,
          r: .5 + Math.random() * 1.6,
          vy: -(.06 + Math.random() * .22),
          vx: (Math.random() - .5) * .1,
          a: .1 + Math.random() * .35,
          tw: Math.random() * 6.28
        }));
      }
      function frame() {
        ctx.clearRect(0, 0, w, h);
        for (const p of parts) {
          p.x += p.vx; p.y += p.vy; p.tw += .02;
          if (p.y < -6) { p.y = h + 6; p.x = Math.random() * w; }
          if (p.x < -6) p.x = w + 6; else if (p.x > w + 6) p.x = -6;
          const tw = .55 + .45 * Math.sin(p.tw);
          ctx.fillStyle = `rgba(212,182,120,${(p.a * tw).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
        }
        raf = running ? requestAnimationFrame(frame) : null;
      }
      size(); seed();
      new IntersectionObserver(es => es.forEach(e => {
        running = e.isIntersecting;
        if (running && !raf) raf = requestAnimationFrame(frame);
      })).observe(host);
      addEventListener("resize", () => { size(); seed(); });
    });
  }

  // Luz dorada que sigue el cursor (solo desktop)
  function initCursorGlow() {
    if (reduced || !matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    const g = document.createElement("div");
    g.className = "cursor-glow"; g.setAttribute("aria-hidden", "true");
    g.style.opacity = "0";
    document.body.appendChild(g);
    let tx = innerWidth / 2, ty = innerHeight / 2, cx = tx, cy = ty, raf = null, shown = false;
    addEventListener("mousemove", e => {
      tx = e.clientX; ty = e.clientY;
      if (!shown) { shown = true; g.style.transition = "opacity .8s"; g.style.opacity = "1"; }
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    function loop() {
      cx += (tx - cx) * .11; cy += (ty - cy) * .11;
      g.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      raf = (Math.abs(tx - cx) > .4 || Math.abs(ty - cy) > .4) ? requestAnimationFrame(loop) : null;
    }
  }

  // Entrada 3D escalonada de las tarjetas de áreas
  function initAreaEntrance() {
    if (reduced || !window.gsap || !window.ScrollTrigger) return;
    const cards = $$(".area-card");
    if (!cards.length) return;
    gsap.set(cards, { y: 70, opacity: 0, rotateX: 10, transformPerspective: 1200 });
    ScrollTrigger.batch(cards, {
      start: "top 88%",
      once: true,
      onEnter: batch => gsap.to(batch, {
        y: 0, opacity: 1, rotateX: 0, duration: 1.1, stagger: .13, ease: "power3.out",
        onComplete: () => gsap.set(batch, { clearProps: "transform,opacity" })
      })
    });
  }

  // Viga de oro que se dibuja mientras recorrés el proceso
  function initProcessLine() {
    const fill = $("[data-process-beam]");
    const track = $(".process-track");
    if (!fill || !track) return;
    if (reduced || !window.gsap || !window.ScrollTrigger) { fill.style.transform = "scaleY(1)"; return; }
    gsap.fromTo(fill, { scaleY: 0 }, {
      scaleY: 1, ease: "none",
      scrollTrigger: { trigger: track, start: "top 75%", end: "bottom 55%", scrub: .6 }
    });
  }

  // Balanza monumental: se equilibra al scrollear + responde al cursor
  function initScales() {
    const band = $(".power-band");
    const beam = $("#scBeam");
    if (!band || !beam) return;
    if (reduced) return; // queda estática y equilibrada
    if (window.gsap && window.ScrollTrigger) {
      gsap.fromTo(beam, { rotation: -9, svgOrigin: "200 100" }, {
        rotation: 0, svgOrigin: "200 100", ease: "none",
        scrollTrigger: { trigger: band, start: "top 85%", end: "center 45%", scrub: .7 }
      });
      // Péndulo vivo: una respiración sutil permanente sobre el grupo exterior
      gsap.to("#scSwing", { rotation: 1.5, svgOrigin: "200 100", yoyo: true, repeat: -1, duration: 2.9, ease: "sine.inOut" });
    }
    // Deriva sutil con el mouse (sobre el propio SVG contenedor, sin pelear con GSAP)
    if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
      const fig = $(".scales-fig");
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      band.addEventListener("mousemove", e => {
        const r = band.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - .5) * 14;
        ty = ((e.clientY - r.top) / r.height - .5) * 8;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      band.addEventListener("mouseleave", () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
      function loop() {
        cx += (tx - cx) * .06; cy += (ty - cy) * .06;
        if (fig) fig.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) rotate(${(cx * .12).toFixed(2)}deg)`;
        raf = (Math.abs(tx - cx) > .15 || Math.abs(ty - cy) > .15) ? requestAnimationFrame(loop) : null;
      }
    }
  }

  function initHeroParallax() {
    if (reduced || !window.gsap || !window.ScrollTrigger) return;
    const bg = $(".hero-bg");
    if (bg) {
      gsap.to(bg, { yPercent: 14, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    }
    const content = $(".hero-content");
    if (content) {
      gsap.to(content, { yPercent: -8, opacity: .4, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    }
  }

  function boot() {
    safe(mountContactLinks, "mountContactLinks");
    safe(mountAreas, "mountAreas");
    safe(mountWhy, "mountWhy");
    safe(mountTeam, "mountTeam");
    safe(mountProcess, "mountProcess");

    safe(initIntro, "initIntro");
    safe(initNav, "initNav");
    safe(initSmoothAnchors, "initSmoothAnchors");
    safe(initReveals, "initReveals");
    safe(initContactForm, "initContactForm");
    safe(initScrollProgress, "initScrollProgress");
    safe(initHeroTitleReveal, "initHeroTitleReveal");
    safe(initTilt, "initTilt");
    safe(initMagnetic, "initMagnetic");
    safe(initCounters, "initCounters");
    safe(initDust, "initDust");
    safe(initCursorGlow, "initCursorGlow");

    if (window.gsap && window.ScrollTrigger) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}
      safe(initHeroParallax, "initHeroParallax");
      safe(initAreaEntrance, "initAreaEntrance");
    }
    safe(initScales, "initScales");
    safe(initProcessLine, "initProcessLine");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
