# Control Panel Kit — Experiment Tool

Vanilla JS toolkit for UI experiments: **live preview** on the left, **Figma-style control panel** on the right, plus **HTML snippet export**.

No framework. No npm runtime dependency. Copy `Components/` into a new experiment or wire up from this repo.

## Quick start

### Run an existing experiment

Open in browser (local server recommended):

```bash
# Hover Button experiment (multi-file dev)
open button-hover.shell.html

# Or open the single-file build (shareable, works offline)
open button-hover.html

# Component catalog — preview every primitive
open Components/component-index.html
```

### Start a new experiment

1. Copy this repo (or just the `Components/` folder).
2. Create `{name}.shell.html` with preview markup + panel fields.
3. Create `{name}-app.js` — wire controls to preview via `applyAll()`.
4. Load the kit:

```html
<script src="Components/control-panel-kit.js"></script>
<script>
  (async () => {
    await ControlPanelKit.load();
    const shell = ControlPanelKit.createShell('#app', {
      previewHTML: '<div class="my-preview">...</div>',
    });
    // Panel HTML inline in shell file, or:
    // await ControlPanelKit.mountPanel(shell.panel, 'MyExperiment/panel.html');
    await ControlPanelKit.loadScript('my-experiment-app.js', 'app');
  })();
</script>
```

5. Optional: add `scripts/build-single-html.js` entry for a one-file export.

See **[AGENTS.md](./AGENTS.md)** for full agent adaptation rules and **[docs/COMPONENTS.md](./docs/COMPONENTS.md)** for per-component API.

## What's inside

```
Experiment Tool/
├── Components/                  # Reusable control panel kit
│   ├── control-panel-kit.js     # Bulk loader + shell helpers
│   ├── components-manifest.js   # Component registry
│   ├── components-templates.js  # Embedded HTML (single-file builds)
│   ├── components-loader.js     # Lazy-load one component
│   ├── shared/                  # utils, base.css, icons
│   ├── ControlPanel/            # Shell layout
│   ├── Field, InputWrap, ...    # Primitives (12 components)
│   └── HoverButton/             # Example experiment component
├── button-hover.shell.html      # Hover Button — dev markup
├── button-hover-app.js          # Hover Button — wiring logic
├── button-hover.html            # Built single-file output
└── scripts/build-single-html.js # Inliner for production HTML
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  .cp-app                                            │
│  ┌──────────────────────┐  ┌─────────────────────┐  │
│  │  .cp-preview         │  │  .panel (241px)     │  │
│  │  Your experiment     │  │  Field, ColorInput, │  │
│  │  lives here          │  │  Slider, Snippet…   │  │
│  └──────────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

Every control follows the same pattern:

```js
const ctrl = initColorInput(root, { onChange: applyAll });
// ctrl.getColor(), ctrl.setValue(), etc.
```

All panel changes flow through one **`applyAll()`** loop that updates preview + snippet export.

## Components

| Component | ID | Purpose |
|-----------|-----|---------|
| Control Panel | `control-panel` | Preview + sidebar shell |
| Field | `field` | Label + input row wrapper |
| Input Wrap | `input-wrap` | Text/number input with icon |
| Dimension Control | `dimension-control` | Fixed / Hug Content picker |
| Color Input | `color-input` | Hex + opacity + swatch |
| Snippet Output | `snippet-output` | Code preview + download |
| Slider | `slider` | Numeric input + draggable track |
| Slider Tick | `slider-tick` | Slider with snap ticks |
| Divider | `divider` | Section separator |
| Option Selector | `option-selector` | Searchable dropdown |
| Toggle | `toggle` | On/off switch |
| Checkbox | `checkbox` | Checked / unchecked / indeterminate |

**HoverButton** is an example experiment component — not in the manifest. Add it manually per project.

Full API, options, CSS classes, and agent rules → [docs/COMPONENTS.md](./docs/COMPONENTS.md)

## Design tokens

| Token | Value |
|-------|-------|
| Panel width | 241px |
| Field width | 240px |
| Control height | 24px |
| Field padding | 0 16px |
| Row gap | 8px |
| Input background | `#f5f5f5` |
| Focus border | `#9D9D9D` |
| Label font | Inter 500, 9px caps |
| Control font | Inter 500, 11px/16px |
| Code font | DM Mono 500, 9px |

## Build single-file HTML

```bash
node scripts/build-single-html.js
# → button-hover.html (all CSS/JS inlined)
```

To build a new experiment: edit `styles[]`, `scripts[]`, shell path, and output filename in the build script.

## For AI agents

Read **[AGENTS.md](./AGENTS.md)** before modifying or adapting this kit to a new project. It covers naming conventions, load order, `applyAll` pattern, and do/don't rules.

## License

MIT — use freely in personal and client experiments.
