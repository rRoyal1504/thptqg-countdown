const DEFAULT_MONTH = 6;   // 6 = June
const DEFAULT_DAY   = 25;  // 25/06 hằng năm
const LS_KEY_DATE   = 'thptqg_exam_date';
const LS_QUOTE      = 'thptqg_quote';
const LS_QUOTE_AT   = 'thptqg_quote_at';

const $ = (sel) => document.querySelector(sel);

function formatYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,'0');
  const d = String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}
function parseYMD(ymd) {
  const [y,m,d] = ymd.split('-').map(n=>parseInt(n,10));
  if(!y || !m || !d) return null;
  return new Date(y, m-1, d, 0, 0, 0);
}
function daysDiff(ms) {
  const sec = Math.floor(ms/1000);
  const d = Math.floor(sec/86400);
  const h = Math.floor((sec%86400)/3600);
  const m = Math.floor((sec%3600)/60);
  const s = sec % 60;
  return { d, h, m, s };
}

function getDefaultExamDate() {
  const now = new Date();
  const currentY = now.getFullYear();
  let target = new Date(currentY, DEFAULT_MONTH - 1, DEFAULT_DAY, 0, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target = new Date(currentY + 1, DEFAULT_MONTH - 1, DEFAULT_DAY, 0, 0, 0);
  }
  return target;
}

function loadExamDate() {
  const raw = localStorage.getItem(LS_KEY_DATE);
  if (!raw) return getDefaultExamDate();
  const d = parseYMD(raw);
  if (!d) return getDefaultExamDate();

  const now = new Date();
  if (d.getTime() <= now.getTime()) {
    return new Date(now.getFullYear() + 1, d.getMonth(), d.getDate(), 0,0,0);
  }
  return d;
}

function saveExamDate(date) {
  localStorage.setItem(LS_KEY_DATE, formatYMD(date));
}

const $date   = $('#examDate');
const $save   = $('#saveDate');
const $days   = $('#cd-days');
const $hours  = $('#cd-hours');
const $mins   = $('#cd-mins');
const $secs   = $('#cd-secs');
const $target = $('#targetText');
const $quote  = $('#quoteText');
const $author = $('#quoteAuthor');
const $refresh= $('#refreshQuote');

let examDate = loadExamDate();
$date.value  = formatYMD(examDate);
$target.textContent = 'Mục tiêu: ' + examDate.toLocaleDateString('vi-VN');

$save.addEventListener('click', () => {
  const d = parseYMD($date.value);
  if (!d) return;
  examDate = d;
  saveExamDate(examDate);
  $target.textContent = 'Mục tiêu: ' + examDate.toLocaleDateString('vi-VN');
});

function tick() {
  const now = new Date();
  if (examDate.getTime() <= now.getTime()) {
    examDate = new Date(now.getFullYear()+1, examDate.getMonth(), examDate.getDate(), 0,0,0);
    saveExamDate(examDate);
    $date.value = formatYMD(examDate);
    $target.textContent = 'Mục tiêu: ' + examDate.toLocaleDateString('vi-VN');
  }

  const diff = examDate.getTime() - now.getTime();
  const { d,h,m,s } = daysDiff(diff);
  $days.textContent  = d.toString();
  $hours.textContent = h.toString().padStart(2,'0');
  $mins.textContent  = m.toString().padStart(2,'0');
  $secs.textContent  = s.toString().padStart(2,'0');
}
tick();
setInterval(tick, 1000);

async function fetchQuote() {
  try {
    const todayKey = new Date().toISOString().slice(0,10);
    const cachedAt = localStorage.getItem(LS_QUOTE_AT);
    const cached   = localStorage.getItem(LS_QUOTE);

    if (cached && cachedAt === todayKey) {
      const q = JSON.parse(cached);
      renderQuote(q);
      return;
    }

    const res = await fetch('https://zenquotes.io/api/random', { cache:'no-store' });
    const data = await res.json();
    const q = (Array.isArray(data) && data[0]) ? { text: data[0].q, author: data[0].a } : null;

    if (q && q.text) {
      localStorage.setItem(LS_QUOTE, JSON.stringify(q));
      localStorage.setItem(LS_QUOTE_AT, todayKey);
      renderQuote(q);
    } else {
      renderQuote({ text: 'Học, học nữa, học mãi.', author: 'V.I. Lenin' });
    }
  } catch {
    renderQuote({ text: 'Không có áp lực, không có kim cương.', author: 'Thomas Carlyle' });
  }
}

function renderQuote(q) {
  $quote.textContent = `“${q.text}”`;
  $author.textContent = q.author ? `— ${q.author}` : '';
}

$refresh.addEventListener('click', () => {
  localStorage.removeItem(LS_QUOTE);
  localStorage.removeItem(LS_QUOTE_AT);
  $quote.textContent  = 'Loading quote…';
  $author.textContent = '';
  fetchQuote();
});
fetchQuote();
