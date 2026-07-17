const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const detail = document.querySelector("#projectDetail");

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  root.dataset.theme = "dark";
  themeToggle.setAttribute("aria-label", "Switch to light theme");
}

themeToggle.addEventListener("click", () => {
  const isDark = root.dataset.theme === "dark";
  root.dataset.theme = isDark ? "" : "dark";
  localStorage.setItem("theme", isDark ? "light" : "dark");
  themeToggle.setAttribute("aria-label", isDark ? "Switch to dark theme" : "Switch to light theme");
});

const params = new URLSearchParams(window.location.search);
const projectId = params.get("id") || "paws";
const project = window.portfolioProjects[projectId];

function renderList(items) {
  return items.map(([label, text]) => `<li><strong>${label}</strong> - ${text}</li>`).join("");
}

function renderLinks(projectData) {
  const links = [];

  if (projectData.github) {
    links.push(`<li><strong>GitHub:</strong> <a href="${projectData.github}" target="_blank" rel="noreferrer">GitHub link</a></li>`);
  }

  if (projectData.demo) {
    links.push(`<li><strong>Live Demo:</strong> <a href="${projectData.demo}" target="_blank" rel="noreferrer">Live demo</a></li>`);
  }

  return links.length ? links.join("") : "<li>Demo or repository link is not publicly available.</li>";
}

if (!project) {
  detail.innerHTML = `
    <h1>Project not found</h1>
    <p class="detail-lead">The project you are looking for does not exist.</p>
  `;
} else {
  document.title = `${project.title} | Khairunnisa Khan`;
  detail.innerHTML = `
    ${project.screenshot
      ? `<img class="project-shot detail-shot" src="${project.screenshot}" alt="Screenshot of ${project.title}" loading="lazy" />`
      : window.renderProjectArt(project).replace("project-art", "project-art detail-art")}
    <h1>${project.title}</h1>
    <p class="detail-meta">${project.owner} / ${project.date}</p>

    <section class="detail-section">
      <h2>${project.introTitle}</h2>
      <p class="detail-lead">${project.overview}</p>
    </section>

    <section class="detail-section">
      <h2>Key Features</h2>
      <ul>${renderList(project.features)}</ul>
    </section>

    <section class="detail-section">
      <h2>Tech Stack</h2>
      <ul>${renderList(project.stack)}</ul>
    </section>

    ${project.howItWorks ? `
    <section class="detail-section how-it-works">
      <h2>How it works</h2>
      <p class="detail-lead">${project.howItWorks.intro}</p>
      ${project.howItWorks.diagram}
      <ol class="how-steps">${project.howItWorks.steps.map((s) => `<li><strong>${s[0]}</strong> - ${s[1]}</li>`).join("")}</ol>
      ${project.howItWorks.explainerUrl ? `<p><a class="cert-link" href="${project.howItWorks.explainerUrl}" target="_blank" rel="noreferrer">Read the full technical walkthrough &rarr;</a></p>` : ""}
    </section>
    ` : ""}

    <section class="detail-section">
      <h2>GitHub & Live Demo</h2>
      <ul>${renderLinks(project)}</ul>
    </section>
  `;
}
