// WDD 131 - W01 - dates for the footer

// current year for the copyright
const yearSpan = document.querySelector("#currentyear");
yearSpan.textContent = new Date().getFullYear();

// date when the file was last modified
const lastModified = document.querySelector("#lastModified");
lastModified.textContent = `Last Modification: ${document.lastModified}`;
