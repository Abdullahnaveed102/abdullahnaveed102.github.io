/* ===========================
   Projects page interactions
   =========================== */

$(document).ready(function () {
  $("#menu").click(function () {
    $(this).toggleClass("fa-times");
    $(".navbar").toggleClass("nav-toggle");
  });

  $(window).on("scroll load", function () {
    $("#menu").removeClass("fa-times");
    $(".navbar").removeClass("nav-toggle");
    document.querySelector("#scroll-top").classList.toggle("active", window.scrollY > 10);
  });
});

document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible") {
    document.title = "Projects | Portfolio Abdullah";
    $("#favicon").attr("href", "/assets/images/favicon.png");
  } else {
    document.title = "Come Back To Portfolio";
    $("#favicon").attr("href", "/assets/images/favhand.png");
  }
});

// ---- Data loader ----
function getProjects() {
  // projects.json is colocated under /projects/
  return fetch("/projects/projects.json", { cache: "no-cache" })
    .then(r => r.json())
    .catch(() => []);
}

function card(p) {
  return `
    <div class="grid-item ${p.category}">
      <div class="box tilt">
        <img draggable="false" src="/assets/images/projects/${p.image}.png" alt="${p.name}" />
        <div class="content">
          <div class="tag"><h3>${p.name}</h3></div>
          <div class="desc">
            <p>${p.desc}</p>
            <div class="btns">
              <a href="${p.links.code}" class="btn" target="_blank" rel="noopener">
                Code <i class="fas fa-code"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function showProjects(projects) {
  const wrap = document.querySelector(".work .box-container");
  wrap.innerHTML = projects.map(card).join("");

  // tilt
  if (window.VanillaTilt) {
    VanillaTilt.init(document.querySelectorAll(".tilt"), { max: 15 });
  }

  // isotope filters
  const $grid = $(".box-container").isotope({
    itemSelector: ".grid-item",
    layoutMode: "fitRows"
  });

  $(".button-group").on("click", "button", function () {
    $(".button-group").find(".is-checked").removeClass("is-checked");
    $(this).addClass("is-checked");
    $grid.isotope({ filter: $(this).attr("data-filter") });
  });
}

getProjects().then(showProjects);

// Disable some dev shortcuts
document.onkeydown = function (e) {
  if (e.keyCode === 123) return false;
  if (e.ctrlKey && e.shiftKey && ["I","C","J"].includes(String.fromCharCode(e.keyCode))) return false;
  if (e.ctrlKey && String.fromCharCode(e.keyCode) === "U") return false;
};