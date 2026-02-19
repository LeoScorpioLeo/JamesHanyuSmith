// script.js
// Add this file if you do not already have one.
// If you already have script.js, merge the functions below.

(function () {
  function getHeaderOffset() {
    var header = document.querySelector(".top");
    if (!header) return 0;
    return header.getBoundingClientRect().height + 10;
  }

  function smoothScrollWithOffset(targetId) {
    var el = document.getElementById(targetId);
    if (!el) return;

    var offset = getHeaderOffset();
    var y = el.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({ top: y, behavior: "smooth" });
  }

  function onNavClick(e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;

    var id = link.getAttribute("href").slice(1);
    if (!id) return;

    e.preventDefault();
    history.pushState(null, "", "#" + id);
    smoothScrollWithOffset(id);
  }

  function setActiveNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
    if (!links.length) return;

    var offset = getHeaderOffset();
    var fromTop = window.scrollY + offset + 2;

    var currentId = "";
    for (var i = 0; i < links.length; i++) {
      var id = links[i].getAttribute("href").slice(1);
      var section = document.getElementById(id);
      if (!section) continue;

      var top = section.offsetTop;
      var bottom = top + section.offsetHeight;

      if (fromTop >= top && fromTop < bottom) {
        currentId = id;
        break;
      }
    }

    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      if (id === currentId) a.classList.add("active");
      else a.classList.remove("active");
    });
  }

  document.addEventListener("click", onNavClick);
  window.addEventListener("scroll", setActiveNav, { passive: true });
  window.addEventListener("load", function () {
    setActiveNav();
    if (location.hash) {
      var id = location.hash.slice(1);
      if (id) smoothScrollWithOffset(id);
    }
  });
})();
