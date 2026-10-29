(function () {
  var rustig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Koppen opsplitsen in woorden, zodat ze één voor één kunnen verschijnen
  document.querySelectorAll("[data-split]").forEach(function (el) {
    var woorden = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = woorden.map(function (w, i) {
      return '<span class="w" aria-hidden="true"><span style="--i:' + i + '">' + w + "</span></span>";
    }).join(" ");
  });

  // Elementen tonen zodra ze in beeld komen
  var doelen = document.querySelectorAll("[data-reveal], [data-split]");
  if ("IntersectionObserver" in window && !rustig) {
    var kijker = new IntersectionObserver(function (items) {
      items.forEach(function (item) {
        if (item.isIntersecting) {
          item.target.classList.add("is-in");
          kijker.unobserve(item.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
    doelen.forEach(function (el) { kijker.observe(el); });
  } else {
    doelen.forEach(function (el) { el.classList.add("is-in"); });
  }

  // Header: achtergrond na scrollen, verbergen bij omlaag scrollen
  var header = document.querySelector(".site-header");
  var vorige = window.scrollY;
  function headerBij() {
    var y = window.scrollY;
    header.classList.toggle("scrolled", y > 20);
    header.classList.toggle("hidden", y > 400 && y > vorige + 4);
    if (y < vorige - 4) header.classList.remove("hidden");
    vorige = y;
  }

  // Foto's bewegen iets langzamer mee dan de pagina (parallax)
  var lagen = rustig ? [] : Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  function parallaxBij() {
    var h = window.innerHeight;
    lagen.forEach(function (img) {
      var r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > h) return;
      var midden = (r.top + r.height / 2 - h / 2) / h;
      var kracht = parseFloat(img.dataset.parallax) || 0.06;
      img.style.transform = "translateY(" + (midden * kracht * -100).toFixed(2) + "%) scale(1.14)";
    });
  }

  var gepland = false;
  function opScroll() {
    if (gepland) return;
    gepland = true;
    requestAnimationFrame(function () {
      headerBij();
      parallaxBij();
      gepland = false;
    });
  }
  window.addEventListener("scroll", opScroll, { passive: true });
  window.addEventListener("resize", opScroll);
  opScroll();

  // De omslagfoto kantelt licht mee met de muis
  var kantel = document.querySelector("[data-tilt]");
  if (kantel && !rustig && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    kantel.addEventListener("mousemove", function (e) {
      var r = kantel.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      kantel.style.transform = "perspective(1200px) rotateY(" + (x * 6).toFixed(2) + "deg) rotateX(" + (y * -6).toFixed(2) + "deg)";
    });
    kantel.addEventListener("mouseleave", function () { kantel.style.transform = ""; });
  }
})();
