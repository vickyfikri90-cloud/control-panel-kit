# Component Reference

Per-component API, CSS, dependencies, usage, and agent rules.

---

## Shared utilities

### `ComponentUtils` (`shared/utils.js`)

| Function | Purpose |
|----------|---------|
| `parsePx(value, fallback)` | Parse numeric px |
| `parseMs(value, fallback)` | Alias of parsePx |
| `parseOpacity(value, fallback)` | 0–1 or 0–100 → clamped 0–1 |
| `normalizeHex(value)` | `#RRGGBB` uppercase |
| `hexToRgba(hex, alpha)` | Hex → rgba string |
| `colorWithOpacity(color, opacity)` | Color string with alpha |
| `escapeHtml(value)` | Safe HTML for snippets |
| `bindInputBehavior(input)` | Select-all on focus/click |
| `bindInputWrapInputs(root)` | Apply to all `.input-wrap input` |
| `bindNumericArrowKey(input, onChange, { isOpacity })` | ↑↓ step (Shift = ±8) |
| `loadStylesheet(href, id)` / `loadScript(src, id)` | Deduped injectors |

### `ComponentIcons` (`shared/icons.js`)

Base64 SVG data URIs: `chevron`, `check`, `check-indeterminate`.

Used via `<img data-icon="chevron">` — populated at init.

### `base.css` tokens

- `.field` — 240px wide, 16px horizontal padding
- `.field-label` — 9px caps, 50% black
- `.row` — horizontal flex, 8px gap
- `.input-wrap` — 24px height, `#f5f5f5` bg, 5px radius

---

## Control Panel (shell)

**Folder:** `ControlPanel/` · **ID:** `control-panel` · **Group:** shell

Sidebar shell — preview area + scrollable panel container.

### Init

```js
initControlPanel(root)
```

**Returns:** `{ element, append(node), setHTML(html) }`

### CSS

| Class | Purpose |
|-------|---------|
| `.cp-app` | Root flex layout |
| `.cp-preview` | Left preview area |
| `.cp-preview-box` | Centered preview wrapper |
| `.panel` | Right sidebar (241px) |
| `.cp-app--fullscreen` | Full viewport mode |

### Usage

```js
await ControlPanelKit.load();
const shell = ControlPanelKit.createShell('#app', { previewHTML: '<div>...</div>' });
await ControlPanelKit.mountPanel(shell.panel, 'ControlPanel/demo-panel.html');
initControlPanel(shell.panel);
```

### Agent rules

- Panel is **241px** fixed width, scrollable
- Select via `[data-cp-panel]` or `.panel`
- Fullscreen: add `cp-app--fullscreen` to `.cp-app`

---

## Field

**Folder:** `Field/` · **ID:** `field` · **Group:** primitive

Label + input row wrapper for panel sections.

### Init

```js
initField(root)
```

**Returns:** `{ element }`

### HTML structure

```html
<div class="field">
  <label class="field-label" for="my-input">Label</label>
  <div class="row">
    <div class="input-wrap input-wrap--label">
      <input type="text" id="my-input" value="...">
    </div>
  </div>
</div>
```

### Agent rules

- Always wrap controls in `.field`
- Use `<label for>` or `<span class="field-label">`

---

## Input Wrap

**Folder:** `InputWrap/` · **ID:** `input-wrap` · **Group:** primitive

Text/number input with optional icon prefix; select-all on focus.

### Init

```js
initInputWrap(root, options)
```

### Options

| Option | Type | Description |
|--------|------|-------------|
| `onChange` | `function` | Fires on `input` |
| `numeric` | `boolean` | Enable arrow-key stepping |
| `isOpacity` | `boolean` | Clamp 0–100 when numeric |

**Returns:** `{ element, input, getValue(), setValue(value) }`

### CSS

`.input-wrap`, `.input-wrap--label`, `.input-icon`

### Usage

```js
const wrap = initInputWrap(document.querySelector('.input-wrap'), {
  numeric: true,
  onChange: applyAll,
});
```

### Agent rules

- Call `ComponentUtils.bindInputWrapInputs(root)` once per panel for bare inputs without initInputWrap

---

## Dimension Control

**Folder:** `DimensionControl/` · **ID:** `dimension-control` · **Group:** primitive

Figma-style Fixed / Hug Content dimension picker.

### Init

```js
initDimensionControl(root, options)
initDimensionControlGroup(root, configs)  // multiple dims
```

