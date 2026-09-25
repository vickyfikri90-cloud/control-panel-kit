# Agent Instructions — Control Panel Kit

**Read this file first** when adapting this experiment tool to a new project or adding components.

## Project purpose

This is a **reusable vanilla JS control panel kit** for interactive UI experiments. The user tweaks parameters in a Figma-style sidebar and sees live preview + exportable HTML snippet.

Target use: copy `Components/` into future vibe-code / prototype projects (buttons, cards, animations, etc.).

## Non-negotiable conventions

### File naming

| Item | Convention | Example |
|------|------------|---------|
| Component folder | PascalCase | `ColorInput/` |
| Component files | Fixed | `component.js`, `component.html`, `component.css` |
| Init function | `init` + folder name | `initColorInput` |
| Manifest ID | kebab-case | `color-input` |
| Data attributes | kebab-case | `data-color-hex` |
| State classes | `is-*` prefix | `is-on`, `is-open`, `is-fixed` |
| Experiment shell | `{name}.shell.html` | `hover-button.shell.html` |
| Experiment logic | `{name}-app.js` | `hover-button-app.js` |
| Built output | `{name}.html` | `hover-button.html` |

### Init function pattern

Every component exports a global init:

```js
window.initMyControl = function initMyControl(root, options = {}) {
  // query DOM inside root
  // wire events
  return { element, /* getters/setters */ };
};
```

### App wiring pattern

Every experiment app must follow this loop:

```js
(function () {
  const utils = window.ComponentUtils;
  const preview = initMyPreview(document.querySelector('.cp-preview'), opts);

  const snippet = initSnippetOutput(document.getElementById('snippet-root'), {
    filename: 'export.html',
    getContent: generateSnippet,
  });

  utils.bindInputWrapInputs(document);

  function applyAll() {
    preview.apply(getConfig());
    // dimension controls: call updateLabel() after preview resize
    snippet.update();
  }

  // wire all onChange → applyAll
  applyAll(); // initial render
})();
```

### Script load order

In `control-panel-kit.js`, order matters:

```
shared/utils.js → shared/icons.js → primitives → ControlPanel/component.js
```

SliderTick depends on Slider — Slider must load first.

### Template sync

When editing `{Folder}/component.html`, also update the matching key in `components-templates.js`. Single-file builds and `file://` mode use embedded templates, not fetch.

## Do

- Keep **240px field width** and **24px control height**
- Use **Inter 500** for panel controls; **DM Mono** only in SnippetOutput
- Wire everything through a single **`applyAll`** function
- Call **`dims.width.updateLabel()`** (and height) after preview size changes
- Call **`snippet.update()`** inside `applyAll`
- Use **`ComponentUtils.escapeHtml()`** for user text in generated snippets
- Register reusable controls in **`components-manifest.js`**
- Add new kit CSS/JS to **`control-panel-kit.js`** arrays
- Use **`data-*` attributes** for JS queries
- Respect global menu close events: `dimension-menu:close-all`, `option-selector:close-all`

## Don't

- Don't convert to React/Vue unless the user explicitly asks — preserve init/controller API
- Don't edit **`hover-button.html`** directly — it's build output
- Don't fetch panel HTML in single-file builds — use `components-templates.js`
- Don't skip manifest registration for reusable primitives
- Don't open multiple dropdown menus simultaneously
- Don't assume **HoverButton** is in the kit — add per experiment
- Don't break HoverButton's **two `.text` nodes** inside `.label` (required for slide animation)
- Don't change panel width from 241px without updating all field CSS

## Adding a new reusable component

1. Create `Components/MyControl/component.{js,html,css}`
2. Implement `window.initMyControl(root, options)`
3. Register in `components-manifest.js`
4. Add HTML to `components-templates.js`
5. Add to `control-panel-kit.js` `styles[]` and `scripts[]` (correct order)
6. Add demo entry in `component-index.js` → `demoOptions`
7. Document in `docs/COMPONENTS.md`

## Adding a new experiment

1. Create `{name}.shell.html` — `.cp-app` layout with preview + panel markup
2. Create `{name}-app.js` — IIFE wiring all controls
3. Entry HTML loads `control-panel-kit.js`, calls `load()` + `createShell()`
4. Load experiment-specific components separately (e.g. `HoverButton/component.js`)
5. Optional: extend `scripts/build-single-html.js` for single-file export

## Loading systems

| System | File | When to use |
|--------|------|-------------|
| **ControlPanelKit** | `control-panel-kit.js` | Full experiment apps — loads everything |
| **ComponentLoader** | `components-loader.js` | Load one component by manifest ID |

## Key globals

