const API_URL = '/api/bookings';

/*Auth guard: redirect to login if no token*/
function getToken() {
  return sessionStorage.getItem('auth_token');
}
function getUser() {
  return sessionStorage.getItem('auth_user');
}

if (!getToken()) {
  window.location.replace('login.html');
}

/*Inject auth headers into every fetch*/
function authFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'Authorization': `Basic ${getToken()}`,
    },
  });
}

/*DOM*/
const tbody       = document.getElementById('tbody');
const searchEl    = document.getElementById('search');
const countPill   = document.getElementById('count-pill');
const footerText  = document.getElementById('footer-text');
const lastUpdated = document.getElementById('last-updated');
const cardFooter  = document.getElementById('card-footer');
const tableWrap   = document.getElementById('table-wrap');

let allBookings = [];

/*Load bookings*/
async function loadBookings() {
  showState('loading');
  try {
    const res = await authFetch(`${API_URL}?limit=500`);

    if (res.status === 401) {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_user');
      window.location.replace('login.html');
      return;
    }

    if (!res.ok) throw new Error(`Server returned ${res.status}`);

    allBookings = await res.json();
    lastUpdated.textContent = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    });
    renderRows(allBookings);
  } catch (err) {
    showState('error');
    document.getElementById('error-text').textContent =
      `Could not connect to API: ${err.message}`;
  }
}

/*Render rows*/
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
  footerText.textContent = `Showing ${list.length} of ${allBookings.length} requests`;
}

/*States*/
function showState(state) {
  document.getElementById('state-loading').hidden = state !== 'loading';
  document.getElementById('state-empty').hidden   = !['empty', 'empty-search'].includes(state);
  document.getElementById('state-error').hidden   = state !== 'error';
  tableWrap.hidden  = state !== 'data';
  cardFooter.hidden = state !== 'data';

  document.querySelector('#state-empty p').textContent =
    state === 'empty-search'
      ? 'No results match your search'
      : 'No repair requests yet';

  if (state !== 'data') {
    tbody.innerHTML = '';
    countPill.textContent = state === 'loading' ? '…' : '0';
  }
}

/*Search*/
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

/*Refresh*/
document.getElementById('btn-refresh').addEventListener('click', () => {
  searchEl.value = '';
  loadBookings();
});
document.getElementById('retry-btn').addEventListener('click', loadBookings);

/*Sign out*/
document.getElementById('btn-signout').addEventListener('click', () => {
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_user');
  window.location.replace('login.html');
});

//Helpers
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/* ── Show logged-in user in header ── */
const AUTH_USER = getUser();
if (AUTH_USER) {
  const userEl = document.getElementById('header-user');
  if (userEl) userEl.textContent = AUTH_USER;
}

//Init
loadBookings();