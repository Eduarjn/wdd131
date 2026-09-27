// SIP Sizer - the trunk calculator.
//
// Sizing a trunk is the Erlang B question: given this much offered traffic,
// how many channels keep the chance of a blocked call under the target?

const STORAGE_KEY = 'sipsizer-saved-sizings';
const MAX_SAVED = 8;

const form = document.querySelector('#trunk-form');
const resultGrid = document.querySelector('#result-grid');
const resultHint = document.querySelector('#result-hint');
const verdict = document.querySelector('#out-verdict');
const savedList = document.querySelector('#saved-list');
const clearButton = document.querySelector('#clear-saved');
const saveButton = document.querySelector('#save-result');

// The last calculation, so the save button has something to store.
let lastSizing = null;

// Erlang B, in the recursive form that avoids overflowing on factorials.
// B(0) is 1: with no channels every call is blocked.
function erlangBlocking(channels, traffic) {
  let blocking = 1;

  for (let n = 1; n <= channels; n += 1) {
    blocking = (traffic * blocking) / (n + traffic * blocking);
  }

  return blocking;
}

// Walk up one channel at a time until the blocking target is met.
function channelsNeeded(traffic, targetBlocking) {
  let channels = 1;

  while (erlangBlocking(channels, traffic) > targetBlocking && channels < 5000) {
    channels += 1;
  }

  return channels;
}

// Calls per hour multiplied by their length, expressed in hours of talking.
function offeredTraffic(callsPerHour, minutesPerCall) {
  return (callsPerHour * minutesPerCall) / 60;
}

function readForm() {
  return {
    agents: Number(document.querySelector('#agents').value),
    callsPerHour: Number(document.querySelector('#calls').value),
    minutesPerCall: Number(document.querySelector('#duration').value),
    targetBlocking: Number(document.querySelector('#grade').value),
    codecId: document.querySelector('#codec').value
  };
}

// Returns an empty array when everything is usable, otherwise the problems.
function findInputProblems(input) {
  const problems = [];

  if (!Number.isFinite(input.agents) || input.agents < 1) {
    problems.push('the number of people must be at least 1');
  }

  if (!Number.isFinite(input.callsPerHour) || input.callsPerHour < 1) {
    problems.push('calls per hour must be at least 1');
  }

  if (!Number.isFinite(input.minutesPerCall) || input.minutesPerCall <= 0) {
    problems.push('the average call must be longer than zero minutes');
  }

  return problems;
}

function sizeTrunk(input) {
  const traffic = offeredTraffic(input.callsPerHour, input.minutesPerCall);
  const channels = channelsNeeded(traffic, input.targetBlocking);
  const codec = findCodec(input.codecId);
  const perCall = bandwidthPerCallKbps(codec);

  return {
    input,
    codec,
    traffic,
    channels,
    actualBlocking: erlangBlocking(channels, traffic),
    // a call is two streams, one in each direction
    bandwidthKbps: perCall * channels * 2,
    utilisation: traffic / channels
  };
}

function formatBandwidth(kbps) {
  if (kbps >= 1000) {
    return `${(kbps / 1000).toFixed(2)} Mbps`;
  }

  return `${Math.round(kbps)} kbps`;
}

// A short sentence that tells the user what the number actually means.
function buildVerdict(sizing) {
  const perPerson = sizing.channels / sizing.input.agents;

  if (perPerson >= 1) {
    return `That is one channel per person or more. Traffic this heavy usually means a contact centre rather than an office, so check that the busy hour figures are right.`;
  }

  if (perPerson >= 0.5) {
    return `Roughly one channel for every two people, which is normal for a sales or support team that lives on the phone.`;
  }

  if (perPerson >= 0.25) {
    return `About one channel for every four people, the usual shape of a busy office.`;
  }

  return `Fewer than one channel per four people. Light phone use, so the trunk cost will be a small part of the bill.`;
}

function showResult(sizing) {
  document.querySelector('#out-channels').textContent = `${sizing.channels}`;
  document.querySelector('#out-traffic').textContent = `${sizing.traffic.toFixed(1)} erlangs`;
  document.querySelector('#out-blocking').textContent =
    `${(sizing.actualBlocking * 100).toFixed(2)}% of calls blocked`;
  document.querySelector('#out-bandwidth').textContent =
    `${formatBandwidth(sizing.bandwidthKbps)} on ${sizing.codec.name}`;
  document.querySelector('#out-utilisation').textContent =
    `${Math.round(sizing.utilisation * 100)}% of the trunk in use`;

  verdict.textContent = buildVerdict(sizing);

  resultHint.hidden = true;
  resultGrid.hidden = false;
  verdict.hidden = false;
}

function showProblems(problems) {
  resultGrid.hidden = true;
  verdict.hidden = true;
  resultHint.hidden = false;
  resultHint.textContent = `Check the form: ${problems.join(', ')}.`;
}

function readSaved() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    // private browsing and blocked storage both land here
    return [];
  }
}

function writeSaved(sizings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sizings));
  } catch (error) {
    resultHint.textContent = `This browser will not let the page save anything, so the sizing was not kept.`;
    resultHint.hidden = false;
  }
}

function renderSaved() {
  const sizings = readSaved();

  savedList.textContent = '';

  if (sizings.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'saved-empty';
    empty.textContent = `Nothing saved yet. Calculate a sizing and press save to keep it here.`;
    savedList.appendChild(empty);
    clearButton.hidden = true;
    return;
  }

  sizings.forEach((sizing) => {
    const item = document.createElement('li');
    item.className = 'saved-item';

    const headline = document.createElement('p');
    headline.className = 'saved-headline';
    headline.textContent = `${sizing.channels} channels for ${sizing.agents} people`;

    const detail = document.createElement('p');
    detail.className = 'saved-detail';
    detail.textContent =
      `${sizing.callsPerHour} calls/hour at ${sizing.minutesPerCall} min each, ${sizing.codecName}, ${sizing.bandwidth}`;

    item.appendChild(headline);
    item.appendChild(detail);
    savedList.appendChild(item);
  });

  clearButton.hidden = false;
}

function saveLastSizing() {
  if (!lastSizing) {
    resultHint.hidden = false;
    resultHint.textContent = `Calculate a sizing first, then save it.`;
    return;
  }

  const sizings = readSaved();

  sizings.unshift({
    channels: lastSizing.channels,
    agents: lastSizing.input.agents,
    callsPerHour: lastSizing.input.callsPerHour,
    minutesPerCall: lastSizing.input.minutesPerCall,
    codecName: lastSizing.codec.name,
    bandwidth: formatBandwidth(lastSizing.bandwidthKbps)
  });

  writeSaved(sizings.slice(0, MAX_SAVED));
  renderSaved();
}

function clearSaved() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // nothing to do: if it cannot be removed it was never stored
  }

  renderSaved();
}

function handleSubmit(event) {
  event.preventDefault();

  const input = readForm();
  const problems = findInputProblems(input);

  if (problems.length > 0) {
    showProblems(problems);
    return;
  }

  lastSizing = sizeTrunk(input);
  showResult(lastSizing);
}

form.addEventListener('submit', handleSubmit);
saveButton.addEventListener('click', saveLastSizing);
clearButton.addEventListener('click', clearSaved);

renderSaved();
