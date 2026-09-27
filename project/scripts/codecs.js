// SIP Sizer - the codec comparison table.
// The table and the cards are both built from the CODECS array, so the page
// and the calculator can never disagree about what a codec costs.

const STORAGE_KEY = 'sipsizer-codec-view';

const concurrentInput = document.querySelector('#concurrent');
const sortSelect = document.querySelector('#sort');
const freeOnlyCheckbox = document.querySelector('#free-only');
const rowsBody = document.querySelector('#codec-rows');
const caption = document.querySelector('#table-caption');
const summary = document.querySelector('#summary');
const cardsHolder = document.querySelector('#codec-cards');

function formatBandwidth(kbps) {
  if (kbps >= 1000) {
    return `${(kbps / 1000).toFixed(2)} Mbps`;
  }

  return `${Math.round(kbps)} kbps`;
}

function readView() {
  return {
    concurrent: Math.max(1, Number(concurrentInput.value) || 1),
    sortBy: sortSelect.value,
    freeOnly: freeOnlyCheckbox.checked
  };
}

// Sorting returns a new array so the original CODECS order is never disturbed.
function sortCodecs(list, sortBy) {
  const copy = [...list];

  if (sortBy === 'quality') {
    return copy.sort((a, b) => b.mos - a.mos);
  }

  if (sortBy === 'name') {
    return copy.sort((a, b) => a.name.localeCompare(b.name));
  }

  return copy.sort((a, b) => bandwidthPerCallKbps(a) - bandwidthPerCallKbps(b));
}

function selectCodecs(view) {
  const filtered = view.freeOnly
    ? CODECS.filter((codec) => codec.royaltyFree)
    : CODECS;

  return sortCodecs(filtered, view.sortBy);
}

function addCell(row, text, isHeader) {
  const cell = document.createElement(isHeader ? 'th' : 'td');

  if (isHeader) {
    cell.scope = 'row';
  }

  cell.textContent = text;
  row.appendChild(cell);
  return cell;
}

function buildRows(codecs, view) {
  rowsBody.textContent = '';

  codecs.forEach((codec) => {
    const perCall = bandwidthPerCallKbps(codec);
    const trunk = perCall * view.concurrent * 2;
    const row = document.createElement('tr');

    addCell(row, `${codec.name}`, true);
    addCell(row, `${Math.round(perCall)} kbps`, false).className = 'numeric';
    addCell(row, formatBandwidth(trunk), false).className = 'numeric';
    addCell(row, `${codec.mos.toFixed(1)}`, false).className = 'numeric';
    addCell(row, codec.royaltyFree ? `Royalty free` : `Licensed`, false);

    rowsBody.appendChild(row);
  });
}

function buildSummary(codecs, view) {
  if (codecs.length === 0) {
    return `No codec matches that filter.`;
  }

  const costs = codecs.map((codec) => bandwidthPerCallKbps(codec) * view.concurrent * 2);
  const cheapest = Math.min(...costs);
  const dearest = Math.max(...costs);
  const saving = dearest - cheapest;

  if (codecs.length === 1) {
    return `One codec shown, using ${formatBandwidth(cheapest)} for ${view.concurrent} calls.`;
  }

  return `Across these ${codecs.length} codecs, ${view.concurrent} concurrent calls cost between ${formatBandwidth(cheapest)} and ${formatBandwidth(dearest)}. Choosing the leanest saves ${formatBandwidth(saving)} against the heaviest.`;
}

function buildCards(codecs) {
  cardsHolder.textContent = '';

  codecs.forEach((codec) => {
    const card = document.createElement('article');
    card.className = 'card';

    const heading = document.createElement('h3');
    heading.textContent = `${codec.name}`;

    const standard = document.createElement('p');
    standard.className = 'card-meta';
    standard.textContent = `${codec.standard} · ${Math.round(bandwidthPerCallKbps(codec))} kbps per call`;

    const best = document.createElement('p');
    best.textContent = `${codec.bestFor}`;

    const watch = document.createElement('p');
    watch.className = 'card-watch';
    watch.textContent = `Watch out: ${codec.watchOut}`;

    card.appendChild(heading);
    card.appendChild(standard);
    card.appendChild(best);
    card.appendChild(watch);
    cardsHolder.appendChild(card);
  });
}

function rememberView(view) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(view));
  } catch (error) {
    // storage blocked: the page still works, it just forgets
  }
}

function restoreView() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return;
    }

    const saved = JSON.parse(raw);

    if (saved.concurrent) {
      concurrentInput.value = `${saved.concurrent}`;
    }

    if (saved.sortBy) {
      sortSelect.value = saved.sortBy;
    }

    freeOnlyCheckbox.checked = Boolean(saved.freeOnly);
  } catch (error) {
    // a corrupt entry just means the defaults are used
  }
}

function render() {
  const view = readView();
  const codecs = selectCodecs(view);

  buildRows(codecs, view);
  buildCards(codecs);

  caption.textContent = `Bandwidth for ${view.concurrent} concurrent calls`;
  summary.textContent = buildSummary(codecs, view);

  rememberView(view);
}

concurrentInput.addEventListener('input', render);
sortSelect.addEventListener('change', render);
freeOnlyCheckbox.addEventListener('change', render);

restoreView();
render();
