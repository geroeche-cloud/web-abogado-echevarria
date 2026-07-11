(function () {
  "use strict";

  const data = window.__BRAND__ || {};
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  const $ = (sel, scope) => (scope || document).querySelector(sel);
  const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
  const escHTML = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }

  function waLink(message) {
    const c = data.contact || {};
    const msg = encodeURIComponent(message || c.whatsappMessage || "Hola, necesito hablar con el Dr. Echevarría.");
    return `https://wa.me/${c.whatsappNumber || ""}?text=${msg}`;
  }

  /* ---------------- Mounts (idempotent) ---------------- */

  function mountContactLinks() {
    const c = data.contact || {};
    $$("[data-wa-link]").forEach(el => { el.href = waLink(); });
    $$("[data-phone-link]").forEach(el => { el.href = c.phoneHref || "tel:"; });
    $$("[data-phone-display]").forEach(el => { if (!el.dataset.bound) { el.textContent = c.phoneDisplay || ""; el.dataset.bound = "1"; } });
    $$("[data-wa-display]").forEach(el => { if (!el.dataset.bound) { el.textContent = c.whatsappDisplay || ""; el.dataset.bound = "1"; } });
    $$("[data-email-link]").forEach(el => { el.href = "mailto:" + (c.email || ""); });
    $$("[data-email-display]").forEach(el => { if (!el.dataset.bound) { el.textContent = c.email || ""; el.dataset.bound = "1"; } });
    $$("[data-location-display]").forEach(el => { if (!el.dataset.bound) { el.textContent = c.location || ""; el.dataset.bound = "1"; } });
  }

  function mountPractice() {
    const target = $("[data-practice-grid]");
    if (!target || target.children.length > 0 || !data.practiceAreas) return;
    target.innerHTML = data.practiceAreas.map(p => `
      <article class="card practice-card has-tilt has-halo" data-reveal style="background-image:none;">
        <span class="practice-card-bg" style="background-image:url('${escHTML(p.img)}')" aria-hidden="true"></span>
        <span class="practice-card-scrim" aria-hidden="true"></span>
        <span class="practice-num">${escHTML(p.num)}</span>
        <h3>${escHTML(p.title)}</h3>
        <p>${escHTML(p.text)}</p>
      </article>
    `).join("");
  }

  function mountProcess() {
    const target = $("[data-process-list]");
    if (!target || target.children.length > 0 || !data.process) return;
    target.innerHTML = data.process.map(step => `
      <div class="process-item" data-reveal>
        <span class="process-num">${escHTML(step.num)}</span>
        <div>
          <h3>${escHTML(step.title)}</h3>
          <p>${escHTML(step.text)}</p>
        </div>
      </div>
    `).join("");
  }

  function mountChecklists() {
    const doTarget = $("[data-do-list]");
    const dontTarget = $("[data-dont-list]");
    const checkSvg = `<svg class="checklist-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12.5l5 5L20 6"/></svg>`;
    const xSvg = `<svg class="checklist-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>`;
    if (doTarget && doTarget.children.length === 0 && data.doList) {
      doTarget.innerHTML = data.doList.map(t => `<li>${checkSvg}<span>${escHTML(t)}</span></li>`).join("");
    }
    if (dontTarget && dontTarget.children.length === 0 && data.dontList) {
      dontTarget.innerHTML = data.dontList.map(t => `<li>${xSvg}<span>${escHTML(t)}</span></li>`).join("");
    }
  }

  function mountFaqs() {
    const target = $("[data-faq-list]");
    if (!target || target.children.length > 0 || !data.faqs) return;
    target.innerHTML = data.faqs.map((f, i) => `
      <div class="faq-item" data-open="false">
        <button class="faq-q" aria-expanded="false" data-faq-toggle>
          <h3>${escHTML(f.q)}</h3>
          <span class="faq-plus" aria-hidden="true"></span>
        </button>
        <div class="faq-a"><div class="faq-a-inner"><p>${escHTML(f.a)}</p></div></div>
      </div>
    `).join("");
  }

  /* ---------------- Inits ---------------- */

  function initSplash() {
    const splash = $("[data-splash]");
    if (!splash) return;
    const hide = () => splash.classList.add("is-out");
    if (document.readyState === "complete") setTimeout(hide, 450);
    else window.addEventListener("load", () => setTimeout(hide, 350));
    setTimeout(hide, 3200);
  }

  function initNav() {
    const nav = $(".nav");
    if (!nav) return;
    const onScroll = () => { if (scrollY > 60) nav.classList.add("is-scrolled"); else nav.classList.remove("is-scrolled"); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const burger = $("[data-nav-burger]");
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

  function initUrgencyBar() {
    const bar = $("[data-urgency-bar]");
    const close = $("[data-urgency-close]");
    if (!bar || !close) return;
    if (sessionStorage.getItem("urgencyDismissed") === "1") { bar.classList.add("is-hidden"); return; }
    close.addEventListener("click", () => {
      bar.classList.add("is-hidden");
      try { sessionStorage.setItem("urgencyDismissed", "1"); } catch (_) {}
    });
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
      const navOffset = 96;
      window.scrollTo({
        top: el.getBoundingClientRect().top + scrollY - navOffset,
        behavior: reduced ? "auto" : "smooth",
      });
    });
  }

  function initReveals() {
    const els = $$("[data-reveal]");
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("is-revealed"); io.unobserve(e.target); }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });
    els.forEach(el => io.observe(el));

    setTimeout(() => {
      $$("[data-reveal]:not(.is-revealed)").forEach(el => {
        if (el.getBoundingClientRect().top < innerHeight) el.classList.add("is-revealed");
      });
    }, 6000);
  }

  function initTilt() {
    if (!fineHover) return;
    $$(".has-tilt").forEach(card => {
      const MAX = 6;
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        tx = -py * MAX; ty = px * MAX;
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
        if (!raf) raf = requestAnimationFrame(loop);
      });
      card.addEventListener("mouseleave", () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
      function loop() {
        cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
        card.style.setProperty("--rx", cx.toFixed(2) + "deg");
        card.style.setProperty("--ry", cy.toFixed(2) + "deg");
        raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(loop) : null;
      }
    });
  }

  function initFaqAccordion() {
    document.addEventListener("click", e => {
      const btn = e.target.closest("[data-faq-toggle]");
      if (!btn) return;
      const item = btn.closest(".faq-item");
      const isOpen = item.dataset.open === "true";
      $$(".faq-item").forEach(i => { i.dataset.open = "false"; $(".faq-q", i).setAttribute("aria-expanded", "false"); });
      if (!isOpen) { item.dataset.open = "true"; btn.setAttribute("aria-expanded", "true"); }
    });
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

      await new Promise(r => setTimeout(r, 650 + Math.random() * 450));

      const nameField = form.elements.nombre;
      const firstName = nameField ? nameField.value.trim().split(/\s+/)[0] : "";
      if (msg) msg.textContent = `${firstName ? firstName + ", " : ""}recibimos tu mensaje. Te vamos a contactar a la brevedad. Si es urgente, escribinos directo por WhatsApp.`;

      form.classList.add("is-sent");
      success.setAttribute("aria-hidden", "false");
      success.classList.add("is-visible");
    });
  }

  function initEmergencyModal() {
    const modal = $("[data-emergency-modal]");
    const hero = $(".hero");
    if (!modal || !hero) return;
    if (sessionStorage.getItem("emergencyShown") === "1") return;

    let opened = false;
    let lastFocused = null;

    function open() {
      if (opened) return;
      opened = true;
      try { sessionStorage.setItem("emergencyShown", "1"); } catch (_) {}
      window.removeEventListener("scroll", onScroll);
      lastFocused = document.activeElement;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      safe(playAlertTone, "playAlertTone");
      const closeBtn = $(".emergency-close", modal);
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    function onScroll() {
      if (scrollY > hero.offsetHeight * 0.75) open();
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    modal.addEventListener("click", e => {
      if (e.target.closest("[data-emergency-close]")) close();
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) close();
    });
    // Si toca "Llamar ya", cerramos el modal para que al volver de la llamada pueda seguir navegando.
    const cta = $(".emergency-cta", modal);
    if (cta) cta.addEventListener("click", () => setTimeout(close, 400));
  }

  function initHeroParallax() {
    if (!window.gsap || !window.ScrollTrigger) return;
    const bg = $(".hero-bg img");
    const content = $(".hero-content");
    if (bg) {
      gsap.to(bg, {
        yPercent: 12, scale: 1.14, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
    }
    if (content) {
      gsap.to(content, {
        yPercent: -18, opacity: 0.15, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
    }
  }

  /* ---------------- Alert sound (Web Audio API, no assets) ---------------- */
  let audioCtx = null;
  function getAudioCtx() {
    if (!window.AudioContext && !window.webkitAudioContext) return null;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }
  function playAlertTone() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [0, 0.16].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(i === 0 ? 880 : 1108, now + delay);
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.18, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.13);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.15);
    });
  }
  function initAlertSound() {
    if (reduced) return;
    $$("[data-alert-sound]").forEach(el => {
      el.addEventListener("click", () => safe(playAlertTone, "playAlertTone"));
    });
    // One short attention tone after the visitor's first interaction, to reinforce urgency — once per session.
    if (sessionStorage.getItem("alertToneShown") === "1") return;
    const trigger = (e) => {
      if (e && e.target && e.target.closest && e.target.closest("[data-alert-sound]")) return;
      safe(playAlertTone, "playAlertTone");
      try { sessionStorage.setItem("alertToneShown", "1"); } catch (_) {}
      window.removeEventListener("scroll", trigger);
      window.removeEventListener("click", trigger);
      window.removeEventListener("keydown", trigger);
    };
    window.addEventListener("scroll", trigger, { once: true, passive: true });
    window.addEventListener("click", trigger, { once: true });
    window.addEventListener("keydown", trigger, { once: true });
  }

  function boot() {
    safe(mountContactLinks, "mountContactLinks");
    safe(mountPractice, "mountPractice");
    safe(mountProcess, "mountProcess");
    safe(mountChecklists, "mountChecklists");
    safe(mountFaqs, "mountFaqs");

    safe(initSplash, "initSplash");
    safe(initNav, "initNav");
    safe(initUrgencyBar, "initUrgencyBar");
    safe(initSmoothAnchors, "initSmoothAnchors");
    safe(initReveals, "initReveals");
    safe(initTilt, "initTilt");
    safe(initFaqAccordion, "initFaqAccordion");
    safe(initContactForm, "initContactForm");
    safe(initAlertSound, "initAlertSound");
    safe(initEmergencyModal, "initEmergencyModal");

    if (window.gsap && window.ScrollTrigger) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}
      safe(initHeroParallax, "initHeroParallax");
    }

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
