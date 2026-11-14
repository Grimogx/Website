const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const yearLabel = document.querySelector("#current-year");
const currentPage = document.body.dataset.page;

if (yearLabel) yearLabel.textContent = new Date().getFullYear();

document.querySelector(`[data-page-link="${currentPage}"]`)?.setAttribute("aria-current", "page");

function closeMenu() {
  if (!menuToggle || !siteNav) return;
  menuToggle.setAttribute("aria-expanded", "false");
  siteNav.classList.remove("is-open");
  menuToggle.querySelector(".menu-toggle-label").textContent = "Menu";
}

menuToggle?.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  siteNav?.classList.toggle("is-open", !isExpanded);
  menuToggle.querySelector(".menu-toggle-label").textContent = isExpanded ? "Menu" : "Close";
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

document.addEventListener("click", (event) => {
  if (
    menuToggle?.getAttribute("aria-expanded") === "true" &&
    !siteNav?.contains(event.target) &&
    !menuToggle.contains(event.target)
  ) closeMenu();
});
