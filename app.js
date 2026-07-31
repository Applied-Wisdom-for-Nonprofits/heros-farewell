(function () {
  const root = document.getElementById("view");
  const tocEl = document.getElementById("toc");
  const tocToggle = document.getElementById("toc-toggle");
  const tocClose = document.getElementById("toc-close");
  const book = window.BOOK;

  function parseRoute() {
    const hash = location.hash.replace(/^#\/?/, "");
    if (!hash || hash === "home") return { name: "home" };
    const match = hash.match(/^chapter\/(\d+)$/);
    if (match) {
      const id = Number(match[1]);
      if (book.chapters.some((c) => c.id === id)) return { name: "chapter", id };
    }
    return { name: "home" };
  }

  function setActiveToc(route) {
    tocEl.querySelectorAll("a").forEach((a) => {
      const isHome = route.name === "home" && a.dataset.route === "home";
      const isChapter =
        route.name === "chapter" && Number(a.dataset.chapter) === route.id;
      a.classList.toggle("active", Boolean(isHome || isChapter));
    });
  }

  function closeSidebar() {
    document.body.classList.remove("sidebar-open");
    tocToggle?.setAttribute("aria-expanded", "false");
  }

  function openSidebar() {
    document.body.classList.add("sidebar-open");
    tocToggle?.setAttribute("aria-expanded", "true");
    window.requestAnimationFrame(() => tocClose?.focus());
  }

  function toggleSidebar() {
    if (document.body.classList.contains("sidebar-open")) {
      closeSidebar();
      tocToggle?.focus();
    } else {
      openSidebar();
    }
  }

  function renderToc() {
    const home = `<li><a href="#/" data-route="home"><span class="toc-num">•</span><span>Cover & overview</span></a></li>`;
    const items = book.chapters
      .map(
        (c) =>
          `<li><a href="#/chapter/${c.id}" data-chapter="${c.id}"><span class="toc-num">${String(c.id).padStart(2, "0")}</span><span>${c.title}</span></a></li>`
      )
      .join("");
    tocEl.innerHTML = home + items;
  }

  function renderHome() {
    const types = book.types
      .map(
        (t) => `
        <div class="type-item">
          <h3>${t.name}</h3>
          <p>Leaves: ${t.voluntary}<br>${t.involvement}<br>${t.risk}</p>
        </div>`
      )
      .join("");

    root.innerHTML = `
      <section class="panel cover">
        <div class="cover-intro">
          <figure class="cover-art">
            <img
              src="assets/heros-farewell-editorial-cover.webp"
              alt="Editorial ink sketch of The Hero's Farewell book cover, showing an older executive writing"
              width="1000"
              height="1573"
              decoding="async"
              fetchpriority="high"
            />
          </figure>
          <div class="cover-copy">
            <div class="cover-mark" aria-hidden="true"></div>
            <h1>${book.title}</h1>
            <p class="cover-sub">${book.subtitle}</p>
            <p class="cover-by">${book.author}</p>
            <p class="cover-note">${book.note}</p>
            <div class="cover-actions">
              <a class="btn btn-primary" href="#/chapter/1">Start reading</a>
            </div>
          </div>
        </div>
        <div class="types">
          <h2>Four ways leaders leave</h2>
          <div class="type-grid">${types}</div>
        </div>
      </section>`;
  }

  function renderChapter(id) {
    const chapter = book.chapters.find((c) => c.id === id);
    const prev = book.chapters.find((c) => c.id === id - 1);
    const next = book.chapters.find((c) => c.id === id + 1);

    const summary = (chapter.summary || [])
      .map((para) => `<p>${para}</p>`)
      .join("");

    const visuals = (chapter.visuals || [])
      .map(
        (visual) => `
        <figure class="chapter-visual">
          <img src="${visual.src}" alt="${visual.alt}" loading="lazy" />
          <figcaption>${visual.caption}</figcaption>
        </figure>`
      )
      .join("");

    const concepts = chapter.concepts
      .map(
        (concept) => `
        <article class="concept">
          <h2>${concept.heading}</h2>
          <p>${concept.body}</p>
        </article>`
      )
      .join("");

    const prevLink = prev
      ? `<a href="#/chapter/${prev.id}"><span class="dir">Previous</span>${prev.title}</a>`
      : `<a href="#/"><span class="dir">Previous</span>Cover & overview</a>`;

    const nextLink = next
      ? `<a class="next" href="#/chapter/${next.id}"><span class="dir">Next</span>${next.title}</a>`
      : `<a class="next" href="#/"><span class="dir">Next</span>Back to cover</a>`;

    const mobilePrevHref = prev ? `#/chapter/${prev.id}` : "#/";
    const mobileNextHref = next ? `#/chapter/${next.id}` : "#/";

    const visualsBlock = visuals
      ? `<section class="chapter-visuals" aria-label="Chapter visuals">
          <h2 class="summary-label">Visuals</h2>
          ${visuals}
        </section>`
      : "";

    root.innerHTML = `
      <article class="panel chapter-shell">
        <div class="chapter-meta">
          <span>Chapter ${chapter.id}</span>
          <span>p. ${chapter.page}</span>
        </div>
        <h1>${chapter.title}</h1>
        <p class="lede">${chapter.lede}</p>
        <section class="chapter-summary" aria-label="Chapter summary">
          <h2 class="summary-label">Chapter summary</h2>
          ${summary}
        </section>
        ${visualsBlock}
        <div class="concepts">${concepts}</div>
        <nav class="pager" aria-label="Chapter navigation">
          ${prevLink}
          ${nextLink}
        </nav>
      </article>
      <nav class="mobile-reader-nav" aria-label="Mobile chapter navigation">
          <a href="${mobilePrevHref}" aria-label="Previous: ${prev ? prev.title : "Cover and overview"}">
            <span aria-hidden="true">←</span>
            <span>Previous</span>
          </a>
          <button type="button" data-open-toc aria-label="Open table of contents">
            <span>Contents</span>
            <small>${chapter.id} of ${book.chapters.length}</small>
          </button>
          <a href="${mobileNextHref}" aria-label="Next: ${next ? next.title : "Back to cover"}">
            <span>Next</span>
            <span aria-hidden="true">→</span>
          </a>
      </nav>`;
  }

  function render() {
    const route = parseRoute();
    if (route.name === "chapter") renderChapter(route.id);
    else renderHome();
    document.body.classList.toggle("reader-chapter", route.name === "chapter");
    setActiveToc(route);
    closeSidebar();
    window.scrollTo(0, 0);

    const mobileTitle = document.getElementById("mobile-title");
    if (mobileTitle) {
      if (route.name === "chapter") {
        const ch = book.chapters.find((c) => c.id === route.id);
        mobileTitle.textContent = `Ch. ${ch.id} · ${ch.title}`;
      } else {
        mobileTitle.textContent = book.title;
      }
    }
  }

  function onKey(e) {
    if (e.target.matches("input, textarea")) return;
    if (e.key === "Escape" && document.body.classList.contains("sidebar-open")) {
      closeSidebar();
      tocToggle?.focus();
      return;
    }
    const route = parseRoute();
    if (e.key === "ArrowRight") {
      if (route.name === "home") location.hash = "#/chapter/1";
      else if (route.id < book.chapters.length) location.hash = `#/chapter/${route.id + 1}`;
    }
    if (e.key === "ArrowLeft") {
      if (route.name === "chapter" && route.id === 1) location.hash = "#/";
      else if (route.name === "chapter") location.hash = `#/chapter/${route.id - 1}`;
    }
  }

  renderToc();
  render();
  window.addEventListener("hashchange", render);
  window.addEventListener("keydown", onKey);

  tocToggle?.addEventListener("click", toggleSidebar);
  tocClose?.addEventListener("click", () => {
    closeSidebar();
    tocToggle?.focus();
  });
  document.getElementById("backdrop")?.addEventListener("click", () => {
    closeSidebar();
    tocToggle?.focus();
  });
  root.addEventListener("click", (event) => {
    if (event.target.closest("[data-open-toc]")) openSidebar();
  });
})();
