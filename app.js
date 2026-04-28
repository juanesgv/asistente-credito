/* ============================================================
   ESTADO GLOBAL
   ============================================================ */
const state = {
  objetivo: null,
  subcategoria: null,
  pago_mensual: null,
  urgencia: null,
};

console.log('Asistente de Crédito cargado correctamente');

/* ============================================================
   INICIALIZACIÓN
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  setProgress(1);
  bindOptionButtons();
  bindNavButtons();
  bindForms();
  bindLogoFallback();
});

/* ============================================================
   LOGO FALLBACK
   Muestra el texto "Clave2000" si el SVG no carga.
   ============================================================ */
function bindLogoFallback() {
  const logo = document.getElementById('brand-logo');
  const fallback = document.getElementById('logo-fb');

  logo.addEventListener('error', () => {
    logo.style.display = 'none';
    fallback.classList.add('visible');
  });
}

/* ============================================================
   EVENT LISTENERS — BOTONES DE OPCIÓN
   Lee data-step, data-field y data-value de cada botón.
   ============================================================ */
function bindOptionButtons() {
  document.querySelectorAll('.opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const step  = parseInt(btn.dataset.step);
      const field = btn.dataset.field;
      // Convierte "true"/"false" a booleano; el resto se usa como string
      const raw   = btn.dataset.value;
      const value = raw === 'true' ? true : raw === 'false' ? false : raw;

      pick(step, field, value, btn);
    });
  });
}

/* ============================================================
   EVENT LISTENERS — BOTONES DE NAVEGACIÓN (Atrás)
   Lee data-action para saber a qué paso volver.
   ============================================================ */
function bindNavButtons() {
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'go-1') go(1);
      else if (action === 'go-3') go(3);
      else if (action === 'goBack2') goBack2();
    });
  });
}

/* ============================================================
   EVENT LISTENERS — FORMULARIOS DE CONTACTO
   Lee data-nivel para identificar el resultado.
   ============================================================ */
function bindForms() {
  document.querySelectorAll('.contact-form').forEach(form => {
    form.addEventListener('submit', e => {
      submitForm(e, form.dataset.nivel);
    });
  });
}

/* ============================================================
   PROGRESO
   ============================================================ */
function setProgress(n) {
  const pct = Math.round((n / 4) * 100);
  document.getElementById('prog-label').textContent = `Paso ${n} de 4`;
  document.getElementById('prog-pct').textContent   = pct + '%';
  document.getElementById('prog-fill').style.width  = pct + '%';
}

/* ============================================================
   NAVEGACIÓN ENTRE PASOS
   ============================================================ */
function showStep(id) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function go(n) {
  if (n === 1) { setProgress(1); showStep('step-1'); }
  if (n === 3) { setProgress(3); showStep('step-3'); }
}

function goBack2() {
  setProgress(2);
  const obj = state.objetivo;
  if (obj === 'primer-taxi') showStep('step-2a');
  else if (obj === 'renovar') showStep('step-2b');
  else showStep('step-2c');
}

/* ============================================================
   SELECCIÓN DE OPCIÓN
   ============================================================ */
function pick(step, field, value, el) {
  state[field] = value;

  // Marcar seleccionado dentro del mismo grupo
  el.closest('.options, .options-binary')
    .querySelectorAll('.opt')
    .forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');

  // Avanzar tras breve pausa para que el usuario vea la selección
  setTimeout(() => advance(step, value), 220);
}

/* ============================================================
   LÓGICA DE TRANSICIÓN
   ============================================================ */
function advance(step, value) {
  if (step === 1) {
    setProgress(2);
    if (value === 'primer-taxi') showStep('step-2a');
    else if (value === 'renovar') showStep('step-2b');
    else showStep('step-2c');
  } else if (step === 2) {
    setProgress(3);
    showStep('step-3');
  } else if (step === 3) {
    setProgress(4);
    showStep('step-4');
  } else if (step === 4) {
    setProgress(4);
    classify();
  }
}

/* ============================================================
   CLASIFICACIÓN DEL LEAD
   Scoring:
     objetivo primer-taxi / renovar → +2
     pago mas-1200 → +2 | 800-1200 → +1
     urgencia ya → +2 | mes → +1
   alto ≥ 5 | medio ≥ 3 | bajo < 3
   ============================================================ */
function classify() {
  const { objetivo, pago_mensual, urgencia } = state;
  let score = 0;

  if (objetivo === 'primer-taxi' || objetivo === 'renovar') score += 2;
  if (pago_mensual === 'mas-1200') score += 2;
  else if (pago_mensual === '800-1200') score += 1;
  if (urgencia === 'ya') score += 2;
  else if (urgencia === 'mes') score += 1;

  const nivel = score >= 5 ? 'alto' : score >= 3 ? 'medio' : 'bajo';

  document.querySelector('.card-header').style.display = 'none';
  showStep('result-' + nivel);
  if (nivel === 'alto') launchConfetti();
}

/* ============================================================
   ENVÍO DEL FORMULARIO
   ============================================================ */
function submitForm(e, nivel) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');
  btn.textContent = '¡Solicitud enviada!';
  btn.disabled    = true;
  btn.style.background = '#00A63E';
}

/* ============================================================
   CONFETTI
   ============================================================ */
function launchConfetti() {
  const colors    = ['#C63025', '#243C4F', '#FDE5E3', '#9FC3DA', '#fff'];
  const container = document.getElementById('confetti-layer');
  container.innerHTML = '';

  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left              = Math.random() * 100 + 'vw';
    piece.style.background        = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay    = (Math.random() * 1.2) + 's';
    piece.style.animationDuration = (2 + Math.random()) + 's';
    container.appendChild(piece);
  }

  setTimeout(() => { container.innerHTML = ''; }, 4000);
}
