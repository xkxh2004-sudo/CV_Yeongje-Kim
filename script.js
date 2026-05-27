const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const escapeHTML = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const uniqueThemes = (items) => {
  const themes = new Set();
  items.forEach((item) => (item.themes || []).forEach((theme) => themes.add(theme)));
  return ["All", ...Array.from(themes).sort()];
};

const tagTone = (index) => ["green", "coral", "blue"][index % 3];

const renderTag = (theme, index = 0) => `<span class="tag" data-tone="${tagTone(index)}">${escapeHTML(theme)}</span>`;

const renderProfile = () => {
  $("#hero-bio").textContent = siteData.profile.tagline;
  $("#profile-summary").textContent = siteData.profile.bio;

  $("#stats").innerHTML = siteData.stats
    .map(
      (stat) => `
        <div class="stat-tile${stat.featured ? " stat-tile-featured" : ""}">
          <strong>${escapeHTML(stat.value)}</strong>
          <span>${escapeHTML(stat.label)}</span>
          ${stat.detail ? `<small>${escapeHTML(stat.detail)}</small>` : ""}
        </div>
      `,
    )
    .join("");

  $("#interest-cloud").innerHTML = siteData.interests.map((item, index) => renderTag(item, index)).join("");
};

const renderClusters = () => {
  const clusterOnly = siteData.clusterOnlyOutputs.reduce((acc, item) => {
    acc[item.cluster] = acc[item.cluster] || [];
    acc[item.cluster].push(item);
    return acc;
  }, {});

  $("#cluster-grid").innerHTML = siteData.clusters
    .map((cluster, index) => {
      const related = clusterOnly[cluster.title] || [];
      const relatedMarkup = related.length
        ? `
          <details>
            <summary>Related cluster outputs</summary>
            <ul class="cluster-output">
              ${related
                .map(
                  (item) => `
                    <li>
                      ${escapeHTML(item.date)} · ${escapeHTML(item.title)}
                      ${item.koreanTitle ? `<br /><span class="korean-line">${escapeHTML(item.koreanTitle)}</span>` : ""}
                      <br /><span class="citation-meta">${escapeHTML(item.venue)}${
                        item.koreanVenue ? ` · ${escapeHTML(item.koreanVenue)}` : ""
                      }</span>
                    </li>
                  `,
                )
                .join("")}
            </ul>
          </details>
        `
        : "";

      return `
        <article class="cluster-card">
          <div>
            <span class="cluster-kicker">${escapeHTML(cluster.kicker)}</span>
            <h3>${escapeHTML(cluster.title)}</h3>
          </div>
          <p>${escapeHTML(cluster.summary)}</p>
          <div class="card-tags">${cluster.themes.map((theme, tagIndex) => renderTag(theme, index + tagIndex)).join("")}</div>
          <ul class="cluster-output">
            ${cluster.outputs.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}
          </ul>
          ${relatedMarkup}
        </article>
      `;
    })
    .join("");
};

const renderFilterButtons = (container, themes, activeTheme) => {
  container.innerHTML = themes
    .map(
      (theme) => `
        <button class="filter-button ${theme === activeTheme ? "is-active" : ""}" type="button" data-theme="${escapeHTML(theme)}">
          ${escapeHTML(theme)}
        </button>
      `,
    )
    .join("");
};

const formatAuthors = (value = "") =>
  escapeHTML(value).replace(/Kim, Y\. J\.|Kim, Y\./g, (match) => `<strong class="self-author">${match}</strong>`);

const makeCitation = (item) => {
  const year = item.year ? ` (${item.year}). ` : " ";
  const details = item.details ? `, ${escapeHTML(item.details)}` : "";
  const venue = item.venue ? `<em>${escapeHTML(item.venue)}</em>${details}` : "";
  return `${formatAuthors(item.authors)}${year}${escapeHTML(item.title)}. ${venue}.`;
};

const makeKoreanBlock = (item) => {
  if (!item.domestic && !item.koreanTitle && !item.koreanVenue) return "";
  const lines = [item.koreanTitle, item.koreanVenue].filter(Boolean);
  if (!lines.length) return "";
  return `<div class="korean-line">${lines.map(escapeHTML).join("<br />")}</div>`;
};

const renderPublicationItem = (item, index) => `
  <article class="publication-item">
    <div class="publication-year">${escapeHTML(item.year)}</div>
    <div class="citation">
      <h3>${escapeHTML(item.title)}</h3>
      <p>${makeCitation(item)}</p>
      ${makeKoreanBlock(item)}
      <div class="citation-meta">${escapeHTML(item.type)}${item.status ? ` · ${escapeHTML(item.status)}` : ""}</div>
      ${item.doi ? `<a class="doi" href="${escapeHTML(item.doi)}" target="_blank" rel="noreferrer">${escapeHTML(item.doi)}</a>` : ""}
      <div class="card-tags">${(item.themes || []).map((theme, tagIndex) => renderTag(theme, index + tagIndex)).join("")}</div>
    </div>
  </article>
`;

