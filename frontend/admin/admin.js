const API_URL = 'http://localhost:8000/api/bookings';

let allBookings = [];

const tbody       = document.getElementById('tbody');
const searchEl    = document.getElementById('search');
const countPill   = document.getElementById('count-pill');
const footerText  = document.getElementById('footer-text');
const lastUpdated = document.getElementById('last-updated');
const cardFooter  = document.getElementById('card-footer');
const tableWrap   = document.getElementById('table-wrap');

async function loadBookings() {
  showState('loading');
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`Сервер вернул ${res.status}`);
    allBookings = await res.json();
    lastUpdated.textContent = new Date().toLocaleTimeString('ru-RU');
    renderRows(allBookings);
  } catch (err) {
    showState('error');
    document.getElementById('error-text').textContent =
      `Не удалось подключиться к API: ${err.message}`;
  }
}

function renderRows(list) {
  if (list.length === 0) {
    showState(searchEl.value.trim() ? 'empty-search' : 'empty');
    return;
  }

  showState('data');

  tbody.innerHTML = list.map(b => `
    <tr>
      <td class="col-id">${b.id}</td>
      <td class="col-name">${esc(b.name)}</td>
      <td class="col-phone"><a href="tel:${esc(b.phone)}">${esc(b.phone)}</a></td>
      <td class="col-problem">${esc(b.problem_description)}</td>
      <td class="col-date">${formatDate(b.created_at)}</td>
    </tr>
  `).join('');

  countPill.textContent = list.length;
  footerText.textContent = `Показано ${list.length} из ${allBookings.length} заявок`;
}

//States
function showState(state) {
  document.getElementById('state-loading').hidden = state !== 'loading';
  document.getElementById('state-empty').hidden   = !['empty', 'empty-search'].includes(state);
  document.getElementById('state-error').hidden   = state !== 'error';
  tableWrap.hidden  = state !== 'data';
  cardFooter.hidden = state !== 'data';

  document.querySelector('#state-empty p').textContent = state === 'empty-search'
    ? 'Ничего не найдено по вашему запросу.'
    : 'Заявок пока нет.';

  if (state !== 'data') {
    tbody.innerHTML = '';
    countPill.textContent = state === 'loading' ? '…' : '0';
  }
}

//Search
searchEl.addEventListener('input', function () {
  const q = this.value.toLowerCase().trim();
  if (!q) { renderRows(allBookings); return; }
  renderRows(
    allBookings.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.phone.toLowerCase().includes(q) ||
      b.problem_description.toLowerCase().includes(q)
    )
  );
});

//Refresh
document.getElementById('btn-refresh').addEventListener('click', () => {
  searchEl.value = '';
  loadBookings();
});
document.getElementById('retry-btn').addEventListener('click', loadBookings);

//Helpers
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

//Init
loadBookings();