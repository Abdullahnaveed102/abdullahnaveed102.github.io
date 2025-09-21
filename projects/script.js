//##############################################################################################
//#####################################> PROJECTS JS <#########################################
//##############################################################################################

$(document).ready(function () {
  // mobile menu toggle
  $("#menu").click(function () {
    $(this).toggleClass("fa-times");
    $(".navbar").toggleClass("nav-toggle");
  });

  // scroll behavior
  $(window).on("scroll load", function () {
    $("#menu").removeClass("fa-times");
    $(".navbar").removeClass("nav-toggle");
    document.querySelector("#scroll-top").classList.toggle("active", window.scrollY > 10);
  });
});

// dynamic title / favicon
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible") {
    document.title = "Projects | Portfolio Abdullah";
    $("#favicon").attr("href", "/assets/images/favicon.png");
  } else {
    document.title = "Come Back To Portfolio";
    $("#favicon").attr("href", "/assets/images/favhand.png");
  }
});

//##############################################################################################
//#####################################> LOAD DATA <###########################################
//##############################################################################################

function getProjects() {
  return fetch("/projects/projects.json", { cache: "no-cache" })
    .then(r => r.json())
    .catch(() => []);
}

function card(p) {
  const cat = (p.category || "").toLowerCase(); // normalize for filter
  return `
    <div class="grid-item ${cat}">
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

  //##################################################
  //#################> SIMPLE FILTER <################
  //##################################################
  const gridEl = document.querySelector(".box-container");
  document.querySelector(".button-group").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    // button active state
    document.querySelectorAll(".button-group .btn").forEach(b => b.classList.remove("is-checked"));
    btn.classList.add("is-checked");

    // filter
    const sel = btn.getAttribute("data-filter");
    gridEl.querySelectorAll(".grid-item").forEach(card => {
      card.style.display = (sel === "*" || card.matches(sel)) ? "" : "none";
    });
  });
}

getProjects().then(showProjects);

//##############################################################################################
//######################> DISABLE DEV SHORTCUTS <###############################################
//##############################################################################################
document.onkeydown = function (e) {
  if (e.keyCode === 123) return false;
  if (e.ctrlKey && e.shiftKey && ["I","C","J"].includes(String.fromCharCode(e.keyCode))) return false;
  if (e.ctrlKey && String.fromCharCode(e.keyCode) === "U") return false;
};