### Options (per control)

| Option | Type | Description |
|--------|------|-------------|
| `initialMode` | `'fixed'` \| `'hug'` | Starting mode |
| `measure` | `() => number` | Live size for Hug label |
| `onChange` | `function` | Mode or value change |

**Returns:** `{ element, getMode(), getValue(), setMode(), updateLabel(), closeMenu() }`

Group returns `{ width, height, ... }` keyed by `data-dimension-id`.

### HTML requirements

- `data-dimension-id="width"` on wrap
- `[data-dimension-mode="fixed|hug"]` buttons
- `[data-icon="chevron"]` img

### CSS

`.input-wrap--dimension`, `.dimension-control`, `.dimension-mode-label`, `.dimension-fixed-input`, `.dimension-menu`, `.is-fixed`, `.is-menu-open`, `.is-active`

### Events

- Document: `dimension-menu:close-all`
- Wrap: `dimension-menu:close`

### Usage

```js
const dims = initDimensionControlGroup(document, {
  width: { initialMode: 'hug', measure: () => el.offsetWidth, onChange: applyAll },
  height: { initialMode: 'fixed', measure: () => el.offsetHeight, onChange: applyAll },
});
// getValue() → 'auto' (hug) or '160' (fixed px string)
```

### Agent rules

- Hug mode returns `'auto'` for CSS
- Call `updateLabel()` after preview resize
- Only one dimension menu open at a time

---

## Color Input

**Folder:** `ColorInput/` · **ID:** `color-input` · **Group:** primitive

Hex + opacity fields with live swatch.

### Init

```js
initColorInput(root, options)
```

### Options

| Option | Type | Description |
|--------|------|-------------|
| `onChange` | `(color) => void` | Receives computed rgba/hex string |

**Returns:** `{ element, hexInput, opacityInput, getColor(), getHex(), updateUI() }`

### HTML data attributes

`[data-color-hex]`, `[data-color-opacity]`, `[data-color-swatch]`, optional `[data-color-preview]`

### CSS

`.color-wrap`, `.swatch`, `.opacity-wrap`, `.opacity-suffix`, `.color-preview`

### Usage

```js
const bg = initColorInput(document.getElementById('bg-root'), { onChange: applyAll });
btn.style.background = bg.getColor(); // rgba(240,240,240,1)
```

### Agent rules

- Hex accepts with or without `#`
- Opacity is 0–100 in UI, converted internally

---

## Snippet Output

**Folder:** `SnippetOutput/` · **ID:** `snippet-output` · **Group:** primitive

Readonly code textarea + download button.

### Init

```js
initSnippetOutput(root, options)
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `getContent` | `() => string` | `''` | Snippet generator |
| `filename` | `string` | `'snippet.html'` | Download filename |
| `updateOnInit` | `boolean` | `true` | Populate on init |

**Returns:** `{ element, output, update() }`

### HTML

`[data-snippet-output]`, `[data-snippet-download]`

### CSS

`.code-field`, `.snippet-output` (DM Mono 9px), `.download-btn`

### Usage

```js
const snippet = initSnippetOutput(root, {
  filename: 'hover-button.html',
  getContent: () => generateSnippet(),
});
// In applyAll:
snippet.update();
```

### Agent rules

- Always call `snippet.update()` in apply loop
- Use `escapeHtml` for user text in generated HTML

---

## Slider

**Folder:** `Slider/` · **ID:** `slider` · **Group:** primitive

Numeric input + draggable track/thumb.

### Init

```js
initSlider(root, options)
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `min`, `max` | `number` | 0, 100 | Range |
| `step` | `number` | 1 | Step when no ticks |
| `value` | `number` | from input | Initial + default (dblclick reset) |
| `tickCount` | `number` | 0 | ≥2 enables snap-to-tick |
| `onChange` | `(value) => void` | — | Value change |

**Returns:** `{ element, input, track, getValue(), setValue(), resetToDefault(), getTickValues(), getDefaultValue() }`

### CSS

`.slider-field`, `.slider-field__label`, `.slider-field__row`, `.slider-value-wrap`, `.slider-value-input`, `.slider-track-wrap`, `.slider-track`, `.slider-fill`, `.slider-thumb`

### Usage

```js
initSlider(el, { min: 0, max: 100, value: 50, onChange: () => applyAll() });
```

### Agent rules

