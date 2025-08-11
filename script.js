// ===== Helpers =====
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

// ===== Exam date state =====
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
  if (!dateInput.value) return;
  examDate = fromISODateInput(dateInput.value);
  saveExamDate(examDate);
  targetEl.textContent = 'Mục tiêu: ' + ddmmyyyy(examDate);
});

// ===== Countdown =====
const dEl = $('#cd-days'), hEl = $('#cd-hours'), mEl = $('#cd-mins'), sEl = $('#cd-secs');

function tick() {
  const now = new Date();
  if (now > examDate) {
    examDate = new Date(examDate.getFullYear() + 1, examDate.getMonth(), examDate.getDate());
    saveExamDate(examDate);
    dateInput.value = toISODateInput(examDate);
    targetEl.textContent = 'Mục tiêu: ' + ddmmyyyy(examDate);
  }
  const diff = (examDate - now) / 1000;
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

// ===== Quotes (fallbacks) =====
const quoteText = $('#quoteText');
const quoteAuthor = $('#quoteAuthor');
const refreshBtn = $('#refreshQuote');
const QUOTE_KEY = 'thptqg_quote_cache_v2';

const OFFLINE_QUOTES = [
  { q: "Không có áp lực, không có kim cương.", a: "Thomas Carlyle" },
  { q: "Đừng đếm ngày, hãy làm cho ngày đáng đếm.", a: "Muhammad Ali" },
  { q: "Thành
