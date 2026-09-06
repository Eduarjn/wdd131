// WDD 131 - W02 - hamburger menu and footer dates

const menuButton = document.querySelector("#menu-button");
const navMenu = document.querySelector("#primary-nav");

menuButton.addEventListener("click", () => {
  navMenu.classList.toggle("open");

  const isOpen = navMenu.classList.contains("open");
  menuButton.textContent = isOpen ? "✕" : "☰";
  menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  menuButton.setAttribute("aria-expanded", isOpen);
});

const yearSpan = document.querySelector("#currentyear");
yearSpan.textContent = new Date().getFullYear();

const lastModified = document.querySelector("#lastModified");
lastModified.textContent = `Last Modification: ${document.lastModified}`;
