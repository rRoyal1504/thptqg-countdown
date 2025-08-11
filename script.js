// ===== Helpers =====
const $ = (sel) => document.querySelector(sel);

function toISODateInput(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function fromISODateInput(v) {
  // v: "yyyy-mm-dd"
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
  // 25/06 current year; if past -> next year
  const now = new Date();
  const d = new Date(now.getFullYear(), 5, 25); // June = 5
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

// ===== Countdown =====
const dEl = $('#cd-days'), hEl = $('#cd-hours'), mEl = $('#cd-mins'), sEl = $('#cd-secs');

function tick() {
  const now = new Date();
  // nếu đã qua ngày thi -> sang năm sau
  if (now > examDate) {
    examDate = new Date(examDate.getFullYear() + 1, examDate.getMonth(), examDate.getDate());
    saveExamDate(examDate);
    dateInput.value = toISODateInput(examDate);
    targetEl.textContent = 'Mục tiêu: ' + ddmmyyyy(examDate);
  }

  const diff = Math.max(0, (examDate - now) / 1000); // seconds, không âm
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

// ===== Quotes with fallbacks =====
const quoteText = $('#quoteText');
const quoteAuthor = $('#quoteAuthor');
const refreshBtn = $('#refreshQuote');
const QUOTE_KEY = 'thptqg_quote_cache_v2';

const OFFLINE_QUOTES = [
  { q: "Không có áp lực, không có kim cương.", a: "Thomas Carlyle" },
  { q: "Đừng đếm ngày, hãy làm cho ngày đáng đếm.", a: "Muhammad Ali" },
  { q: "Thành công là tổng của những nỗ lực nhỏ — lặp đi lặp lại mỗi ngày.", a: "Robert Collier" },
  { q: "Bạn không cần phải vĩ đại để bắt đầu, nhưng phải bắt đầu để trở nên vĩ đại.", a: "Zig Ziglar" },
  { q: "Kỷ luật tự giác là cây cầu nối giữa mục tiêu và thành tựu.", a: "Jim Rohn" },
  { q: "Đi chậm mà chắc còn hơn nhanh mà ngã.", a: "Tục ngữ" }
];

function renderQuote(q) {
  const text = q.q || q.quote || q.content || "";
  const author = q.a || q.author || "Unknown";
  quoteText.textContent = `“${text}”`;
  quoteAuthor.textContent = `— ${author}`;
}

async function fetchQuote(force = false) {
  const todayKey = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
  try {
    if (!force) {
      const cached = JSON.parse(localStorage.getItem(QUOTE_KEY) || 'null');
      if (cached && cached.date === todayKey && cached.data) {
        renderQuote(cached.data);
        return;
      }
    }

    // 1) ZenQuotes
    let data, ok = false;
    try {
      const res1 = await fetch('https://zenquotes.io/api/random', { cache: 'no-store' });
      if (res1.ok) {
        const arr = await res1.json();
        data = Array.isArray(arr) ? arr[0] : arr;
        ok = !!data;
      }
    } catch {}

    // 2) Quotable fallback
    if (!ok) {
      try {
        const res2 = await fetch('https://api.quotable.io/random', { cache: 'no-store' });
        if (res2.ok) {
          const q2 = await res2.json();
          data = { q: q2.content, a: q2.author };
          ok = true;
        }
      } catch {}
    }

    // 3) Offline fallback
    if (!ok) {
      data = OFFLINE_QUOTES[Math.floor(Math.random() * OFFLINE_QUOTES.length)];
    }

    localStorage.setItem(QUOTE_KEY, JSON.stringify({ date: todayKey, data }));
    renderQuote(data);
  } catch {
    const data = OFFLINE_QUOTES[Math.floor(Math.random() * OFFLINE_QUOTES.length)];
    renderQuote(data);
  }
}

refreshBtn.addEventListener('click', () => fetchQuote(true));
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
