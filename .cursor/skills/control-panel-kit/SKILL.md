---
name: control-panel-kit
description: >-
  Build Figma-style vanilla JS control panel experiments — live preview left,
  tweakable sidebar right, HTML snippet export. Use when creating UI experiments,
  interactive prototypes, vibe-code tools, parameter panels, or when the user
  mentions control panel, experiment tool, Components/, applyAll, or snippet export.
---

# Control Panel Kit

Vanilla JS toolkit for UI experiments. **No React/Vue.** Copy `Components/` into new projects or work in this repo.

**Before any work:** read `AGENTS.md` and skim `docs/COMPONENTS.md` for full API.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  .cp-app                                            │
│  ┌──────────────────────┐  ┌─────────────────────┐  │
│  │  .cp-preview         │  │  .panel (241px)     │  │
│  │  Experiment preview  │  │  Field, ColorInput, │  │
│  │                      │  │  Slider, Snippet…   │  │
│  └──────────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

Every panel change flows through one **`applyAll()`** loop → preview update + snippet export.

## Design tokens (non-negotiable)

| Token | Value |
|-------|-------|
| Panel width | 241px |
| Field width | 240px |
| Control height | 24px |
| Field padding | 0 16px |
| Row gap | 8px |
| Input bg | `#f5f5f5` |
| Focus border | `#9D9D9D` |
| Label font | Inter 500, 9px caps |
| Control font | Inter 500, 11px/16px |
| Code font | DM Mono 500, 9px (SnippetOutput only) |

## Kit components — use these, don't reinvent

| ID | Init | Use for |
|----|------|---------|
| `control-panel` | `initControlPanel` | Shell layout (preview + sidebar) |
| `field` | `initField` | Label + input row wrapper |
| `input-wrap` | `initInputWrap` | Text/number input with icon |
| `dimension-control` | `initDimensionControl` / `initDimensionControlGroup` | Fixed / Hug Content picker |
| `color-input` | `initColorInput` | Hex + opacity + swatch |
| `snippet-output` | `initSnippetOutput` | Code preview + download |
| `slider` | `initSlider` | Numeric input + draggable track |
| `slider-tick` | `initSliderTick` | Slider with snap ticks (needs Slider first) |
| `divider` | `initDivider` | Section separator |
| `option-selector` | `initOptionSelector` | Searchable dropdown |
| `toggle` | `initToggle` | On/off switch |
| `checkbox` | `initCheckbox` | Checked / indeterminate / unchecked |
| `cubic-bezier-input` | `initCubicBezierInput` | Text + curve editor for easing |

Experiment-specific preview components (e.g. `HoverButton`) live in `Components/` but are **not** in the manifest — add per project.

Full per-component API → [components-quick-ref.md](components-quick-ref.md)

## Naming conventions

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

## Init function pattern

Every component exports a global init:

```js
window.initMyControl = function initMyControl(root, options = {}) {
  // query DOM inside root
  // wire events
  return { element, /* getters/setters */ };
};
```

## App wiring pattern (required)

Every experiment app is an IIFE with this loop:

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
    // after preview resize: dims.width.updateLabel(); dims.height.updateLabel();
    snippet.update();
  }

  // wire every control onChange → applyAll
  applyAll(); // initial render
})();
```

**Reference implementation:** `hover-button-app.js` — copy its wiring structure, not HoverButton-specific logic.

## New experiment checklist

```
- [ ] Create {name}.shell.html — .cp-app with .cp-preview + .panel markup
- [ ] Create {name}-app.js — IIFE, applyAll loop, all controls wired
- [ ] Entry HTML loads control-panel-kit.js, calls load() + createShell()
- [ ] Load experiment-specific preview component separately
- [ ] Optional: extend scripts/build-single-html.js for single-file export
```

### Shell HTML skeleton

```html
<div class="cp-app cp-app--fullscreen">
  <div class="cp-preview">
    <!-- preview component markup -->
  </div>
  <aside class="panel">
    <div class="field">...</div>
    <div id="snippet-root">...</div>
  </aside>
</div>
```

### Entry bootstrap

```html
<script src="Components/control-panel-kit.js"></script>
<script>
  (async () => {
    await ControlPanelKit.load();
    const shell = ControlPanelKit.createShell('#app', {
      previewHTML: '<div class="cp-preview">...</div>',
    });
    await ControlPanelKit.loadScript('my-experiment-app.js', 'app');
  })();
</script>
```

## New reusable component checklist

```
- [ ] Create Components/MyControl/component.{js,html,css}
- [ ] Implement window.initMyControl(root, options)
- [ ] Register in components-manifest.js
- [ ] Sync HTML to components-templates.js
- [ ] Add to control-panel-kit.js styles[] and scripts[] (correct order)
- [ ] Add demo entry in component-index.js → demoOptions
- [ ] Document in docs/COMPONENTS.md
```

**Script load order in control-panel-kit.js:**
```
shared/utils.js → shared/icons.js → primitives → ControlPanel/component.js
```
SliderTick depends on Slider — Slider must load first.

**Template sync:** editing `component.html` requires updating the matching key in `components-templates.js` (single-file builds use embedded templates, not fetch).

## Panel control selection guide

| Need | Component |
|------|-----------|
| Text label | `field` + bare input or `input-wrap` |
| Numeric px/ms value | `input-wrap` with `numeric: true` + `bindNumericArrowKey` |
| Color with opacity | `color-input` |
| Width/height Fixed vs Hug | `dimension-control` group |
| Range 0–100 | `slider` or `slider-tick` for snap points |
| Boolean on/off | `toggle` |
| Easing / cubic-bezier | `cubic-bezier-input` |
| Multi-option pick | `option-selector` |
| Section break | `divider` |
| Export HTML/CSS | `snippet-output` with `getContent` + `escapeHtml` |

## Snippet generation rules

- Call `snippet.update()` inside `applyAll`
- Use `ComponentUtils.escapeHtml()` for all user text in generated HTML
- `getContent` returns full exportable HTML string

## Global menu events

Only one dropdown open at a time. Respect:
- `dimension-menu:close-all`
- `option-selector:close-all`

## Loading systems

| System | File | When |
|--------|------|------|
| ControlPanelKit | `control-panel-kit.js` | Full experiment apps |
| ComponentLoader | `components-loader.js` | Load one component by manifest ID |

## Key globals

| Global | Purpose |
|--------|---------|
| `ControlPanelKit` | Load, shell, mount panel |
| `ComponentUtils` | parsePx, escapeHtml, bindInputBehavior, bindNumericArrowKey |
| `ComponentIcons` | Base64 SVG icons for chevron, check |
| `COMPONENTS` | Registry from components-manifest.js |
| `COMPONENT_TEMPLATES` | Embedded HTML for single-file builds |

## Don't

- Don't convert to React/Vue unless user explicitly asks
- Don't edit build outputs (`hover-button.html`) directly
- Don't fetch panel HTML in single-file builds
- Don't skip manifest registration for reusable primitives
- Don't change panel width from 241px without updating all field CSS
- Don't break HoverButton's two `.text` nodes inside `.label`

## Build single-file export

```bash
node scripts/build-single-html.js
```

Edit `styles[]`, `scripts[]`, shell path, and output filename in the build script for new experiments.

## Additional resources

- Full experiment walkthrough → [examples.md](examples.md)
- Per-component options and CSS → [components-quick-ref.md](components-quick-ref.md)
- Authoritative project rules → `AGENTS.md`
- Complete component API → `docs/COMPONENTS.md`
