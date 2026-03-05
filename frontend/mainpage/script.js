const API_BASE_URL = "http://localhost:8000";

/*DOM REFERENCES*/
const header       = document.getElementById("site-header");
const hamburger    = document.getElementById("hamburger");
const nav          = document.querySelector(".nav");
const form         = document.getElementById("booking-form");
const successMsg   = document.getElementById("form-success");
const resetBtn     = document.getElementById("reset-form");
const submitBtn    = document.getElementById("submit-btn");
const btnText      = submitBtn.querySelector(".btn-text");
const btnLoader    = submitBtn.querySelector(".btn-loader");

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 10);
}, { passive: true });

/*MOBILE NAVIGATION*/
hamburger.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  hamburger.setAttribute("aria-expanded", isOpen);
});

nav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => nav.classList.remove("open"));
});

const US_PHONE_REGEX = /^(\+1\s?)?(\(?\d{3}\)?[\s\-.]?)(\d{3}[\s\-.]?\d{4})$/;

function showError(fieldId, message) {
  const group = document.getElementById(`group-${fieldId}`);
  const input = document.getElementById(fieldId) || document.getElementById("problem_description");
  const errorEl = document.getElementById(`${fieldId}-error`);

  if (input) input.classList.add("input-error");
  if (errorEl) errorEl.textContent = message;
}

/*Clear field error state*/
function clearError(fieldId) {
  const input = document.getElementById(fieldId) || document.getElementById("problem_description");
  const errorEl = document.getElementById(`${fieldId}-error`);

  if (input) input.classList.remove("input-error");
  if (errorEl) errorEl.textContent = "";
}

/*Validate the entire form*/
function validateForm() {
  let isValid = true;

  const name    = document.getElementById("name").value.trim();
  const phone   = document.getElementById("phone").value.trim();
  const problem = document.getElementById("problem_description").value.trim();

  //Name
  clearError("name");
  if (!name) {
    showError("name", "Full name is required.");
    isValid = false;
  } else if (name.length < 2) {
    showError("name", "Name must be at least 2 characters.");
    isValid = false;
  }

  //Phone
  clearError("phone");
  if (!phone) {
    showError("phone", "Phone number is required.");
    isValid = false;
  } else if (!US_PHONE_REGEX.test(phone)) {
    showError("phone", "Please enter a valid US phone number (e.g. (555) 867-5309).");
    isValid = false;
  }

  //Problem description
  clearError("problem");
  if (!problem) {
    showError("problem", "Please describe the problem.");
    isValid = false;
  } else if (problem.length < 10) {
    showError("problem", "Description must be at least 10 characters.");
    isValid = false;
  }

  return isValid;
}

/* INLINE VALIDATION */
document.getElementById("name").addEventListener("blur", () => {
  const val = document.getElementById("name").value.trim();
  clearError("name");
  if (val && val.length < 2) showError("name", "Name must be at least 2 characters.");
});

document.getElementById("phone").addEventListener("blur", () => {
  const val = document.getElementById("phone").value.trim();
  clearError("phone");
  if (val && !US_PHONE_REGEX.test(val)) {
    showError("phone", "Please enter a valid US phone number.");
  }
});

document.getElementById("problem_description").addEventListener("blur", () => {
  const val = document.getElementById("problem_description").value.trim();
  clearError("problem");
  if (val && val.length < 10) showError("problem", "Description must be at least 10 characters.");
});

/* SET LOADING STATE */
function setLoading(loading) {
  submitBtn.disabled = loading;
  btnText.hidden     = loading;
  btnLoader.hidden   = !loading;
}

/* FORM SUBMIT */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  const payload = {
    name:                document.getElementById("name").value.trim(),
    phone:               document.getElementById("phone").value.trim(),
    problem_description: document.getElementById("problem_description").value.trim(),
  };

  setLoading(true);

  try {
    const response = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      form.hidden       = true;
      successMsg.hidden = false;
    } else if (response.status === 422) {
      handleServerValidationErrors(data.detail);
    } else {
      alert(data?.detail || "Something went wrong. Please try again or call us directly");
    }

  } catch (err) {
    console.error("Booking submission error:", err);
    alert(
      "Unable to reach the server. Please check your connection or call us at (800) 555-1234"
    );
  } finally {
    setLoading(false);
  }
});

/*Map FastAPI validation errors to form fields*/
function handleServerValidationErrors(errors) {
  if (!Array.isArray(errors)) return;

  errors.forEach(err => {
    const field = err.loc?.[1];
    if (field === "name")                showError("name",    err.msg);
    else if (field === "phone")          showError("phone",   err.msg);
    else if (field === "problem_description") showError("problem", err.msg);
  });
}

/*RESET FORM*/
resetBtn.addEventListener("click", () => {
  form.reset();
  ["name", "phone", "problem"].forEach(clearError);
  form.hidden       = false;
  successMsg.hidden = true;
});

/*SMOOTH SCROLL*/
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", (e) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    const headerHeight = header.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
    window.scrollTo({ top, behavior: "smooth" });
  });
});