- Requires all four DOM nodes: input, track, fill, thumb
- Double-click thumb resets to default
- Pointer drag uses global listeners

---

## Slider Tick

**Folder:** `SliderTick/` · **ID:** `slider-tick` · **Group:** primitive

Slider with visual tick marks; snaps to tick positions.

### Init

```js
initSliderTick(root, options)
```

Delegates to `initSlider` with `tickCount`. Defaults to count of `.slider-tick-mark` elements (or 7).

### Options

Same as Slider; `tickCount` should match HTML tick marks.

### CSS

`.slider-tick-field`, `.slider-tick-field__label`, `.slider-ticks`, `.slider-tick-mark` + shared slider classes

### Dependencies

**Slider/component.js must load first.**

### Agent rules

- Tick count in HTML (`.slider-tick-mark` spans) should match `tickCount` option

---

## Divider

**Folder:** `Divider/` · **ID:** `divider` · **Group:** primitive

Horizontal section separator in panel.

### Init

```js
initDivider(root)
```

**Returns:** `{ element }`

### HTML

```html
<div class="panel-divider">
  <span class="panel-divider__line" role="separator"></span>
</div>
```

### CSS

`.panel-divider`, `.panel-divider__line`

### Agent rules

- Purely presentational; no JS behavior beyond element lookup

---

## Option Selector

**Folder:** `OptionSelector/` · **ID:** `option-selector` · **Group:** primitive

Searchable dropdown — type to filter, keyboard nav, click to select.

### Init

```js
initOptionSelector(root, options)
```

### Options

| Option | Type | Description |
|--------|------|-------------|
| `options` | `string[]` or `{ value, label }[]` | Items list |
| `value` | `string` | Initial selected value |
| `label` | `string` | Override field label text |
| `onChange` | `(value, item) => void` | Selection callback |

**Returns:** `{ element, input, getValue(), getLabel(), setValue(), openMenu(), closeMenu() }`

### Events

Document `option-selector:close-all` with `{ detail: { except } }`

### CSS

`.option-selector`, `.option-selector__wrap`, `.option-selector__input`, `.option-selector__menu`, `.option-selector__option`, `.is-menu-open`, `.is-open`, `.is-active`

### Usage

```js
initOptionSelector(el, {
  options: ['A', 'B', 'C'],
  value: 'B',
  onChange: () => applyAll(),
});
```

### Agent rules

- Escape reverts to last selection
- Only one menu open globally
- Preview area may need `overflow: visible` when dropdown extends into preview

---

## Toggle

**Folder:** `Toggle/` · **ID:** `toggle` · **Group:** primitive

On/off switch row(s).

### Init

```js
initToggle(root, options)
```

### Options

| Option | Type | Description |
|--------|------|-------------|
| `label` | `string` | Field label |
| `rowLabel` | `string` | Primary row label text |
| `checked` | `boolean` | Initial state |
| `disabled` | `boolean` | Disable primary row |
| `onChange` | `(checked, row, index) => void` | Toggle callback |

**Returns:** `{ element, rows[], getChecked(), setChecked(), setDisabled() }`

### CSS

`.toggle-field`, `.toggle-stack`, `.toggle-row`, `.toggle-switch`, `.toggle-switch__knob`, `.toggle-row__label`, `.is-on`, `.is-disabled`

### Usage

```js
const toggle = initToggle(el, {
  label: 'Enable effect',
  rowLabel: 'Slide on hover',
  checked: true,
  onChange: () => applyAll(),
});
```

### Agent rules

- Primary control = `rows[0]`
- Uses `<button role="switch">`, not native checkbox

---

## Checkbox

**Folder:** `Checkbox/` · **ID:** `checkbox` · **Group:** primitive

Checked / unchecked / indeterminate states.

### Init

```js
initCheckbox(root, options)
```

### Options

| Option | Type | Description |
|--------|------|-------------|
| `label`, `rowLabel` | `string` | Labels |
| `checked` | `boolean` | Initial if no `state` |
| `state` | `'checked'` \| `'unchecked'` \| `'indeterminate'` | Initial state |
| `disabled` | `boolean` | Disable primary |
| `cycleIndeterminate` | `boolean` | Click cycles 3 states |
| `onChange` | `(state, row, index) => void` | State change |

**Returns:** `{ element, rows[], getState(), getChecked(), setState(), setChecked(), setDisabled() }`

### CSS

