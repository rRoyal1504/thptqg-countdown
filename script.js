const $ = (sel) => document.querySelector(sel);

function toISODateInput(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function fromISODateInput(v) {
  const [y, m, d] = v.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function ddmmyyyy(d) {
  const day = String(d.getDate()).padStart(2, '0');
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${m}/${d.getFullYear()}`;
}

const DATE_KEY = 'thptqg_exam_date_iso';
const dateInput = $('#examDate');
const saveBtn   = $('#saveDate');
const targetEl  = $('#targetText');

function defaultExamDate() {
  const now = new Date();
  const d = new Date(now.getFullYear(), 5, 25); // 25/06
  if (now > d) d.setFullYear(d.getFullYear() + 1);
  return d;
}
function loadExamDate() {
  const iso = localStorage.getItem(DATE_KEY);
  return iso ? fromISODateInput(iso) : defaultExamDate();
}
function saveExamDate(d) {
  localStorage.setItem(DATE_KEY, toISODateInput(d));
}

let examDate = loadExamDate();
dateInput.value = toISODateInput(examDate);
targetEl.textContent = 'Mục tiêu: ' + ddmmyyyy(examDate);

saveBtn.addEventListener('click', () => {
  const v = dateInput.value;
  if (!v) return;
  examDate = fromISODateInput(v);
  saveExamDate(examDate);
  targetEl.textContent = 'Mục tiêu: ' + ddmmyyyy(examDate);
});

const dEl = $('#cd-days'), hEl = $('#cd-hours'), mEl = $('#cd-mins'), sEl = $('#cd-secs');

function tick() {
  const now = new Date();
  if (now > examDate) {
    examDate = new Date(examDate.getFullYear() + 1, examDate.getMonth(), examDate.getDate());
    saveExamDate(examDate);
    dateInput.value = toISODateInput(examDate);
    targetEl.textContent = 'Mục tiêu: ' + ddmmyyyy(examDate);
  }
  const diff = Math.max(0, (examDate - now) / 1000);
  const days  = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const mins  = Math.floor((diff % 3600) / 60);
  const secs  = Math.floor(diff % 60);

  dEl.textContent = days.toString();
  hEl.textContent = hours.toString().padStart(2, '0');
  mEl.textContent = mins.toString().padStart(2, '0');
  sEl.textContent = secs.toString().padStart(2, '0');
}
tick();
setInterval(tick, 1000);

const quoteText = $('#quoteText');
const quoteAuthor = $('#quoteAuthor');
const refreshBtn = $('#refreshQuote');
const QUOTE_KEY = 'thptqg_quote_cache_v2';

function renderQuote(q) {
  const text = q.q || q.quote || "";
  const author = q.a || q.author || "Unknown";
  quoteText.textContent = `“${text}”`;
  quoteAuthor.textContent = `— ${author}`;
}

async function fetchQuote(force = false) {
  const todayKey = new Date().toISOString().slice(0, 10);
  try {
    if (!force) {
      const cached = JSON.parse(localStorage.getItem(QUOTE_KEY) || 'null');
      if (cached && cached.date === todayKey && cached.data) {
        renderQuote(cached.data);
        return;
      }
    }

    const res = await fetch('https://zenquotes.io/api/random', { cache: 'no-store' });
    const data = await res.json();
    const q = Array.isArray(data) ? data[0] : data;

    localStorage.setItem(QUOTE_KEY, JSON.stringify({ date: todayKey, data: q }));
    renderQuote(q);
  } catch {
    quoteText.textContent = 'Không tải được quote. Thử lại sau.';
    quoteAuthor.textContent = '';
  }
}
refreshBtn.addEventListener('click', () => fetchQuote(true));
fetchQuote();

const CALLOUT_KEY = 'hocba_callout_closed_v1';
const callout = document.getElementById('hocbaCallout');
const closeCalloutBtn = document.getElementById('closeCallout');

(function initCallout() {
  try {
    const closed = localStorage.getItem(CALLOUT_KEY) === '1';
    if (closed && callout) callout.classList.add('hidden');
  } catch {}
})();

if (closeCalloutBtn && callout) {
  closeCalloutBtn.addEventListener('click', () => {
    try { localStorage.setItem(CALLOUT_KEY, '1'); } catch {}
    callout.classList.add('hidden');
  });
}
