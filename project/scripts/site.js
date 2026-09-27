// SIP Sizer - shared behaviour for every page.

// The footer year is written once here instead of being typed into six files.
function setFooterYear() {
  const yearSpan = document.querySelector('#year');

  if (!yearSpan) {
    return;
  }

  yearSpan.textContent = `${new Date().getFullYear()}`;
}

setFooterYear();
