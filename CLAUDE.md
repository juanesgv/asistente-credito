# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Single-file HTML application: a multi-step lead qualification wizard for taxi vehicle financing (Clave 2000, Colombia). The entire app lives in `asistente-credito.html` — no build system, no dependencies, no package manager.

To run: open `asistente-credito.html` directly in a browser.

## Architecture

Everything is self-contained in one file with three logical sections:

**HTML (steps/screens)** — The wizard has 4 question steps plus 3 result screens:
- `#step-1`: Objective (first taxi / renew / info only)
- `#step-2a/2b/2c`: Branched follow-up depending on step-1 answer
- `#step-3`: Monthly payment capacity
- `#step-4`: Urgency
- `#result-alto/medio/bajo`: Result screens with embedded contact forms

Step visibility is controlled entirely by the `.active` CSS class. Only one `.step` is visible at a time.

**CSS** — Uses CSS custom properties (`--color-*`, `--radius-*`, etc.) defined in `:root`. Design tokens are at the top of `<style>`. No external CSS framework.

**JavaScript** — Vanilla JS, no frameworks. Key globals:
- `state` object holds all quiz responses and the final classification
- `config` object controls GTM and API integration flags
- `window.AsistenteCredito` exposes a public API for external embedding (getState, reset, etc.)

## Lead Classification Logic

`classifyLead()` in the script section determines which result screen to show:
- **alto**: payment > 1,000,000 COP AND urgency = 'ya'
- **medio**: payment 800k–1.2M OR urgency = 'mes'
- **bajo**: everything else

## Integration Points

Two integration surfaces, both disabled by default — toggle via `config` object:

1. **Google Tag Manager**: Set `config.gtm.enabled = true`. Events pushed: `quiz_iniciado`, `quiz_paso_completado`, `quiz_completado`, `lead_generado`.

2. **API/CRM webhook**: Set `config.api.enabled = true` and `config.api.endpoint` to your endpoint. Lead payload sent on form submit includes all responses, contact info, timestamp, and hostname.

## Second File

`Asistente de Crédito claude.html` (with spaces and accent in the filename) also exists in the repo — it is likely an earlier or alternate version. The canonical file is `asistente-credito.html`.