const renderPublicationList = (items, search, theme) => {
  const normalized = search.trim().toLowerCase();
  const filtered = items.filter((item) => {
    const text = [
      item.title,
      item.koreanTitle,
      item.authors,
      item.venue,
      item.koreanVenue,
      item.details,
      ...(item.themes || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesSearch = !normalized || text.includes(normalized);
    const matchesTheme = theme === "All" || (item.themes || []).includes(theme);
    return matchesSearch && matchesTheme;
  });

  $("#publication-list").innerHTML = filtered.map(renderPublicationItem).join("");
};

const renderManuscripts = () => {
  $("#manuscript-list").innerHTML = siteData.manuscripts.map(renderPublicationItem).join("");
};

const renderPresentationItem = (item, index) => {
  const details = [item.venue, item.details, item.location].filter(Boolean).join(" · ");
  return `
    <article class="presentation-item">
      <div>
        <span class="presentation-date">${escapeHTML(item.date || item.year)}</span>
        <span class="presentation-type">${escapeHTML(item.type)}</span>
      </div>
      <div class="citation">
        <h3>${escapeHTML(item.title)}</h3>
        <p>${formatAuthors(item.authors)} (${escapeHTML(item.year)}). ${escapeHTML(item.title)}.</p>
        ${makeKoreanBlock(item)}
        <div class="citation-meta">${escapeHTML(details)}</div>
        <div class="card-tags">${(item.themes || []).map((theme, tagIndex) => renderTag(theme, index + tagIndex)).join("")}</div>
      </div>
    </article>
  `;
};

const renderPresentationList = (items, search, theme) => {
  const normalized = search.trim().toLowerCase();
  const filtered = items.filter((item) => {
    const text = [
      item.title,
      item.koreanTitle,
      item.authors,
      item.venue,
      item.koreanVenue,
      item.details,
      item.location,
      item.type,
      ...(item.themes || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesSearch = !normalized || text.includes(normalized);
    const matchesTheme = theme === "All" || (item.themes || []).includes(theme);
    return matchesSearch && matchesTheme;
  });

  $("#presentation-list").innerHTML = filtered.map(renderPresentationItem).join("");
};

const renderExperiences = () => {
  $("#experience-list").innerHTML = siteData.experiences
    .map(
      (item, index) => `
        <article class="experience-item">
          <div class="experience-top">
            <span class="period">${escapeHTML(item.period)}</span>
            <h3>${escapeHTML(item.title)}</h3>
            <span class="organization">${escapeHTML(item.organization)} · ${escapeHTML(item.type)}</span>
          </div>
          <p>${escapeHTML(item.body)}</p>
          <div class="card-tags">${item.themes.map((theme, tagIndex) => renderTag(theme, index + tagIndex)).join("")}</div>
        </article>
      `,
    )
    .join("");
};

const renderEducation = () => {
  const educationList = $("#education-list");
  if (educationList) {
    educationList.innerHTML = siteData.education
      .map(
        (item) => `
          <div class="edu-entry">
            <p class="edu-degree">${escapeHTML(item.degree)}</p>
            <p>${escapeHTML(item.institution)} · ${escapeHTML(item.period)}</p>
            <p>${escapeHTML(item.detail)}</p>
          </div>
        `,
      )
      .join("");
  }

  $("#award-list").innerHTML = siteData.awards
    .map(
      (item) => `
        <div class="award-entry">
          <p class="edu-degree">${escapeHTML(item.title)}</p>
          <p>${escapeHTML(item.institution)} · ${escapeHTML(item.date)}</p>
        </div>
      `,
    )
    .join("");

  $("#credential-list").innerHTML = `<ul class="credential-list">${siteData.credentials
    .map((item) => `<li>${escapeHTML(item)}</li>`)
    .join("")}</ul>`;

  $("#skill-list").innerHTML = siteData.skills.map((item, index) => renderTag(item, index)).join("");
};

const setupFilters = () => {
  let publicationTheme = "All";
  let presentationTheme = "All";
  const publicationThemes = uniqueThemes(siteData.publications);
  const presentationThemes = uniqueThemes(siteData.presentations);
  const publicationFilterEl = $("#publication-filters");
  const presentationFilterEl = $("#presentation-filters");
  const publicationSearch = $("#publication-search");
  const presentationSearch = $("#presentation-search");

  const updatePublications = () => {
    renderFilterButtons(publicationFilterEl, publicationThemes, publicationTheme);
    renderPublicationList(siteData.publications, publicationSearch.value, publicationTheme);
  };

  const updatePresentations = () => {
    renderFilterButtons(presentationFilterEl, presentationThemes, presentationTheme);
    renderPresentationList(siteData.presentations, presentationSearch.value, presentationTheme);
  };

  publicationFilterEl.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-theme]");
    if (!button) return;
    publicationTheme = button.dataset.theme;
    updatePublications();
  });

  presentationFilterEl.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-theme]");
    if (!button) return;
    presentationTheme = button.dataset.theme;
    updatePresentations();
  });

  publicationSearch.addEventListener("input", () => renderPublicationList(siteData.publications, publicationSearch.value, publicationTheme));
  presentationSearch.addEventListener("input", () =>
    renderPresentationList(siteData.presentations, presentationSearch.value, presentationTheme),
  );

  updatePublications();
  updatePresentations();
};

