(function () {
  "use strict";

  var archive = document.getElementById("news-archive");
  var filters = document.querySelector(".news-filters");
  if (!archive || !filters) return;

  var entries = Array.from(archive.querySelectorAll("[data-news-category]"));
  var years = Array.from(archive.querySelectorAll("[data-news-year]"));
  var buttons = Array.from(filters.querySelectorAll("[data-news-filter]"));
  var status = document.querySelector(".news-filter-status");
  var empty = document.querySelector(".news-empty");

  // Only offer categories with entries. Service appears when its first entry is added.
  buttons.forEach(function (button) {
    var category = button.dataset.newsFilter;
    button.hidden = category !== "all" && !entries.some(function (entry) {
      return entry.dataset.newsCategory === category;
    });
  });

  function showCategory(category) {
    var count = 0;
    entries.forEach(function (entry) {
      entry.hidden = category !== "all" && entry.dataset.newsCategory !== category;
      if (!entry.hidden) count += 1;
    });
    years.forEach(function (year) {
      year.hidden = !Array.from(year.querySelectorAll("[data-news-category]")).some(function (entry) {
        return !entry.hidden;
      });
    });
    var label = "All updates";
    buttons.forEach(function (button) {
      var selected = button.dataset.newsFilter === category;
      button.setAttribute("aria-pressed", String(selected));
      if (selected) label = button.textContent.trim();
    });
    status.textContent = category === "all"
      ? count + " update" + (count === 1 ? "" : "s") + " · Oldest to newest"
      : count + " update" + (count === 1 ? "" : "s") + " · " + label;
    empty.hidden = count > 0;
  }

  filters.addEventListener("click", function (event) {
    var button = event.target.closest("button[data-news-filter]");
    if (!button || !filters.contains(button)) return;
    showCategory(button.dataset.newsFilter);
  });

  // An entry linked from the homepage must stay reachable after filtering.
  function revealLinkedEntry() {
    var id;
    try {
      id = decodeURIComponent(window.location.hash.slice(1));
    } catch (error) {
      return;
    }
    var entry = document.getElementById(id);
    if (entry && archive.contains(entry) && entry.hidden) {
      showCategory("all");
      entry.scrollIntoView({ block: "start" });
    }
  }
  window.addEventListener("hashchange", revealLinkedEntry);
  showCategory("all");
  filters.hidden = false;
  status.hidden = false;
})();
