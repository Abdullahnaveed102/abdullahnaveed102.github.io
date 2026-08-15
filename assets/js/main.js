(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".nav-menu-button");
  const siteNav = document.querySelector(".site-nav");

  function closeMenu() {
    if (!menuButton || !siteNav) return;
    menuButton.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
  }

  if (menuButton && siteNav) {
    menuButton.addEventListener("click", function () {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      siteNav.classList.toggle("is-open", !isOpen);
    });

    siteNav.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });
  }

  function updateHeader() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  document.querySelectorAll("[data-year]").forEach(function (element) {
    element.textContent = new Date().getFullYear();
  });

  const revealElements = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 }
    );

    revealElements.forEach(function (element) {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach(function (element) {
      element.classList.add("is-visible");
    });
  }

  const filterButtons = document.querySelectorAll("[data-filter]");
  const projectCards = document.querySelectorAll(".project-card[data-category]");
  const filterStatus = document.querySelector("[data-filter-status]");

  if (filterButtons.length && projectCards.length) {
    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const filter = button.dataset.filter;
        let visibleCount = 0;

        filterButtons.forEach(function (item) {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });

        projectCards.forEach(function (card) {
          const matches = filter === "all" || card.dataset.category === filter;
          card.hidden = !matches;
          if (matches) visibleCount += 1;
        });

        if (filterStatus) {
          filterStatus.textContent = visibleCount + (visibleCount === 1 ? " project" : " projects");
        }
      });
    });
  }
})();