const setupTheme = () => {
  const savedTheme = localStorage.getItem("yk-theme");
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;

  $("#theme-toggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("yk-theme", next);
  });
};

const setupHeader = () => {
  const header = $("[data-elevate]");
  const links = $$(".nav a");
  const sections = links.map((link) => $(link.getAttribute("href"))).filter(Boolean);

  const onScroll = () => {
    header.classList.toggle("is-elevated", window.scrollY > 12);
    const active = sections
      .slice()
      .reverse()
      .find((section) => section.getBoundingClientRect().top <= 120);
    links.forEach((link) => link.classList.toggle("is-active", active && link.getAttribute("href") === `#${active.id}`));
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
};

const setupCanvas = () => {
  const canvas = $("#hero-canvas");
  const ctx = canvas.getContext("2d");
  const labels = siteData.interests;
  const pointer = { x: -1000, y: -1000 };
  let nodes = [];
  let width = 0;
  let height = 0;
  let dpr = 1;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    nodes = labels.map((label, index) => {
      const angle = (index / labels.length) * Math.PI * 2;
      const radius = Math.min(width, height) * (0.22 + (index % 4) * 0.018);
      return {
        label,
        x: width * 0.62 + Math.cos(angle) * radius,
        y: height * 0.48 + Math.sin(angle) * radius,
        vx: Math.sin(index * 1.7) * 0.18,
        vy: Math.cos(index * 1.4) * 0.18,
        color: ["#176b5b", "#cf5a3d", "#315f9f", "#b8871f"][index % 4],
      };
    });
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    const dark = document.documentElement.dataset.theme === "dark";
    const lineColor = dark ? "rgba(143, 181, 232, 0.16)" : "rgba(49, 95, 159, 0.16)";
    const textColor = dark ? "rgba(245, 247, 243, 0.78)" : "rgba(21, 24, 22, 0.72)";
    const showLabels = width >= 760;
    const labelLimit = Math.min(260, height * 0.32);

    nodes.forEach((node, index) => {
      if (!prefersReduced) {
        const dx = pointer.x - node.x;
        const dy = pointer.y - node.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 160) {
          node.vx -= dx * 0.00003;
          node.vy -= dy * 0.00003;
        }
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.985;
        node.vy *= 0.985;
      }

      const minX = width * 0.08;
      const maxX = width * 0.92;
      const minY = height * 0.12;
      const maxY = height * 0.88;
      if (node.x < minX || node.x > maxX) node.vx *= -1;
      if (node.y < minY || node.y > maxY) node.vy *= -1;
      node.x = Math.max(minX, Math.min(maxX, node.x));
      node.y = Math.max(minY, Math.min(maxY, node.y));

      for (let j = index + 1; j < nodes.length; j += 1) {
        const other = nodes[j];
        const dist = Math.hypot(node.x - other.x, node.y - other.y);
        if (dist < 260) {
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = Math.max(0.3, 1 - dist / 260);
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }
    });

    nodes.forEach((node) => {
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 4.8, 0, Math.PI * 2);
      ctx.fill();

      if (showLabels && node.y < labelLimit) {
        ctx.font = "700 12px Inter, system-ui, sans-serif";
        ctx.fillStyle = textColor;
        ctx.fillText(node.label, node.x + 10, node.y - 8);
      }
    });

    requestAnimationFrame(draw);
  };

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  });
  window.addEventListener("pointerleave", () => {
    pointer.x = -1000;
    pointer.y = -1000;
  });

  resize();
  draw();
};

const init = () => {
  renderProfile();
  renderClusters();
  renderManuscripts();
  renderExperiences();
  renderEducation();
  setupFilters();
  setupTheme();
  setupHeader();
  setupCanvas();
};

document.addEventListener("DOMContentLoaded", init);
