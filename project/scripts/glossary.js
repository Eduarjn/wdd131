// SIP Sizer - glossary search.
// The terms live in the HTML so the page is useful without JavaScript. This
// file only narrows what is on screen.

const STORAGE_KEY = 'sipsizer-glossary-topic';

const searchInput = document.querySelector('#search');
const topicSelect = document.querySelector('#topic');
const countLine = document.querySelector('#count');
const emptyState = document.querySelector('#empty');

// A real array, so the array methods below work on it.
const entries = Array.from(document.querySelectorAll('.entry')).map((element) => ({
  element,
  topic: element.dataset.topic,
  text: element.textContent.toLowerCase()
}));

function matchesEntry(entry, term, topic) {
  const topicMatches = topic === 'all' || entry.topic === topic;
  const termMatches = term === '' || entry.text.includes(term);

  return topicMatches && termMatches;
}

function describeCount(shown, total, term) {
  if (shown === total) {
    return `Showing all ${total} terms.`;
  }

  if (shown === 0) {
    return `No match for "${term}".`;
  }

  if (shown === 1) {
    return `Showing 1 term of ${total}.`;
  }

  return `Showing ${shown} terms of ${total}.`;
}

function rememberTopic(topic) {
  try {
    window.localStorage.setItem(STORAGE_KEY, topic);
  } catch (error) {
    // storage blocked: the filter simply resets on the next visit
  }
}

function restoreTopic() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      topicSelect.value = saved;
    }
  } catch (error) {
    // fall back to the default option
  }
}

function applyFilter() {
  const term = searchInput.value.trim().toLowerCase();
  const topic = topicSelect.value;

  const visible = entries.filter((entry) => {
    const keep = matchesEntry(entry, term, topic);
    entry.element.hidden = !keep;
    return keep;
  });

  countLine.textContent = describeCount(visible.length, entries.length, term);
  emptyState.hidden = visible.length > 0;

  rememberTopic(topic);
}

searchInput.addEventListener('input', applyFilter);
topicSelect.addEventListener('change', applyFilter);

restoreTopic();
applyFilter();
