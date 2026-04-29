/* ============================================================
   ESTADO GLOBAL
   ============================================================ */
const state = {
  actividad: null,            // 'conductor' | 'propietario'
  objetivo_propietario: null, // 'comprar' | 'reparar' | 'renovar'
  urgencia: null,             // 'ya' | 'mes' | 'averiguando'
  cuota_inicial: null,        // 'no-tengo' | '8-10' | 'mas-10'
};

console.log('Asistente de Crédito cargado correctamente');

/* ============================================================
   INICIALIZACIÓN
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  goTo('step-1');
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
  if (!logo || !fallback) return;

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
      const value = btn.dataset.value;

      pick(step, field, value, btn);
    });
  });
}

/* ============================================================
   EVENT LISTENERS — BOTONES DE NAVEGACIÓN (Atrás)
   La acción "back-from-3" decide a dónde volver según el flujo.
   ============================================================ */
function bindNavButtons() {
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const action = btn.dataset.action;
      if (action === 'back-from-2') {
        goTo('step-1');
      } else if (action === 'back-from-3') {
        // Si es propietario vuelve al paso de objetivo; si es conductor, al paso 1.
        if (state.actividad === 'propietario') goTo('step-2');
        else goTo('step-1');
      } else if (action === 'back-from-4') {
        goTo('step-3');
      } else if (action === 'back-from-result') {
        // Volver del resultado al último paso (cuota inicial) para permitir corregir.
        const header = document.querySelector('.card-header');
        if (header) header.style.display = '';
        goTo('step-4');
      }
    });
  });
}

/* ============================================================
   EVENT LISTENERS — FORMULARIOS DE CONTACTO
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
   Conductor → 3 pasos totales | Propietario → 4 pasos totales
   ============================================================ */
function totalSteps() {
  return state.actividad === 'propietario' ? 4 : 3;
}

function progressFor(stepId) {
  const total = totalSteps();
  let n = 1;
  if (stepId === 'step-1') n = 1;
  else if (stepId === 'step-2') n = 2;
  else if (stepId === 'step-3') n = state.actividad === 'propietario' ? 3 : 2;
  else if (stepId === 'step-4') n = total;
  return { n, total };
}

function setProgress(stepId) {
  const { n, total } = progressFor(stepId);
  const pct = Math.round((n / total) * 100);
  const lbl = document.getElementById('prog-label');
  const pctEl = document.getElementById('prog-pct');
  const fill = document.getElementById('prog-fill');
  if (lbl)   lbl.textContent  = `Paso ${n} de ${total}`;
  if (pctEl) pctEl.textContent = pct + '%';
  if (fill)  fill.style.width  = pct + '%';
}

/* ============================================================
   NAVEGACIÓN ENTRE PASOS
   ============================================================ */
function showStep(id) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function goTo(stepId) {
  setProgress(stepId);
  showStep(stepId);
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
   Paso 1 → si "conductor" salta a paso 3 (urgencia)
            si "propietario" va a paso 2 (objetivo del propietario)
   Paso 2 → siempre va a paso 3 (urgencia)
   Paso 3 → siempre va a paso 4 (cuota inicial)
   Paso 4 → ejecuta classify()
   ============================================================ */
function advance(step, value) {
  if (step === 1) {
    if (value === 'propietario') goTo('step-2');
    else goTo('step-3'); // conductor salta directamente a urgencia
  } else if (step === 2) {
    goTo('step-3');
  } else if (step === 3) {
    goTo('step-4');
  } else if (step === 4) {
    classify();
  }
}

/* ============================================================
   CLASIFICACIÓN DEL LEAD
   Scoring:
     urgencia ya → +3 | mes → +2 | averiguando → 0
     cuota mas-10 → +3 | 8-10 → +2 | no-tengo → 0
     conductor → +1
     propietario+comprar → +2 | propietario+renovar → +2 | propietario+reparar → +1
   alto ≥ 7 | medio ≥ 4 | bajo < 4
   ============================================================ */
function classify() {
  const { actividad, objetivo_propietario, urgencia, cuota_inicial } = state;
  let score = 0;

  // Urgencia
  if (urgencia === 'ya') score += 3;
  else if (urgencia === 'mes') score += 2;

  // Cuota inicial
  if (cuota_inicial === 'mas-10') score += 3;
  else if (cuota_inicial === '8-10') score += 2;

  // Actividad / objetivo
  if (actividad === 'conductor') {
    score += 1;
  } else if (actividad === 'propietario') {
    if (objetivo_propietario === 'comprar' || objetivo_propietario === 'renovar') score += 2;
    else if (objetivo_propietario === 'reparar') score += 1;
  }

  const nivel = score >= 7 ? 'alto' : score >= 4 ? 'medio' : 'bajo';
  state.nivel = nivel;

  const header = document.querySelector('.card-header');
  if (header) header.style.display = 'none';

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
  if (!container) return;
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
