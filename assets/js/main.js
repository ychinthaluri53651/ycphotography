/* ==========================================================================
   YC Photography — site behaviour
   Vanilla JS, no dependencies. Everything degrades gracefully without it.
   ========================================================================== */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var allPhotos = window.YC_PHOTOS || [];

  var CATEGORIES = [
    { id: "all", label: "All work" },
    { id: "weddings", label: "Weddings" },
    { id: "housewarming", label: "Housewarming" },
    { id: "events", label: "Events" },
    { id: "portraits", label: "Portraits" }
  ];

  var labelOf = {};
  var rankOf = {};
  CATEGORIES.forEach(function (c, i) { labelOf[c.id] = c.label; rankOf[c.id] = i; });

  // the portfolio shows only the categories above, each kept together in that
  // order; photos in any other category stay in photos.js but off the gallery
  var photos = allPhotos
    .filter(function (p) { return rankOf[p.cat] > 0; })
    .map(function (p, i) { return { p: p, i: i }; })
    .sort(function (a, b) { return rankOf[a.p.cat] - rankOf[b.p.cat] || a.i - b.i; })
    .map(function (x) { return x.p; });

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function thumb(p) { return "assets/img/thumb/" + p.id + ".webp"; }
  function full(p) { return "assets/img/full/" + p.id + ".webp"; }
  function xl(p) { return "assets/img/xl/" + p.id + ".webp"; }

  // let the browser pick the rendition that suits the slot and the screen
  function smallSet(p) { return thumb(p) + " 900w, " + full(p) + " 1600w"; }
  function largeSet(p) { return full(p) + " 1600w, " + xl(p) + " 2400w"; }

  /* ---------------------------------------------------------------- header */
  var header = $(".header");
  if (header && !header.classList.contains("header--static")) {
    var onScroll = function () {
      header.classList.toggle("is-solid", window.scrollY > 60);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ------------------------------------------------------------ mobile nav */
  var burger = $(".burger");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("is-menu-open");
      document.body.classList.toggle("is-locked", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$(".menu a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("is-menu-open", "is-locked");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* --------------------------------------------------------- scroll reveal */
  var revealables = $$(".reveal");
  if (revealables.length) {
    if (reduced || !("IntersectionObserver" in window)) {
      revealables.forEach(function (el) { el.classList.add("is-in"); });
    } else {
      var ro = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            ro.unobserve(e.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      revealables.forEach(function (el) { ro.observe(el); });
    }
  }

  /* --------------------------------------------------------- hero slideshow */
  var hero = $("[data-hero]");
  if (hero) {
    var slides = $$(".hero__slide", hero);
    var dots = $$(".hero__dots button", hero);
    var current = 0;
    var timer = null;

    var go = function (i) {
      current = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle("is-active", k === current); });
      dots.forEach(function (d, k) { d.setAttribute("aria-selected", k === current ? "true" : "false"); });
    };

    var play = function () {
      if (reduced || slides.length < 2) return;
      clearInterval(timer);
      timer = setInterval(function () { go(current + 1); }, 6000);
    };

    dots.forEach(function (d, k) {
      d.addEventListener("click", function () { go(k); play(); });
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { clearInterval(timer); } else { play(); }
    });

    go(0);
    play();
  }

  /* ------------------------------------------------------------- lightbox */
  var lb = $(".lb");
  var lbImg = lb && $(".lb__frame img", lb);
  var lbCount = lb && $("[data-lb-count]", lb);
  var lbCaption = lb && $(".lb__caption", lb);
  var lbSet = [];
  var lbIndex = 0;
  var lastFocus = null;

  function preload(p) {
    if (!p) return;
    var i = new Image();
    i.sizes = "100vw";
    i.srcset = largeSet(p);
    i.src = full(p);
  }

  function lbShow(i) {
    lbIndex = (i + lbSet.length) % lbSet.length;
    var p = lbSet[lbIndex];
    lbImg.classList.remove("is-ready");
    lbImg.alt = p.alt;
    var next = new Image();
    next.onload = function () {
      lbImg.sizes = "100vw";
      lbImg.srcset = largeSet(p);
      lbImg.src = next.currentSrc || next.src;
      lbImg.classList.add("is-ready");
    };
    next.sizes = "100vw";
    next.srcset = largeSet(p);
    next.src = full(p);
    if (next.complete) next.onload();
    lbCount.textContent = (lbIndex + 1) + " / " + lbSet.length;
    lbCaption.textContent = p.auto ? "" : p.alt;
    preload(lbSet[(lbIndex + 1) % lbSet.length]);
    preload(lbSet[(lbIndex - 1 + lbSet.length) % lbSet.length]);
  }

  function lbOpen(set, i) {
    if (!lb) return;
    lbSet = set;
    lastFocus = document.activeElement;
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    lbShow(i);
    $(".lb__close", lb).focus();
  }

  function lbClose() {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
    if (lastFocus) lastFocus.focus();
  }

  if (lb) {
    $(".lb__close", lb).addEventListener("click", lbClose);
    $(".lb__prev", lb).addEventListener("click", function () { lbShow(lbIndex - 1); });
    $(".lb__next", lb).addEventListener("click", function () { lbShow(lbIndex + 1); });
    // clicking the empty space around the photo closes the viewer
    $(".lb__frame", lb).addEventListener("click", function (e) {
      if (e.target === e.currentTarget) lbClose();
    });

    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") lbClose();
      if (e.key === "ArrowRight") lbShow(lbIndex + 1);
      if (e.key === "ArrowLeft") lbShow(lbIndex - 1);
    });

    // swipe
    var sx = 0;
    lb.addEventListener("touchstart", function (e) { sx = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 55) lbShow(lbIndex + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* --------------------------------------------------------- masonry grid */
  var grid = $("[data-gallery]");

  function layout() {
    if (!grid) return;
    var cs = getComputedStyle(grid);
    var cols = cs.gridTemplateColumns.split(" ").filter(Boolean).length;
    var gap = parseFloat(cs.rowGap) || 8;
    var row = parseFloat(cs.gridAutoRows) || 6;
    var colW = (grid.clientWidth - gap * (cols - 1)) / cols;

    $$(".tile", grid).forEach(function (tile) {
      if (tile.hidden) return;
      var w = parseFloat(tile.dataset.w);
      var h = parseFloat(tile.dataset.h);
      var px = colW * (h / w);
      tile.style.gridRowEnd = "span " + Math.max(1, Math.round((px + gap) / (row + gap)));
    });
  }

  function buildGrid() {
    if (!grid || !photos.length) return;

    var frag = document.createDocumentFragment();
    photos.forEach(function (p, i) {
      var fig = document.createElement("figure");
      fig.className = "tile";
      fig.dataset.cat = p.cat;
      fig.dataset.index = i;
      fig.dataset.w = p.w;
      fig.dataset.h = p.h;
      fig.style.background = p.c;
      fig.tabIndex = 0;
      fig.setAttribute("role", "button");
      fig.setAttribute("aria-label", "Open photo: " + p.alt);
      fig.innerHTML =
        '<img src="' + thumb(p) + '" srcset="' + smallSet(p) + '"' +
        ' sizes="(max-width: 560px) 92vw, (max-width: 1024px) 46vw, 31vw"' +
        ' alt="' + p.alt + '" width="' + p.w + '" height="' + p.h + '" loading="lazy" decoding="async">' +
        '<span class="tile__zoom" aria-hidden="true">' +
        '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2">' +
        '<circle cx="6" cy="6" r="4.4"/><path d="M9.4 9.4 13 13M6 4v4M4 6h4"/></svg></span>';
      frag.appendChild(fig);
    });
    grid.appendChild(frag);

    var visible = function () {
      return $$(".tile", grid).filter(function (t) { return !t.hidden; });
    };

    var openFrom = function (tile) {
      var set = visible().map(function (t) { return photos[+t.dataset.index]; });
      var me = photos[+tile.dataset.index];
      lbOpen(set, set.indexOf(me));
    };

    grid.addEventListener("click", function (e) {
      var tile = e.target.closest(".tile");
      if (tile) openFrom(tile);
    });

    grid.addEventListener("keydown", function (e) {
      var tile = e.target.closest(".tile");
      if (tile && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        openFrom(tile);
      }
    });

    // fade tiles in as they scroll into view
    if (reduced || !("IntersectionObserver" in window)) {
      $$(".tile", grid).forEach(function (t) { t.classList.add("is-in"); });
    } else {
      var tio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            tio.unobserve(e.target);
          }
        });
      }, { rootMargin: "120px 0px", threshold: 0.02 });
      $$(".tile", grid).forEach(function (t) { tio.observe(t); });
    }

    layout();
    window.addEventListener("load", layout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

    var rt;
    var relayout = function () {
      clearTimeout(rt);
      rt = setTimeout(layout, 120);
    };
    window.addEventListener("resize", relayout);
    // catches width changes the resize event misses (scrollbars, zoom, rotation)
    if ("ResizeObserver" in window) new ResizeObserver(relayout).observe(grid);
  }

  /* ------------------------------------------------------------- filtering */
  function buildFilters() {
    var bar = $("[data-filters]");
    if (!bar || !grid) return;

    var counts = {};
    photos.forEach(function (p) { counts[p.cat] = (counts[p.cat] || 0) + 1; });

    CATEGORIES.forEach(function (c) {
      var n = c.id === "all" ? photos.length : counts[c.id] || 0;
      if (!n) return;
      var b = document.createElement("button");
      b.className = "filter";
      b.type = "button";
      b.dataset.cat = c.id;
      b.setAttribute("aria-pressed", "false");
      b.innerHTML = c.label + " <span>" + n + "</span>";
      bar.appendChild(b);
    });

    var apply = function (cat, push) {
      $$(".filter", bar).forEach(function (b) {
        b.setAttribute("aria-pressed", b.dataset.cat === cat ? "true" : "false");
      });
      $$(".tile", grid).forEach(function (t) {
        t.hidden = !(cat === "all" || t.dataset.cat === cat);
      });
      layout();
      var note = $("[data-gallery-note]");
      if (note) {
        var n = $$(".tile", grid).filter(function (t) { return !t.hidden; }).length;
        note.textContent = n + (n === 1 ? " photograph" : " photographs") +
          (cat === "all" ? "" : " — " + labelOf[cat]);
      }
      if (push) {
        var url = cat === "all" ? location.pathname : location.pathname + "?c=" + cat;
        history.replaceState(null, "", url);
      }
    };

    bar.addEventListener("click", function (e) {
      var b = e.target.closest(".filter");
      if (b) apply(b.dataset.cat, true);
    });

    var start = new URLSearchParams(location.search).get("c");
    apply(start && labelOf[start] ? start : "all", false);
  }

  /* ------------------------------------------- home page: featured + cards */
  function fillSlots() {
    if (!photos.length) return;
    var byId = {};
    allPhotos.forEach(function (p) { byId[p.id] = p; });

    $$("[data-photo]").forEach(function (el) {
      var p = byId[el.dataset.photo];
      if (!p) return;
      var img = el.tagName === "IMG" ? el : $("img", el);
      if (!img) return;
      var big = el.dataset.size === "full";
      img.sizes = el.dataset.sizes || (big ? "50vw" : "25vw");
      img.srcset = big ? largeSet(p) : smallSet(p);
      img.src = big ? full(p) : thumb(p);
      if (!img.alt) img.alt = p.alt;
      img.width = p.w;
      img.height = p.h;
      if (el.tagName !== "IMG") el.style.background = p.c;
    });

    // featured mosaic opens the lightbox too
    var mosaic = $("[data-mosaic]");
    if (mosaic && lb) {
      var set = $$("figure[data-photo]", mosaic).map(function (f) { return byId[f.dataset.photo]; }).filter(Boolean);
      $$("figure[data-photo]", mosaic).forEach(function (f, i) {
        f.style.cursor = "zoom-in";
        f.addEventListener("click", function () { lbOpen(set, i); });
      });
    }

    // counts on the category cards
    var counts = {};
    photos.forEach(function (p) { counts[p.cat] = (counts[p.cat] || 0) + 1; });
    $$("[data-count]").forEach(function (el) {
      el.textContent = (counts[el.dataset.count] || 0) + " photos";
    });
  }

  /* ------------------------------------------------------------ contact form */
  function contactForm() {
    var form = $("[data-contact-form]");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      if (form.querySelector('input[name="_gotcha"]').value) {
        e.preventDefault();
        return;
      }

      var endpoint = form.getAttribute("action") || "";
      // Until a form endpoint is connected, fall back to the visitor's mail app
      // so no enquiry is ever lost.
      if (endpoint.indexOf("YOUR_FORM_ID") !== -1 || endpoint === "") {
        e.preventDefault();
        var get = function (n) {
          var f = form.querySelector('[name="' + n + '"]');
          return f ? f.value.trim() : "";
        };
        var body = [
          "Name: " + get("name"),
          "Email: " + get("email"),
          "Phone: " + get("phone"),
          "Type of shoot: " + get("shoot"),
          "Date: " + get("date"),
          "Location: " + get("location"),
          "",
          get("message")
        ].join("\n");
        window.location.href = "mailto:" + form.dataset.email +
          "?subject=" + encodeURIComponent("Enquiry from " + (get("name") || "the website")) +
          "&body=" + encodeURIComponent(body);
      }
    });
  }

  /* ------------------------------------------------------------------ init */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  fillSlots();
  buildGrid();
  buildFilters();
  contactForm();
})();
