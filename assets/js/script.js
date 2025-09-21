/*
####################################################################################################
#####################################>  SCRIPT.JS (Portfolio)  <###################################
####################################################################################################
*/

(function () {
  "use strict";

  /*##############################################################################################
  #####################################>  NAV + SCROLL BEHAVIOR  <#################################
  ##############################################################################################*/
  $(document).ready(function () {
    // Hamburger toggle
    $('#menu').click(function () {
      $(this).toggleClass('fa-times');
      $('.navbar').toggleClass('nav-toggle');
    });

    // Scroll + load: close nav, scroll spy, show back-to-top
    $(window).on('scroll load', function () {
      $('#menu').removeClass('fa-times');
      $('.navbar').removeClass('nav-toggle');

      // Show/hide back-to-top
      if (window.scrollY > 10) {
        document.querySelector('#scroll-top').classList.add('active');
      } else {
        document.querySelector('#scroll-top').classList.remove('active');
      }

      // Scroll spy
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

    // Smooth scrolling for anchor links
    $('a[href*="#"]').on('click', function (e) {
      const target = $($(this).attr('href'));
      if (!target.length) return;          // guard for external links with '#'
      e.preventDefault();
      $('html, body').animate({ scrollTop: target.offset().top }, 500, 'linear');
    });
  });

  /*##############################################################################################
  #####################################>  EMAILJS (CONTACT FORM) <#################################
  ##############################################################################################*/
  const EMAILJS_PUBLIC_KEY  = "Mxn3esSwoirljhTd3";   // your actual public key
  const EMAILJS_SERVICE_ID  = "service_cnm7ry6";     // your SMTP service ID
  const EMAILJS_TEMPLATE_ID = "template_uxqfdii";      // copy this ID from the template page

  document.addEventListener("DOMContentLoaded", function () {
    if (!window.emailjs || !emailjs.init) {
      console.error("EmailJS SDK not found. Include the CDN script before your main script.");
      return;
    }

    // Init: support both new ({ publicKey }) and old (string) styles
    try {
      if (typeof EMAILJS_PUBLIC_KEY === "string" && EMAILJS_PUBLIC_KEY.length > 0) {
        // Older style init (works for all keys)
        emailjs.init(EMAILJS_PUBLIC_KEY);
      } else {
        // Fallback (shouldn't hit)
        emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
      }
    } catch (e) {
      console.error("EmailJS init failed:", e);
    }

    const form = document.getElementById("contact-form");
    const submitBtn = document.getElementById("contact-submit");
    const statusEl = document.getElementById("contact-status");

    if (!form) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      // Loosened guard: just ensure a non-empty key
      if (!EMAILJS_PUBLIC_KEY) {
        alert("Email service is not configured. Set EMAILJS_PUBLIC_KEY.");
        return;
      }
      if (!EMAILJS_TEMPLATE_ID) {
        alert("Email service is not configured. Set EMAILJS_TEMPLATE_ID.");
        return;
      }

      // UX while sending
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.7";
        submitBtn.textContent = "Sending…";
      }
      if (statusEl) {
        statusEl.textContent = "Sending your message…";
        statusEl.style.color = "#666";
      }

      emailjs
        .sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
        .then(function (response) {
          console.log("EmailJS SUCCESS", response);
          form.reset();
          if (statusEl) {
            statusEl.textContent = "Thanks! Your message was sent successfully.";
            statusEl.style.color = "#159957";
          }
          alert("Form Submitted Successfully");
        })
        .catch(function (error) {
          console.error("EmailJS FAILED", error);
          let msg = "Form Submission Failed! Try Again";
          if (error && error.text) msg += `\n\nDetails: ${error.text}`;
          alert(msg);
          if (statusEl) {
            statusEl.textContent = "Failed to send. Please verify your email and try again.";
            statusEl.style.color = "#c0392b";
          }
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = "1";
            submitBtn.textContent = "Submit";
          }
        });
    });
  });

  /*##############################################################################################
  #####################################>  PAGE TITLE / FAVICON  <#################################
  ##############################################################################################*/
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === "visible") {
      document.title = "Portfolio | Abdullah Naveed";
      $("#favicon").attr("href", "assets/images/an.png");
    } else {
      document.title = "Come Back To Portfolio";
      $("#favicon").attr("href", "assets/images/favhand.png");
    }
  });

  /*##############################################################################################
  #####################################>  HERO: TYPED.JS  <#######################################
  ##############################################################################################*/
  var typed = new Typed(".typing-text", {
    strings: ["Research", "ML Engineering", "Data Science"],
    loop: true,
    typeSpeed: 50,
    backSpeed: 25,
    backDelay: 500,
  });

  /*##############################################################################################
  #####################################>  VANILLA TILT  <#########################################
  ##############################################################################################*/
  document.addEventListener("DOMContentLoaded", function () {
    if (window.VanillaTilt) {
      VanillaTilt.init(document.querySelectorAll(".tilt"), { max: 15 });
    }
  });

  /*##############################################################################################
  #####################################>  DISABLE DEV SHORTCUTS  <################################
  ##############################################################################################*/
  document.onkeydown = function (e) {
    if (e.keyCode == 123) return false; // F12
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) return false;
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) return false;
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) return false;
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) return false; // View Source
  };

  /*##############################################################################################
  #####################################>  LIVE CHAT (Tawk.to)  <##################################
  ##############################################################################################*/
  // Left disabled on purpose
  // var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
  // (function () {
  //   var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
  //   s1.async = true; s1.src = 'https://embed.tawk.to/...';
  //   s1.charset = 'UTF-8'; s1.setAttribute('crossorigin', '*'); s0.parentNode.insertBefore(s1, s0);
  // })();

  /*##############################################################################################
  #####################################>  SCROLLREVEAL  <########################################
  ##############################################################################################*/
  const sr = ScrollReveal({
    origin: 'top',
    distance: '30px',
    duration: 600,
    easing: 'cubic-bezier(.2,.65,.3,1)',
    reset: false,
    mobile: true,
    viewFactor: 0.12,
    viewOffset: { top: 80, right: 0, bottom: 80, left: 0 }
  });

  sr.reveal('.home .content h3, .home .content p, .home .content .btn', { interval: 120 });
  sr.reveal('.home .image', { delay: 200 });
  sr.reveal('.about .content h3, .about .content .tag, .about .content p, .about .content .box-container, .about .content .resumebtn', { interval: 100 });
  sr.reveal('.skills .container', { interval: 100 });
  sr.reveal('.skills .container .bar', { interval: 60 });
  sr.reveal('.education .box', { interval: 120 });
  sr.reveal('.work .box', { interval: 120 });
  sr.reveal('.experience .timeline, .experience .timeline .container', { interval: 120 });
  sr.reveal('.contact .container, .contact .container .form-group', { interval: 100 });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    sr.destroy();
  }

  /*##############################################################################################
  #####################################>  PROJECTS LOADER  <#####################################
  ##############################################################################################*/
  async function fetchProjects() {
    const tryPaths = [
      "/projects/projects.json",
      "./projects/projects.json",
      "/projects.json",
      "./projects.json"
    ];
    for (const p of tryPaths) {
      try {
        const r = await fetch(p, { cache: "no-cache" });
        if (r.ok) return await r.json();
      } catch (_) { }
    }
    console.warn("projects.json not found via known paths");
    return [];
  }

  function projectCard(p) {
    return `
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
    </div>`;
  }

  async function buildHomeProjects() {
    const data = await fetchProjects();
    const devWrap = document.querySelector("#dev-projects");
    const resWrap = document.querySelector("#research-projects");
    const resHeading = document.querySelector(".research-heading");

    const research = data.filter(d => (d.category || "").toLowerCase() === "research");
    const nonResearch = data.filter(d => (d.category || "").toLowerCase() !== "research");

    if (devWrap) devWrap.innerHTML = nonResearch.map(projectCard).join("");

    if (resWrap && resHeading) {
      if (research.length) {
        resWrap.innerHTML = research.map(projectCard).join("");
        resHeading.style.display = "";
        resWrap.style.display = "";
      } else {
        resHeading.style.display = "none";
        resWrap.style.display = "none";
      }
    }

    if (window.VanillaTilt) {
      VanillaTilt.init(document.querySelectorAll(".tilt"), { max: 15 });
    }
  }

  document.addEventListener("DOMContentLoaded", buildHomeProjects);

})();