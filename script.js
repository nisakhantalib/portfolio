const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const contactForm = document.querySelector("#contactForm");
const statusText = document.querySelector(".form-status");
const year = document.querySelector("#year");
const profilePhoto = document.querySelector("#profilePhoto");
const profileFallback = document.querySelector("#profileFallback");
const projectGrid = document.querySelector("#projectGrid");

year.textContent = new Date().getFullYear();

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

const configuredPhoto = profilePhoto.getAttribute("src");
const photoCandidates = [...new Set([configuredPhoto, "profile.jpg", "profile.jpeg", "profile.png", "profile.webp"].filter(Boolean))];
let photoIndex = 0;

function showProfilePhoto() {
  profilePhoto.hidden = false;
  profileFallback.hidden = true;
}

function tryProfilePhoto() {
  if (photoIndex >= photoCandidates.length) {
    profilePhoto.hidden = true;
    profileFallback.hidden = false;
    return;
  }

  const nextPhoto = photoCandidates[photoIndex];
  if (profilePhoto.getAttribute("src") === nextPhoto && profilePhoto.complete) {
    if (profilePhoto.naturalWidth > 0) {
      showProfilePhoto();
      return;
    }

    photoIndex += 1;
    tryProfilePhoto();
    return;
  }

  profilePhoto.src = nextPhoto;
}

profilePhoto.addEventListener("load", showProfilePhoto);
profilePhoto.addEventListener("error", () => {
  photoIndex += 1;
  tryProfilePhoto();
});
tryProfilePhoto();

projectGrid.innerHTML = window.projectOrder
  .map((slug) => {
    const project = window.portfolioProjects[slug];
    const tags = project.tags.map(([label, color]) => `<span class="tag ${color}">${label}</span>`).join("");
    const github = project.github
      ? `<a class="icon-button dark" href="${project.github}" target="_blank" rel="noreferrer">GitHub</a>`
      : "";
    const demo = project.demo
      ? `<a class="icon-button demo" href="${project.demo}" target="_blank" rel="noreferrer">Demo</a>`
      : "";

    return `
      <article class="project-card">
        <a class="project-card-main" href="project.html?id=${slug}" aria-label="Read more about ${project.title}">
          ${project.screenshot
            ? `<img class="project-shot" src="${project.screenshot}" alt="Screenshot of ${project.title}" loading="lazy" />`
            : window.renderProjectArt(project)}
          <h3>${project.title}</h3>
          <p class="project-type">${project.type}</p>
          <div class="tags" aria-label="Technologies used">${tags}</div>
          <p class="project-summary">${project.summary}</p>
          <span class="learn-more">View Details</span>
        </a>
        <div class="project-actions">${github}${demo}</div>
      </article>
    `;
  })
  .join("");

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const name = data.get("name").trim();
  const email = data.get("email").trim();
  const message = data.get("message").trim();
  const subject = encodeURIComponent(`Portfolio message from ${name}`);
  const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nEmail: ${email}`);

  statusText.textContent = "Opening your email app...";
  window.location.href = `mailto:nisakhan6873@gmail.com?subject=${subject}&body=${body}`;
  contactForm.reset();

  setTimeout(() => {
    statusText.textContent = "Message prepared for nisakhan6873@gmail.com.";
  }, 800);
});
