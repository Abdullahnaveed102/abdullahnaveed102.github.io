$(document).ready(function () {
  $('#menu').click(function () {
    $(this).toggleClass('fa-times');
    $('.navbar').toggleClass('nav-toggle');
  });

  $(window).on('scroll load', function () {
    $('#menu').removeClass('fa-times');
    $('.navbar').removeClass('nav-toggle');

    // show/hide back-to-top
    if (window.scrollY > 10) {
      document.querySelector('#scroll-top').classList.add('active');
    } else {
      document.querySelector('#scroll-top').classList.remove('active');
    }

    // scroll spy
    $('section').each(function () {
      let height = $(this).height();
      let offset = $(this).offset().top - 200;
      let top = $(window).scrollTop();
      let id = $(this).attr('id');

      if (top > offset && top < offset + height) {
        $('.navbar ul li a').removeClass('active');
        $('.navbar').find(`[href="#${id}"]`).addClass('active');
      }
    });
  });

  // smooth scrolling
  $('a[href*="#"]').on('click', function (e) {
    e.preventDefault();
    $('html, body').animate(
      { scrollTop: $($(this).attr('href')).offset().top },
      500,
      'linear'
    );
  });

  // emailjs
  $("#contact-form").submit(function (event) {
    emailjs.init("user_TTDmetQLYgWCLzHTDgqxm");

    emailjs.sendForm('contact_service', 'template_contact', '#contact-form')
      .then(function (response) {
        console.log('SUCCESS!', response.status, response.text);
        document.getElementById("contact-form").reset();
        alert("Form Submitted Successfully");
      }, function (error) {
        console.log('FAILED...', error);
        alert("Form Submission Failed! Try Again");
      });

    event.preventDefault();
  });
});

// dynamic title / favicon
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === "visible") {
    document.title = "Portfolio | Abdullah Naveed";
    $("#favicon").attr("href", "assets/images/an.png");
  } else {
    document.title = "Come Back To Portfolio";
    $("#favicon").attr("href", "assets/images/favhand.png");
  }
});

// typed.js
var typed = new Typed(".typing-text", {
  strings: ["Research", "ML Engineering", "Data Science"],
  loop: true,
  typeSpeed: 50,
  backSpeed: 25,
  backDelay: 500,
});

// data loading
async function fetchData(type = "skills") {
  let response = (type === "skills")
    ? await fetch("skills.json")
    : await fetch("./projects/projects.json");
  const data = await response.json();
  return data;
}

// showProjects (kept Tilt, removed duplicate ScrollReveal)
function showProjects(projects) {
  let projectsContainer = document.querySelector("#work .box-container");
  let projectHTML = "";
  projects
    .slice(0, 10)
    .filter(project => project.category != "development")
    .forEach(project => {
      projectHTML += `
        <div class="box tilt">
          <img draggable="false" src="/assets/images/projects/${project.image}.png" alt="project" />
          <div class="content">
            <div class="tag"><h3>${project.name}</h3></div>
            <div class="desc">
              <p>${project.desc}</p>
              <div class="btns">
                <a href="${project.links.code}" class="btn" target="_blank">Code <i class="fas fa-code"></i></a>
              </div>
            </div>
          </div>
        </div>`;
    });
  projectsContainer.innerHTML = projectHTML;

  // tilt
  VanillaTilt.init(document.querySelectorAll(".tilt"), { max: 15 });
}

fetchData().then(data => { showSkills?.(data); }); // keep if you re-enable showSkills
fetchData("projects").then(data => { showProjects(data); });

// global tilt (for items present on load)
VanillaTilt.init(document.querySelectorAll(".tilt"), { max: 15 });

// disable developer shortcuts
document.onkeydown = function (e) {
  if (e.keyCode == 123) return false;
  if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) return false;
  if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) return false;
  if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) return false;
  if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) return false;
};

// Tawk.to
var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
(function () {
  var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
  s1.async = true; s1.src = 'https://embed.tawk.to/60df10bf7f4b000ac03ab6a8/1f9jlirg6';
  s1.charset = 'UTF-8'; s1.setAttribute('crossorigin', '*'); s0.parentNode.insertBefore(s1, s0);
})();

/* ===== ScrollReveal (tuned) ===== */
const sr = ScrollReveal({
  origin: 'top',
  distance: '30px',
  duration: 600,
  easing: 'cubic-bezier(.2,.65,.3,1)',
  reset: false,             // reveal once
  mobile: true,
  viewFactor: 0.12,         // reveal earlier (12% visible)
  viewOffset: { top: 80, right: 0, bottom: 80, left: 0 }
});

// home
sr.reveal('.home .content h3, .home .content p, .home .content .btn', { interval: 120 });
sr.reveal('.home .image', { delay: 200 });
// about
sr.reveal('.about .content h3, .about .content .tag, .about .content p, .about .content .box-container, .about .content .resumebtn', { interval: 100 });
// skills
sr.reveal('.skills .container', { interval: 100 });
sr.reveal('.skills .container .bar', { interval: 60 });
// education
sr.reveal('.education .box', { interval: 120 });
// projects
sr.reveal('.work .box', { interval: 120 });
// experience
sr.reveal('.experience .timeline, .experience .timeline .container', { interval: 120 });
// contact
sr.reveal('.contact .container, .contact .container .form-group', { interval: 100 });

// respect prefers-reduced-motion
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  sr.destroy();
}
