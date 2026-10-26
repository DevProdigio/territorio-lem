(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  /* Header muda de estado ao rolar */
  var header = document.querySelector(".site-header");
  var floatCta = document.querySelector(".float-cta");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 40);
    if (floatCta) floatCta.classList.toggle("is-visible", y > window.innerHeight * 0.7);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Menu mobile */
  var toggle = document.querySelector(".menu-toggle");
  if (toggle) {
    var setMenu = function (open) {
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    };
    toggle.addEventListener("click", function () {
      setMenu(!document.body.classList.contains("menu-open"));
    });
    document.querySelectorAll(".mobile-menu a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  /* Revelação ao rolar */
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* Horário de funcionamento: destaca o dia e informa se está aberto agora.
     data-schedule = JSON com 7 posições (domingo primeiro), cada uma com
     faixas ["HH:MM","HH:MM"]. Fechamento "00:00" significa meia-noite. */
  document.querySelectorAll("[data-schedule]").forEach(function (box) {
    var schedule;
    try { schedule = JSON.parse(box.getAttribute("data-schedule")); } catch (e) { return; }

    // Horário de Brasília, independente do fuso de quem visita
    var now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bahia" }));
    var day = now.getDay();
    var mins = now.getHours() * 60 + now.getMinutes();
    var toMin = function (s, isClose) {
      var p = s.split(":");
      var m = +p[0] * 60 + +p[1];
      return isClose && m === 0 ? 1440 : m;
    };

    var open = (schedule[day] || []).some(function (r) {
      return mins >= toMin(r[0]) && mins < toMin(r[1], true);
    });

    var row = box.querySelector('[data-day="' + day + '"]');
    if (row) row.classList.add("is-today");

    document.querySelectorAll("[data-open-status]").forEach(function (el) {
      el.classList.toggle("is-open", open);
      var label = el.querySelector("[data-open-label]");
      if (label) label.textContent = open ? "Aberto agora" : "Fechado agora";
    });
  });

  /* Formulário de orçamento: monta a mensagem e abre o canal de contato */
  var form = document.querySelector("[data-quote-form]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector(".form-status");
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var d = new FormData(form);
      var lines = [
        "Olá, Território Eventhus! Gostaria de um orçamento.",
        "",
        "Nome: " + d.get("nome"),
        "Telefone: " + d.get("telefone"),
        "Tipo de evento: " + d.get("tipo"),
        "Data desejada: " + (d.get("data") || "a definir"),
        "Convidados: " + (d.get("convidados") || "a definir")
      ];
      if (d.get("mensagem")) lines.push("", d.get("mensagem"));
      var text = lines.join("\n");

      var wa = (form.getAttribute("data-whatsapp") || "").replace(/\D/g, "");
      if (wa) {
        window.open("https://wa.me/" + wa + "?text=" + encodeURIComponent(text), "_blank", "noopener");
        if (status) status.textContent = "Abrimos o WhatsApp com a sua mensagem pronta.";
        return;
      }

      var ig = form.getAttribute("data-instagram");
      var openIg = function () { window.open("https://ig.me/m/" + ig, "_blank", "noopener"); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          if (status) status.textContent = "Mensagem copiada. É só colar no Direct do Instagram que abrimos para você.";
          openIg();
        }, openIg);
      } else {
        openIg();
      }
    });
  }

  /* Ano no rodapé */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
