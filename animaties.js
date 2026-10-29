(function () {
  var rustig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Elementen rustig laten verschijnen zodra ze in beeld komen
  var doelen = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !rustig) {
    var kijker = new IntersectionObserver(function (items) {
      items.forEach(function (item) {
        if (item.isIntersecting) {
          item.target.classList.add("is-in");
          kijker.unobserve(item.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
    doelen.forEach(function (el) { kijker.observe(el); });
  } else {
    doelen.forEach(function (el) { el.classList.add("is-in"); });
  }

  // Header krijgt een achtergrond zodra je scrolt
  var header = document.querySelector(".site-header");
  function headerBij() { header.classList.toggle("scrolled", window.scrollY > 20); }
  window.addEventListener("scroll", headerBij, { passive: true });
  headerBij();
})();
