// WDD 131 - W05 - Review confirmation page
// Counts the reviews with localStorage and shows a summary of the submission.

const products = [
  { id: "fc-1888", name: "flux capacitor" },
  { id: "fc-2050", name: "power laces" },
  { id: "fs-1987", name: "time circuits" },
  { id: "ac-2000", name: "low voltage reactor" },
  { id: "jj-1969", name: "warp equalizer" }
];

// how many reviews have been completed on this browser
function updateCounter() {
  const stored = Number(localStorage.getItem("reviewCount")) || 0;
  const total = stored + 1;
  localStorage.setItem("reviewCount", total);
  document.querySelector("#reviewCount").textContent = total;
}

// the select stores the product id, so it is translated back to the name
function productName(id) {
  const found = products.find((product) => product.id === id);
  return found ? found.name : id;
}

// one row of the summary list
function addRow(list, term, value) {
  const dt = document.createElement("dt");
  const dd = document.createElement("dd");
  dt.textContent = term;
  // textContent, never innerHTML: the values come from the query string
  dd.textContent = value;
  list.appendChild(dt);
  list.appendChild(dd);
}

function buildSummary() {
  const params = new URLSearchParams(window.location.search);
  const list = document.querySelector("#summary");

  // nothing to show when the page is opened directly
  if (!params.has("productName")) {
    addRow(list, "Summary", "This page was opened without submitting the form.");
    return;
  }

  const rating = params.get("rating");
  const features = params.getAll("features");
  const written = params.get("review");
  const user = params.get("userName");

  addRow(list, "Product", productName(params.get("productName")));
  addRow(list, "Rating", `${rating} of 5 stars`);
  addRow(list, "Installed on", params.get("installDate"));
  addRow(list, "Useful features", features.length ? features.join(", ") : "None selected");

  if (written) {
    addRow(list, "Written review", written);
  }

  addRow(list, "Submitted by", user ? user : "Anonymous");
}

updateCounter();
buildSummary();
