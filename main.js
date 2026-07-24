(function () {
  "use strict";

  const data = window.__BRAND__ || {};
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;

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

  /* ---------- Mounts ---------- */

  function mountContactLinks() {
    const c = data.contact || {};
    $$("[data-wa-link]").forEach(el => { el.href = waLink(); });
    $$("[data-phone-link]").forEach(el => { el.href = c.phoneHref || "tel:"; });
    $$("[data-email-link]").forEach(el => { el.href = "mailto:" + (c.email || ""); });
    $$("[data-wa-display]").forEach(el => { el.textContent = c.whatsappDisplay || ""; });
    $$("[data-phone-display]").forEach(el => { el.textContent = c.phoneDisplay || ""; });
    $$("[data-email-display]").forEach(el => { el.textContent = c.email || ""; });
  }

  function mountTrust() {
    const t = $("[data-trust]");
    if (!t || t.children.length || !data.trust) return;
    t.innerHTML = data.trust.map(x => `<span class="trust-item">${esc(x)}</span>`).join('<span class="trust-dot" aria-hidden="true">·</span>');
  }

  function mountCriminal() {
    const cr = data.criminal;
    if (!cr) return;
    const lead = $(".criminal-lead");
    if (lead && !lead.textContent.trim()) lead.textContent = cr.text || "";
    const sub = $("[data-criminal-sub]");
    if (sub && !sub.children.length && cr.sub) {
      sub.innerHTML = cr.sub.map(s => `
        <li><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 12.5l5 5L20 6"/></svg>${esc(s)}</li>`).join("");
    }
  }

  function mountAreas() {
    const t = $("[data-areas]");
    if (!t || t.children.length || !data.areas) return;
    t.innerHTML = data.areas.map(a => `
      <article class="area-item">
        <h4>${esc(a.title)}</h4>
        <p>${esc(a.text)}</p>
      </article>`).join("");
  }

  function mountCredentials() {
    const t = $("[data-credentials]");
    if (!t || t.children.length || !data.credentials) return;
    t.innerHTML = data.credentials.map(c => `
      <button class="cred-card" type="button" data-cred-file="${esc(c.file)}" data-cred-name="${esc(c.title)}">
        <span class="cred-seal" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="20" r="13"/><path d="M18 33 L15 43 L24 39 L33 43 L30 33"/><path d="M24 13 l2.2 4.4 4.8 .7-3.5 3.4 .8 4.8-4.3-2.3-4.3 2.3 .8-4.8-3.5-3.4 4.8-.7z"/></svg>
        </span>
        <span class="cred-tag">${esc(c.tag || "")}</span>
        <span class="cred-title">${esc(c.title)}</span>
        <span class="cred-meta">${esc(c.issuer || "")} · ${esc(c.year || "")}</span>
        <span class="cred-view">Ver certificado
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </span>
      </button>`).join("");
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
    if (sessionStorage.getItem("introShown") === "1") { intro.classList.add("is-out"); return; }
    try { sessionStorage.setItem("introShown", "1"); } catch (_) {}
    document.body.style.overflow = "hidden";
    const done = () => { intro.classList.add("is-out"); document.body.style.overflow = ""; };
    setTimeout(done, reduced ? 300 : 1200);
    setTimeout(done, 3400);
  }

  function initNav() {
    const nav = $("[data-nav]");
    if (nav) {
      const on = () => nav.classList.toggle("is-scrolled", scrollY > 40);
      on(); addEventListener("scroll", on, { passive: true });
    }
    const burger = $("[data-burger]"), mobile = $("[data-nav-mobile]");
    if (burger && mobile) {
      burger.addEventListener("click", () => {
        const open = burger.getAttribute("aria-expanded") === "true";
        burger.setAttribute("aria-expanded", String(!open));
        mobile.dataset.open = String(!open);
        document.body.style.overflow = !open ? "hidden" : "";
      });
      $$("a", mobile).forEach(a => a.addEventListener("click", () => {
        burger.setAttribute("aria-expanded", "false");
        mobile.dataset.open = "false"; document.body.style.overflow = "";
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
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.04, rootMargin: "0px 0px -4% 0px" });
    $$("[data-reveal], .stagger").forEach(el => io.observe(el));
    setTimeout(() => $$("[data-reveal]:not(.is-in), .stagger:not(.is-in)").forEach(el => {
      if (el.getBoundingClientRect().top < innerHeight) el.classList.add("is-in");
    }), 6000);
  }

  function initContactForm() {
    const form = $("[data-contact-form]"), success = $("[data-contact-success]");
    if (!form || !success) return;
    const submitBtn = $("[type=submit]", form), msg = $("[data-contact-success-msg]", success);
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
    if (!h1) return;
    if (reduced) { h1.classList.add("is-in"); return; }
    const wrap = (node) => {
      const out = [];
      node.childNodes.forEach(n => {
        if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach(w => {
          if (/^\s+$/.test(w)) out.push(document.createTextNode(w));
          else if (w) { const s = document.createElement("span"); s.className = "w"; s.textContent = w; out.push(s); }
        });
        else if (n.nodeType === 1) { const c = n.cloneNode(false); wrap(n).forEach(x => c.appendChild(x)); const s = document.createElement("span"); s.className = "w"; s.appendChild(c); out.push(s); }
      });
      return out;
    };
    const parts = wrap(h1); h1.textContent = ""; parts.forEach(p => h1.appendChild(p));
    $$(".w", h1).forEach((w, i) => w.style.setProperty("--d", (i * 0.06) + "s"));
    setTimeout(() => h1.classList.add("is-in"), 300 + (document.querySelector("[data-intro]:not(.is-out)") ? 1000 : 0));
  }

  function initTilt() {
    if (reduced || !fine) return;
    $$(".cred-card, .area-item").forEach(card => {
      card.classList.add("tilt");
      const MAX = 3;
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
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
    if (reduced || !fine) return;
    $$(".hero-actions .btn-gold, .nav-cta").forEach(el => {
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      el.addEventListener("mousemove", e => {
        const r = el.getBoundingClientRect();
        tx = ((e.clientX - r.left) - r.width / 2) * .18; ty = ((e.clientY - r.top) - r.height / 2) * .18;
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
      const io = new IntersectionObserver(es => es.forEach(en => {
        if (!en.isIntersecting) return; io.unobserve(el);
        if (reduced) { el.textContent = target; return; }
        const t0 = performance.now(), dur = 1200;
        const tick = now => { const p = Math.min(1, (now - t0) / dur); el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
      }), { threshold: .6 });
      io.observe(el);
    });
  }

  function initDust() {
    if (reduced) return;
    const host = $(".hero");
    if (!host) return;
    const c = document.createElement("canvas");
    c.className = "dust"; c.setAttribute("aria-hidden", "true"); host.appendChild(c);
    const ctx = c.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const N = innerWidth < 720 ? 26 : 46;
    let w, h, parts = [], running = false, raf = null;
    function size() { const r = host.getBoundingClientRect(); w = r.width; h = r.height; c.width = w * dpr; c.height = h * dpr; c.style.width = w + "px"; c.style.height = h + "px"; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function seed() { parts = Array.from({ length: N }, () => ({ x: Math.random() * w, y: Math.random() * h, r: .5 + Math.random() * 1.5, vy: -(.05 + Math.random() * .2), vx: (Math.random() - .5) * .1, a: .1 + Math.random() * .3, tw: Math.random() * 6.28 })); }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) { p.x += p.vx; p.y += p.vy; p.tw += .02; if (p.y < -6) { p.y = h + 6; p.x = Math.random() * w; } const tw = .55 + .45 * Math.sin(p.tw); ctx.fillStyle = `rgba(212,182,120,${(p.a * tw).toFixed(3)})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill(); }
      raf = running ? requestAnimationFrame(frame) : null;
    }
    size(); seed();
    new IntersectionObserver(es => es.forEach(e => { running = e.isIntersecting; if (running && !raf) raf = requestAnimationFrame(frame); })).observe(host);
    addEventListener("resize", () => { size(); seed(); });
  }

  function initCursorGlow() {
    if (reduced || !fine) return;
    const g = document.createElement("div");
    g.className = "cursor-glow"; g.setAttribute("aria-hidden", "true"); g.style.opacity = "0";
    document.body.appendChild(g);
    let tx = innerWidth / 2, ty = innerHeight / 2, cx = tx, cy = ty, raf = null, shown = false;
    addEventListener("mousemove", e => {
      tx = e.clientX; ty = e.clientY;
      if (!shown) { shown = true; g.style.transition = "opacity .8s"; g.style.opacity = "1"; }
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    function loop() { cx += (tx - cx) * .11; cy += (ty - cy) * .11; g.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`; raf = (Math.abs(tx - cx) > .4 || Math.abs(ty - cy) > .4) ? requestAnimationFrame(loop) : null; }
  }

  function initProcessLine() {
    const fill = $("[data-process-beam]"), track = $(".process-track");
    if (!fill || !track) return;
    if (reduced || !window.gsap || !window.ScrollTrigger) { fill.style.transform = "scaleY(1)"; return; }
    gsap.fromTo(fill, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: track, start: "top 75%", end: "bottom 55%", scrub: .6 } });
  }

  function initHeroParallax() {
    if (reduced || !window.gsap || !window.ScrollTrigger) return;
    const p = $(".hero-portrait");
    if (p) gsap.to(p, { yPercent: -6, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  }

  function initCredModal() {
    const modal = $("[data-cred-modal]");
    if (!modal) return;
    const frame = $("[data-cred-frame]", modal), title = $("[data-cred-title]", modal), openLink = $("[data-cred-open]", modal);
    let last = null;
    function open(file, name) {
      last = document.activeElement;
      if (title) title.textContent = name || "Certificado";
      if (frame) frame.src = file;
      if (openLink) openLink.href = file;
      modal.classList.add("is-open"); modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      const cl = $("[data-cred-close]", modal); if (cl) cl.focus();
    }
    function close() {
      modal.classList.remove("is-open"); modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (frame) setTimeout(() => { frame.src = "about:blank"; }, 300);
      if (last && last.focus) last.focus();
    }
    document.addEventListener("click", e => {
      const card = e.target.closest("[data-cred-file]");
      if (card) { open(card.getAttribute("data-cred-file"), card.getAttribute("data-cred-name")); return; }
      if (e.target.closest("[data-cred-close]")) close();
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && modal.classList.contains("is-open")) close(); });
  }

  function boot() {
    safe(mountContactLinks, "mountContactLinks");
    safe(mountTrust, "mountTrust");
    safe(mountCriminal, "mountCriminal");
    safe(mountAreas, "mountAreas");
    safe(mountCredentials, "mountCredentials");
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
    safe(initCredModal, "initCredModal");

    if (window.gsap && window.ScrollTrigger) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}
      safe(initHeroParallax, "initHeroParallax");
      safe(initProcessLine, "initProcessLine");
    } else { safe(initProcessLine, "initProcessLine"); }

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
