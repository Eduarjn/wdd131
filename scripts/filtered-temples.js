const menuButton = document.querySelector("#menu-button");
const navMenu = document.querySelector("#primary-nav");

menuButton.addEventListener("click", () => {
  navMenu.classList.toggle("open");

  const isOpen = navMenu.classList.contains("open");
  menuButton.textContent = isOpen ? "✕" : "☰";
  menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  menuButton.setAttribute("aria-expanded", isOpen);
});

const temples = [
  {
    templeName: "Aba Nigeria",
    location: "Aba, Nigeria",
    dedicated: "2005, August, 7",
    area: 11500,
    imageUrl:
    "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/aba-nigeria/400x250/aba-nigeria-temple-lds-273999-wallpaper.jpg"
  },
  {
    templeName: "Manti Utah",
    location: "Manti, Utah, United States",
    dedicated: "1888, May, 21",
    area: 74792,
    imageUrl:
    "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/manti-utah/400x250/manti-temple-768192-wallpaper.jpg"
  },
  {
    templeName: "Payson Utah",
    location: "Payson, Utah, United States",
    dedicated: "2015, June, 7",
    area: 96630,
    imageUrl:
    "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/payson-utah/400x225/payson-utah-temple-exterior-1416671-wallpaper.jpg"
  },
  {
    templeName: "Yigo Guam",
    location: "Yigo, Guam",
    dedicated: "2020, May, 2",
    area: 6861,
    imageUrl:
    "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/yigo-guam/400x250/yigo_guam_temple_2.jpg"
  },
  {
    templeName: "Washington D.C.",
    location: "Kensington, Maryland, United States",
    dedicated: "1974, November, 19",
    area: 156558,
    imageUrl:
    "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/washington-dc/400x250/washington_dc_temple-exterior-2.jpeg"
  },
  {
    templeName: "Lima Perú",
    location: "Lima, Perú",
    dedicated: "1986, January, 10",
    area: 9600,
    imageUrl:
    "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/lima-peru/400x250/lima-peru-temple-evening-1075606-wallpaper.jpg"
  },
  {
    templeName: "Mexico City Mexico",
    location: "Mexico City, Mexico",
    dedicated: "1983, December, 2",
    area: 116642,
    imageUrl:
    "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/mexico-city-mexico/400x250/mexico-city-temple-exterior-1518361-wallpaper.jpg"
  },
  {
    templeName: "São Paulo Brazil",
    location: "São Paulo, Brazil",
    dedicated: "1978, October, 30",
    area: 59246,
    imageUrl: "images/sao-paulo-brazil.webp"
  },
  {
    templeName: "Campinas Brazil",
    location: "Campinas, Brazil",
    dedicated: "2002, May, 17",
    area: 47100,
    imageUrl: "images/campinas-brazil.webp"
  },
  {
    templeName: "Rome Italy",
    location: "Rome, Italy",
    dedicated: "2019, March, 10",
    area: 41010,
    imageUrl: "images/rome-italy.webp"
  }
];

const cardsContainer = document.querySelector("#temple-cards");
const filterStatus = document.querySelector("#filter-status");
const filterLinks = document.querySelectorAll("#primary-nav a");

function dedicationYear(temple) {
  return Number(temple.dedicated.split(",")[0]);
}

function createCard(temple) {
  return `
    <figure class="temple-card">
      <img src="${temple.imageUrl}" alt="${temple.templeName} Temple" loading="lazy">
      <figcaption>
        <h2>${temple.templeName}</h2>
        <p><span class="label">Location:</span> ${temple.location}</p>
        <p><span class="label">Dedicated:</span> ${temple.dedicated}</p>
        <p><span class="label">Size:</span> ${temple.area.toLocaleString("en-US")} sq ft</p>
      </figcaption>
    </figure>
  `;
}

function displayTemples(list) {
  cardsContainer.innerHTML = list.map(createCard).join("");
  filterStatus.textContent = `Showing ${list.length} of ${temples.length} temples.`;
}

function filterTemples(filter) {
  switch (filter) {
    case "old":
      return temples.filter((temple) => dedicationYear(temple) < 1900);
    case "new":
      return temples.filter((temple) => dedicationYear(temple) > 2000);
    case "large":
      return temples.filter((temple) => temple.area > 90000);
    case "small":
      return temples.filter((temple) => temple.area < 10000);
    default:
      return temples;
  }
}

filterLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();

    filterLinks.forEach((other) => {
      other.classList.remove("active");
      other.removeAttribute("aria-current");
    });

    link.classList.add("active");
    link.setAttribute("aria-current", "true");

    displayTemples(filterTemples(link.dataset.filter));

    navMenu.classList.remove("open");
    menuButton.textContent = "☰";
    menuButton.setAttribute("aria-label", "Open menu");
    menuButton.setAttribute("aria-expanded", false);
  });
});

displayTemples(temples);

const yearSpan = document.querySelector("#currentyear");
yearSpan.textContent = new Date().getFullYear();

const lastModified = document.querySelector("#lastModified");
lastModified.textContent = `Last Modification: ${document.lastModified}`;
