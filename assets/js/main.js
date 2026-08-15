(function () {
  "use strict";

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

  document.querySelectorAll("[data-year]").forEach(function (element) {
    element.textContent = new Date().getFullYear();
  });

  const filterButtons = document.querySelectorAll("[data-filter]");
  const projectCards = document.querySelectorAll(".work-item[data-category]");
  const filterStatus = document.querySelector("[data-filter-status]");

  if (filterButtons.length && projectCards.length) {
    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const filter = button.dataset.filter;
        let visibleCount = 0;

        filterButtons.forEach(function (item) {
          const isActive = item === button;
          item.classList.toggle("is-active", isActive);
          item.setAttribute("aria-pressed", String(isActive));
        });

        projectCards.forEach(function (card) {
          const isVisible = filter === "all" || card.dataset.category === filter;
          card.hidden = !isVisible;
          if (isVisible) visibleCount += 1;
        });

        if (filterStatus) {
          filterStatus.textContent = visibleCount + (visibleCount === 1 ? " project" : " projects");
        }
      });
    });
  }
})();
