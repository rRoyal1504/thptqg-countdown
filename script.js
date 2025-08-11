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

// ===== Exam date state =====
const DATE_KEY = 'thptqg_exam_date_iso';
const dateInput = $('#examDate');
const saveBtn   = $('#saveDate');
// targetEl có thể KHÔNG tồn tại nếu bạn xoá phần "Mục tiêu"
const targetEl  = $('#targetText');

function defaultExamDate() {
  // 25/06 năm hiện tại; nếu đã qua -> sang năm sau
  const now = new Date();
  const d = new Date(now.getFullYear(), 5, 25);
  if (now > d) d.setFullYear(d.getFullYear() + 1);
  return d;
}
function loadExamDate() {
  const iso = localStorage.getItem(DATE_KEY);
  return iso ? fromISODateInput(iso) : defaultExamDate();
}
function saveExamDate(d) {
  try { localStorage.setItem(DATE_KEY, toISODateInput(d)); } catch {}
}

let examDate = loadExamDate();

// Nếu còn input thì set value; nếu không có thì vẫn chạy countdown bình thường
if (dateInput) dateInput.value = toISODateInput(examDate);
// Nếu còn "Mục tiêu" thì cập nhật, còn không thì bỏ qua
if (targetEl) targetEl.textContent = 'Mục tiêu: ' + toISODateInput(examDate).split('-').reverse().join('/');

// Lắng nghe nút Lưu nếu có
if (saveBtn && dateInput) {
  saveBtn.addEventListener('click', () => {
    const v = dateInput.value;
    if (!v) return;
    examDate = fromISODateInput(v);
    saveExamDate(examDate);
    if (targetEl) {
      const [y, m, d] = v.split('-');
      targetEl.textContent = `Mục tiêu: ${d}/${m}/${y}`;
    }
  });
}

// ===== Countdown =====
const dEl = $('#cd-days'), hEl = $('#cd-hours'), mEl = $('#cd-mins'), sEl = $('#cd-secs');

function tick() {
  const now = new Date();

  // nếu đã qua ngày thi -> sang năm sau
  if (now > examDate) {
    examDate = new Date(examDate.getFullYear() + 1, examDate.getMonth(), examDate.getDate());
    saveExamDate(examDate);
    if (dateInput) dateInput.value = toISODateInput(examDate);
    if (targetEl) {
      const v = toISODateInput(examDate).split('-').reverse().join('/');
      targetEl.textContent = 'Mục tiêu: ' + v;
    }
  }

  const diff = Math.max(0, (examDate - now) / 1000); // không để âm
  if (!dEl || !hEl || !mEl || !sEl) return; // thiếu phần tử thì bỏ qua

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

// ===== Quotes (ZenQuotes + cache theo ngày) =====
const quoteText = $('#quoteText');
const quoteAuthor = $('#quoteAuthor');
const refreshBtn = $('#refreshQuote');
const QUOTE_KEY = 'thptqg_quote_cache_v2';

function renderQuote(q) {
  if (!quoteText || !quoteAuthor) return;
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
    try { localStorage.setItem(QUOTE_KEY, JSON.stringify({ date: todayKey, data: q })); } catch {}
    renderQuote(q);
  } catch {
    if (quoteText && quoteAuthor) {
      quoteText.textContent = 'Không tải được quote. Thử lại sau.';
      quoteAuthor.textContent = '';
    }
  }
}
if (refreshBtn) refreshBtn.addEventListener('click', () => fetchQuote(true));
fetchQuote();

// ===== Callout close & remember =====
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