`.checkbox-field`, `.checkbox-stack`, `.checkbox-row`, `.checkbox-box`, `.checkbox-box__icon--check`, `.checkbox-box__icon--indeterminate`, `.is-checked`, `.is-indeterminate`, `.is-disabled`

### Usage

```js
initCheckbox(el, {
  cycleIndeterminate: true,
  onChange: () => applyAll(),
});
```

### Agent rules

- Icons must use `data-icon="check"` and `data-icon="check-indeterminate"`
- Default click toggles checked/unchecked only

---

## Cubic Bézier Input

**Folder:** `CubicBezierInput/` · **ID:** `cubic-bezier-input` · **Group:** primitive

Text input + draggable SVG curve editor for CSS `cubic-bezier()` easing.

### Init

```js
initCubicBezierInput(root, options)
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `value` | `string` | from input | Initial raw value (`0.7, 0, 0.25, 1` or full `cubic-bezier(...)`) |
| `onChange` | `(css) => void` | — | Receives computed CSS easing string |

**Returns:** `{ element, textInput, getRaw(), getValue(), getValues(), setRaw(), setValues(), updateUI() }`

### HTML data attributes

`[data-bezier-text]`, `[data-bezier-svg]`, `[data-bezier-curve]`, `[data-bezier-line1]`, `[data-bezier-line2]`, `[data-bezier-p1]`, `[data-bezier-p2]`, `[data-bezier-start]`, `[data-bezier-end]`

### CSS

`.cubic-bezier-field`, `.cubic-bezier-editor`, `.cubic-bezier-svg`, `.cubic-bezier-guide`, `.cubic-bezier-curve`, `.cubic-bezier-handle-line`, `.cubic-bezier-handle-bar`, `.cubic-bezier-handle`, `.cubic-bezier-value-input`

Editor: 208×200 SVG, `#F5F5F5` background, guide lines at y=25/175, handles `#4372FF` stroke r=6. Value input below editor with easing icon.

### Usage

```js
const easing = initCubicBezierInput(document.getElementById('easing-root'), {
  value: '0.7, 0, 0.25, 1',
  onChange: applyAll,
});

element.style.transitionTimingFunction = easing.getValue();
// easing.getRaw() → '0.7, 0, 0.25, 1'
// easing.getValues() → [0.7, 0, 0.25, 1]
```

### Agent rules

- Accepts comma-separated values or full `cubic-bezier(...)` string in text input
- X control points clamp to 0–1 (CSS requirement); Y allows overshoot (−0.5 to 1.5 in editor)
- Text and curve stay in sync; blur normalizes valid input
- Arrow keys on handles nudge by 0.01 (Shift = 0.05)

---

## HoverButton (experiment component)

**Folder:** `HoverButton/` · **Not in manifest**

Animated button — label slides on hover. Example experiment component, not part of the default kit.

### Init

```js
initHoverButton(root, options)
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `slideGap` | 100 | px gap beyond label width |
| `duration` | 350 | ms |
| `easingRaw` | `'0.7, 0, 0.25, 1'` | cubic-bezier parts or full string |

**Returns:** `{ element, texts, setLabel(), applyStyles(), setAnimation(), reset(), getSlideMetrics() }`

### HTML structure

Two `.text` spans inside `.label`; second has `.is-hidden`.

```html
<button class="hover-button">
  <span class="label">
    <span class="text">Hover here</span>
    <span class="text is-hidden">Hover here</span>
  </span>
</button>
```

### CSS

`.hover-button`, `.label`, `.text`, `.text.is-hidden`

### Usage

```js
const btn = initHoverButton(document.querySelector('.cp-preview'), {
  slideGap: 100, duration: 350, easingRaw: '0.7, 0, 0.25, 1',
});
btn.setLabel('Hover here');
btn.applyStyles({ background: '#f0f0f0', padding: '0 24px' });
```

### Agent rules

- Load manually: `ControlPanelKit.loadScript('HoverButton/component.js')`
- Do not break two-text-node structure
- Reference wiring: `hover-button-app.js`

---

## Manifest registration

Add to `components-manifest.js`:

```js
{
  id: 'my-control',
  name: 'My Control',
  description: '...',
  folder: 'MyControl',
  init: 'initMyControl',
  styles: ['MyControl/component.css'],
  group: 'primitive',  // or 'shell'
}
```

Load by ID via ComponentLoader:

```js
await ComponentLoader.loadComponent('my-control', targetElement, { onChange: applyAll });
```
