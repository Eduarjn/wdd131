// SIP Sizer - the quote confirmation.
// The form uses GET, so everything the user typed arrives in the query string.

const STORAGE_KEY = 'sipsizer-requests-built';

const summaryList = document.querySelector('#summary');
const intro = document.querySelector('#intro');

// Which query parameters become rows, and what to call them on screen.
const FIELDS = [
  { key: 'company', label: 'Company' },
  { key: 'contact', label: 'Contact' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'channels', label: 'Concurrent channels' },
  { key: 'preferredCodec', label: 'Preferred codec' },
  { key: 'startDate', label: 'Wanted by' },
  { key: 'currentSystem', label: 'Current system' },
  { key: 'notes', label: 'Notes' }
];

function countRequest() {
  try {
    const previous = Number(window.localStorage.getItem(STORAGE_KEY)) || 0;
    const total = previous + 1;
    window.localStorage.setItem(STORAGE_KEY, `${total}`);
    return total;
  } catch (error) {
    return 0;
  }
}

function addRow(label, value) {
  const term = document.createElement('dt');
  const detail = document.createElement('dd');

  term.textContent = `${label}`;
  // textContent, never innerHTML: these values came from the address bar
  detail.textContent = `${value}`;

  summaryList.appendChild(term);
  summaryList.appendChild(detail);
}

function buildSummary(params) {
  const present = FIELDS.filter((field) => {
    const value = params.get(field.key);
    return value !== null && value.trim() !== '';
  });

  present.forEach((field) => {
    addRow(field.label, params.get(field.key));
  });

  const features = params.getAll('features');

  if (features.length > 0) {
    addRow('Features', features.join(', '));
  } else {
    addRow('Features', 'None selected');
  }

  return present.length;
}

function describeVisit(fieldCount, total) {
  if (fieldCount === 0) {
    return `This page was opened without sending the form, so there is nothing to show. Start from the quote page.`;
  }

  if (total <= 1) {
    return `Here is your request, laid out the way an integrator would read it.`;
  }

  return `Here is your request, laid out the way an integrator would read it. That is ${total} requests you have built in this browser.`;
}

function render() {
  const params = new URLSearchParams(window.location.search);
  const hasSubmission = params.has('company') || params.has('channels');

  if (!hasSubmission) {
    intro.textContent = describeVisit(0, 0);
    addRow('Nothing submitted', 'Open the quote page and send the form to see a summary here.');
    return;
  }

  const total = countRequest();
  const fieldCount = buildSummary(params);
  intro.textContent = describeVisit(fieldCount, total);
}

render();