| Global | Source | Purpose |
|--------|--------|---------|
| `ControlPanelKit` | `control-panel-kit.js` | Load, shell, mount panel |
| `ComponentUtils` | `shared/utils.js` | parsePx, escapeHtml, bindInputBehavior |
| `ComponentIcons` | `shared/icons.js` | Base64 SVG icons |
| `COMPONENTS` | `components-manifest.js` | Registry array |
| `COMPONENT_TEMPLATES` | `components-templates.js` | Embedded HTML strings |
| `ComponentLoader` | `components-loader.js` | Lazy single-component load |

## Reference docs

- Component API, options, CSS, examples → [docs/COMPONENTS.md](./docs/COMPONENTS.md)
- User-facing overview → [README.md](./README.md)

## Experiment registry

When the user or another agent says "Experiment N", use this mapping — **selector label ≠ internal id** for Experiment 4.

| User says | Selector label | Internal id | App file | Init function | Notes |
|-----------|----------------|-------------|----------|---------------|-------|
| Experiment 1 | Experiment 1 | `1` | `hover-button-app.js` | `initExperiment1` | Hover button slide animation |
| Experiment 2 | Experiment 2 | `2` | `experiment-2-app.js` | `initExperiment2` | Rotate carousel |
| Experiment 3 | Experiment 3 | `3` | `experiment-3-app.js` | `initExperiment3` | Rotate X button |
| Experiment 4 | Experiment 4 | `4.5` | `experiment-4-5-app.js` | `initExperiment4_5` | 3D carousel — Variant (V/H), Input (Drag/Scroll), Reverse Scroll Direction toggle (scroll only), Highlight Scale. DOM ids use `exp45-*`. Snippet: `experiment-4-5.html`. |
| Experiment 5 | Experiment 5 | `5` | `experiment-5-app.js` | `initExperiment5` | Flip carousel |
| Experiment 6 | Experiment 6 | `6` | `experiment-6-app.js` | `initExperiment6` | Arc scroll transition — vanilla port of Osmo's resource (osmo.supply `arc-scroll-transition`). 5 sections (image / solid / image / solid / image) scroll inside the preview; square SVG per transition, quadratic arc `depth*sin(progress*PI)`, `depth = curve * section aspect`. Transitions: cover 12, reveal 10, cover 25, reveal 5. Lenis-like wheel smoothing + ScrollTrigger-style scrub (no GSAP). Controls: 4 curves, scrub, smoothing, heading size, solid color, image opacity. DOM ids use `exp6-*`. Snippet: `experiment-6.html` (embeds component via `experiment-6-snippet-embed.js`). |
| Experiment 7 | Experiment 7 | `7` | `experiment-7-app.js` | `initExperiment7` | Infinite height carousel — drag / horizontal swipe, 10 boxes, slot structure C-B-A-ACTIVE-A-B-C. Heights, duration, easing, velocity. DOM ids use `exp7-*`. Snippet: `experiment-7.html`. |
| Experiment 8 | Experiment 8 | `8` | `experiment-8-app.js` | `initExperiment8` | Horizontal parallax — 5 cards, infinite loop, single image at 120% in frame; position shifts left/center/right by slot (before/middle/after). Card width/height, gap, duration, easing, velocity. DOM ids use `exp8-*`. Snippet: `experiment-8.html`. |
| Experiment 9 | Experiment 9 | `9` | `experiment-9-app.js` | `initExperiment9` | Staggered vertical text swap button — fixed-width per-char slots (current/incoming), stagger Sequential or Center out (`abs(i-mid)*step`, forms a chevron-up wave), focus-visible = hover, prefers-reduced-motion instant swap. Glyphs only ever move upward (below → center → above); changing hover mid-animation lets in-flight glyphs finish then continue, pending ones are cancelled. DOM ids use `exp9-*`. Snippet: `experiment-9.html`. |

### Changelog

- **2026-08:** Basic Experiment 4 (`experiment-4-app.js`, internal id `4`) removed. "Experiment 4" in the UI now maps to internal id `4.5`. Code and DOM still use `4.5` / `exp45-*` — do not rename unless explicitly requested.
- **2026-09:** Experiment 6 rebuilt to match Osmo's Arc Scroll Transition (old infinite-loop / burst modes removed).
- **2026-09:** Experiment 9 added. Staggered vertical text-swap hover button (`experiment-9-app.js`, `Components/StaggerTextButton/`).

## Example: Hover Button experiment

Reference implementation:

- Shell: `hover-button.shell.html`
- Logic: `hover-button-app.js`
- Preview component: `Components/HoverButton/`
- Build: `scripts/build-single-html.js` → `hover-button.html`

When cloning this pattern for a new experiment, copy the wiring structure from `hover-button-app.js`, not the HoverButton-specific logic.
