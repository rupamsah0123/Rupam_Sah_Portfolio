// ============================================================
// Feedback form — validation, star rating, async submit
// Works with Formspree (or any endpoint that accepts POST + FormData
// and returns JSON). See README for setup steps.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  const form = document.getElementById('feedbackForm');
  if(!form) return;

  const submitBtn = document.getElementById('fbSubmitBtn');
  const successPanel = document.getElementById('fbSuccess');
  const messageField = document.getElementById('fbMessage');
  const counter = document.getElementById('fbCounter');

  /* ---------- Character counter ---------- */
  function updateCounter(){
    const len = messageField.value.length;
    counter.textContent = `${len} / 1000`;
    counter.style.color = len > 950 ? '#C0525A' : '';
  }
  messageField.addEventListener('input', updateCounter);
  updateCounter();

  /* ---------- Star rating ---------- */
  const stars = document.querySelectorAll('.fb-star');
  const ratingInput = document.getElementById('fbRatingValue');

  function paintStars(value){
    stars.forEach(star => {
      star.classList.toggle('is-active', Number(star.dataset.value) <= value);
    });
  }

  stars.forEach(star => {
    star.addEventListener('click', () => {
      const value = Number(star.dataset.value);
      ratingInput.value = value;
      paintStars(value);
    });
    star.addEventListener('mouseenter', () => paintStars(Number(star.dataset.value)));
  });
  document.getElementById('fbRating').addEventListener('mouseleave', () => {
    paintStars(Number(ratingInput.value) || 0);
  });

  /* ---------- Validation ---------- */
  function setError(fieldId, message){
    const errEl = form.querySelector(`[data-error-for="${fieldId}"]`);
    const inputEl = document.getElementById(fieldId);
    if(errEl) errEl.textContent = message || '';
    if(inputEl) inputEl.classList.toggle('fb-invalid', Boolean(message));
  }

  function validate(){
    let valid = true;

    const name = document.getElementById('fbName').value.trim();
    if(!name){ setError('fbName', 'Please enter your name.'); valid = false; }
    else{ setError('fbName', ''); }

    const email = document.getElementById('fbEmail').value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!email){ setError('fbEmail', 'Please enter your email.'); valid = false; }
    else if(!emailPattern.test(email)){ setError('fbEmail', 'That email doesn\'t look right.'); valid = false; }
    else{ setError('fbEmail', ''); }

    const reason = document.getElementById('fbReason').value;
    if(!reason){ setError('fbReason', 'Please choose a reason.'); valid = false; }
    else{ setError('fbReason', ''); }

    const message = messageField.value.trim();
    if(!message){ setError('fbMessage', 'Please write a message.'); valid = false; }
    else if(message.length < 10){ setError('fbMessage', 'A little more detail would help (min 10 characters).'); valid = false; }
    else{ setError('fbMessage', ''); }

    return valid;
  }

  /* clear individual field errors as the person fixes them */
  ['fbName','fbEmail','fbReason','fbMessage'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', () => setError(id, ''));
    el.addEventListener('change', () => setError(id, ''));
  });

  /* ---------- Toast for network errors ---------- */
  function showToast(message){
    let toast = document.querySelector('.fb-toast');
    if(!toast){
      toast = document.createElement('div');
      toast.className = 'fb-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 4500);
  }

  /* ---------- Submit ---------- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if(!validate()){
      const firstError = form.querySelector('.fb-invalid');
      if(firstError) firstError.focus();
      return;
    }

    // Honeypot check — if a bot filled this hidden field, silently drop it
    const honeypot = form.querySelector('.fb-honeypot');
    if(honeypot && honeypot.value){ return; }

    const action = form.getAttribute('action') || '';
    if(action.includes('YOUR_FORM_ID')){
      showToast('Form endpoint not configured yet — see README for setup.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');

    try{
      const formData = new FormData(form);
      const response = await fetch(action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if(response.ok){
        form.hidden = true;
        successPanel.hidden = false;
        successPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        showToast('Something went wrong — please try again or email directly.');
      }
    } catch(err){
      showToast('Network error — please try again or email directly.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
    }
  });

});
