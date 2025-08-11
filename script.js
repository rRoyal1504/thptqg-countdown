// ===== PARTICLES =====
(function createParticles(){
  const el = document.getElementById('particles');
  if(!el) return;
  const n = 30;
  for(let i=0;i<n;i++){
    const p = document.createElement('div');
    p.className = 'p';
    p.style.left = Math.random()*100 + '%';
    p.style.animationDelay = (Math.random()*12) + 's';
    p.style.opacity = (0.25 + Math.random()*0.6).toFixed(2);
    el.appendChild(p);
  }
})();

// ===== COUNTDOWN LOGIC =====
const DEFAULT_DAY = 25;   // 25/06 hằng năm
const DEFAULT_MONTH = 6;  // June (1-12)
const elDays  = document.getElementById('cd-days');
const elHours = document.getElementById('cd-hours');
const elMins  = document.getElementById('cd-mins');
const elSecs  = document.getElementById('cd-secs');
const elInput = document.getElementById('examDate');
const elSave  = document.getElementById('saveDate');
const elReset = document.getElementById('resetDate');
const elTarget= document.getElementById('targetText');

function pad(n){ return n.toString().padStart(2,'0'); }
function toISO(y,m,d){ return `${y}-${pad(m)}-${pad(d)}`; }
function formatVN(d){ return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`; }

function getDefaultTarget(){
  const now = new Date();
  let y = now.getFullYear();
  let t = new Date(`${toISO(y, DEFAULT_MONTH, DEFAULT_DAY)}T00:00:00`);
  if (t < now) { y += 1; t = new Date(`${toISO(y, DEFAULT_MONTH, DEFAULT_DAY)}T00:00:00`); }
  return t;
}

function readStoredTarget(){
  const iso = localStorage.getItem('examDateISO');
  if (!iso) return null;
  const t = new Date(iso + 'T00:00:00');
  return isNaN(t.getTime()) ? null : t;
}

function storeTarget(date){
  const iso = date.toISOString().slice(0,10);
  localStorage.setItem('examDateISO', iso);
}

let target = readStoredTarget() || getDefaultTarget();
elInput.value = target.toISOString().slice(0,10);
elTarget.textContent = `Mục tiêu: ${formatVN(target)}`;

function rollIfPassed(){
  const now = new Date();
  if (now > target) {
    // tự động chuyển sang năm sau cùng ngày/tháng
    const y = target.getFullYear() + 1;
    const m = target.getMonth()+1;
    const d = target.getDate();
    target = new Date(`${toISO(y,m,d)}T00:00:00`);
    storeTarget(target);
    elInput.value = target.toISOString().slice(0,10);
    elTarget.textContent = `Mục tiêu: ${formatVN(target)}`;
  }
}

function render(){
  rollIfPassed();
  const now = new Date();
  const diff = target - now;
  if (diff <= 0){
    elDays.textContent = '00';
    elHours.textContent = '00';
    elMins.textContent = '00';
    elSecs.textContent = '00';
    return;
  }
  const s = Math.floor(diff/1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  elDays.textContent  = String(d);
  elHours.textContent = pad(h);
  elMins.textContent  = pad(m);
  elSecs.textContent  = pad(sec);
}

render();
setInterval(render, 1000);

elSave.addEventListener('click', () => {
  const val = elInput.value; // yyyy-mm-dd
  if (!val) return;
  const t = new Date(val + 'T00:00:00');
  if (isNaN(t.getTime())) return;
  target = t;
  storeTarget(target);
  elTarget.textContent = `Mục tiêu: ${formatVN(target)}`;
});

elReset.addEventListener('click', () => {
  target = getDefaultTarget();
  storeTarget(target);
  elInput.value = target.toISOString().slice(0,10);
  elTarget.textContent = `Mục tiêu: ${formatVN(target)}`;
});

// ===== QUOTES (ZenQuotes) =====
const quoteText   = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const refreshBtn  = document.getElementById('refreshQuote');

const FALLBACK_QUOTES = [
  { q: "Không có áp lực, không có kim cương.", a: "Thomas Carlyle" },
  { q: "Kỷ luật đánh bại động lực.", a: "Unknown" },
  { q: "Mỗi ngày tiến bộ 1% là đủ.", a: "Atomic Habits" },
];

function cacheSetQuote(obj){
  const payload = { t: Date.now(), data: obj };
  localStorage.setItem('quoteDaily', JSON.stringify(payload));
}
function cacheGetQuote(){
  try{
    const raw = localStorage.getItem('quoteDaily');
    if(!raw) return null;
    const { t, data } = JSON.parse(raw);
    // dùng trong vòng 6 giờ để giảm gọi API
    if (Date.now() - t < 6*60*60*1000) return data;
  }catch{}
  return null;
}

async function fetchQuote(){
  try{
    const url = `https://zenquotes.io/api/random?maxAge=0&_=${Date.now()}`;
    const res = await fetch(url, { cache:'no-store' });
    if(!res.ok) throw new Error('Bad status');
    const data = await res.json();
    const q = Array.isArray(data) ? data[0] : data;
    const obj = { q: q.q || q.quote || 'Keep going.', a: q.a || q.author || '' };
    cacheSetQuote(obj);
    return obj;
  }catch{
    const rnd = FALLBACK_QUOTES[Math.floor(Math.random()*FALLBACK_QUOTES.length)];
    return rnd;
  }
}

async function renderQuote(useCache=true){
  quoteText.textContent = 'Loading quote…';
  quoteAuthor.textContent = '';
  if (useCache){
    const c = cacheGetQuote();
    if (c){
      quoteText.textContent = `“${c.q}”`;
      quoteAuthor.textContent = c.a ? `— ${c.a}` : '';
      return;
    }
  }
  const q = await fetchQuote();
  quoteText.textContent = `“${q.q}”`;
  quoteAuthor.textContent = q.a ? `— ${q.a}` : '';
}

refreshBtn.addEventListener('click', () => renderQuote(false));
renderQuote(true);
