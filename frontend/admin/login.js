const API_URL = '/api/bookings';

const form        = document.getElementById('login-form');
const btnSubmit   = document.getElementById('btn-submit');
const btnLabel    = btnSubmit.querySelector('.btn-label');
const btnSpinner  = btnSubmit.querySelector('.btn-spinner');
const alertBox    = document.getElementById('alert-error');
const alertText   = document.getElementById('alert-text');
const togglePw    = document.getElementById('toggle-pw');
const eyeShow     = document.getElementById('eye-show');
const eyeHide     = document.getElementById('eye-hide');
const pwInput     = document.getElementById('password');

/* ── If already authenticated, skip login ── */
if (sessionStorage.getItem('auth_token')) {
  window.location.replace('admin.html');
}

/* ── Password visibility toggle ── */
togglePw.addEventListener('click', () => {
  const isPassword = pwInput.type === 'password';
  pwInput.type = isPassword ? 'text' : 'password';
  eyeShow.hidden = isPassword;
  eyeHide.hidden = !isPassword;
});

/* ── Clear errors on input ── */
['username', 'password'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    clearFieldError(id);
    hideAlert();
  });
});

/* ── Form submit ── */
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  // Client-side required validation
  let valid = true;
  if (!username) {
    showFieldError('username', 'Username is required.');
    valid = false;
  }
  if (!password) {
    showFieldError('password', 'Password is required.');
    valid = false;
  }
  if (!valid) return;

  setLoading(true);
  hideAlert();

  const token = btoa(`${username}:${password}`);

  try {
    // Verify credentials against a protected endpoint
    const res = await fetch(`${API_URL}?limit=1`, {
      headers: { 'Authorization': `Basic ${token}` },
    });

    if (res.ok) {
      // Store token for the session
      sessionStorage.setItem('auth_token', token);
      sessionStorage.setItem('auth_user', username);
      window.location.replace('admin.html');
    } else if (res.status === 401) {
      showAlert('Invalid username or password. Please try again.');
      document.getElementById('password').value = '';
      document.getElementById('password').focus();
    } else {
      showAlert(`Server error (${res.status}). Please try again later.`);
    }
  } catch {
    showAlert('Cannot reach the server. Check your connection.');
  } finally {
    setLoading(false);
  }
});

/* ── Helpers ── */
function setLoading(on) {
  btnSubmit.disabled = on;
  btnLabel.hidden    = on;
  btnSpinner.hidden  = !on;
}

function showAlert(msg) {
  alertText.textContent = msg;
  alertBox.hidden = false;
  // Re-trigger shake animation
  alertBox.style.animation = 'none';
  alertBox.offsetHeight; // reflow
  alertBox.style.animation = '';
}

function hideAlert() {
  alertBox.hidden = true;
}

function showFieldError(id, msg) {
  const input = document.getElementById(id);
  const err   = document.getElementById(`${id}-error`);
  input.classList.add('is-error');
  if (err) err.textContent = msg;
}

function clearFieldError(id) {
  const input = document.getElementById(id);
  const err   = document.getElementById(`${id}-error`);
  input.classList.remove('is-error');
  if (err) err.textContent = '';
}