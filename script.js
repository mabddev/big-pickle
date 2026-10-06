/* Big Pickle — Behavioral Datasheet: interactions only.
   The page is fully readable with this file absent. */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- 1. Scroll-spy for the section rail ---- */
  var railLinks = Array.prototype.slice.call(
    document.querySelectorAll(".rail-list a[href^='#']")
  );

  if (railLinks.length && "IntersectionObserver" in window) {
    var sections = railLinks
      .map(function (a) { return document.querySelector(a.getAttribute("href")); })
      .filter(Boolean);

    var linkFor = function (id) {
      return railLinks.filter(function (a) {
        return a.getAttribute("href") === "#" + id;
      })[0];
    };

    var current = null;
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var next = linkFor(entry.target.id);
          if (!next || next === current) return;
          if (current) current.removeAttribute("aria-current");
          next.setAttribute("aria-current", "true");
          current = next;
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---- 2. Draw charts/diagrams once, on scroll into view ---- */
  var groups = Array.prototype.slice.call(document.querySelectorAll(".draw-group"));

  if (groups.length) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      var drawer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              drawer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.25 }
      );
      groups.forEach(function (g) { drawer.observe(g); });
    } else {
      groups.forEach(function (g) { g.classList.add("in"); });
    }
  }

  /* ---- 3. Context meter: hover a legend item, light its segment ---- */
  var meter = document.getElementById("meter");

  if (meter) {
    var segs = Array.prototype.slice.call(meter.querySelectorAll(".seg"));
    var items = Array.prototype.slice.call(meter.querySelectorAll(".meter-legend li"));

    var setHot = function (key) {
      meter.classList.toggle("is-hovering", key !== null);
      segs.forEach(function (s) {
        s.classList.toggle("is-hot", key !== null && s.getAttribute("data-seg") === key);
      });
      items.forEach(function (li) {
        li.classList.toggle("is-hot", key !== null && li.getAttribute("data-seg") === key);
      });
    };

    var bind = function (el) {
      var key = el.getAttribute("data-seg");
      el.addEventListener("mouseenter", function () { setHot(key); });
      el.addEventListener("mouseleave", function () { setHot(null); });
      el.addEventListener("focus", function () { setHot(key); });
      el.addEventListener("blur", function () { setHot(null); });
    };

    segs.forEach(bind);
    items.forEach(bind);
  }

  /* ---- 4. Print: open every capability row first ---- */
  var rows = Array.prototype.slice.call(document.querySelectorAll("details.mrow"));
  var reopen = [];

  window.addEventListener("beforeprint", function () {
    reopen = [];
    rows.forEach(function (d) {
      if (!d.open) { reopen.push(d); d.open = true; }
    });
  });

  window.addEventListener("afterprint", function () {
    reopen.forEach(function (d) { d.open = false; });
    reopen = [];
  });
})();
