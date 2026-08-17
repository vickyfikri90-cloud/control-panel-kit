# Component Quick Reference

Use these kit primitives. Do not build custom panel controls when a kit component exists.

---

## Field + Input Wrap

Wrap every control in `.field`:

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

```js
const wrap = initInputWrap(document.querySelector('.input-wrap'), {
  numeric: true,
  onChange: applyAll,
});
// Returns: { element, input, getValue(), setValue(value) }
```

Call `ComponentUtils.bindInputWrapInputs(document)` once for bare inputs without initInputWrap.

Arrow keys: `utils.bindNumericArrowKey(input, applyAll)` — Shift = ±8. Opacity: `{ isOpacity: true }`.

---

## Dimension Control

Figma-style Fixed / Hug Content picker.

```js
const dims = initDimensionControlGroup(document, {
  width: {
    initialMode: 'hug',
    measure: () => el.offsetWidth,
    onChange: applyAll,
  },
  height: {
    initialMode: 'fixed',
    measure: () => el.offsetHeight,
    onChange: applyAll,
  },
});
// dims.width.getValue() → 'auto' (hug) or '160' (fixed px string)
```

HTML needs `data-dimension-id="width"`, `[data-dimension-mode="fixed|hug"]`, `[data-icon="chevron"]`.

After preview resize: `dims.width.updateLabel()` and `dims.height.updateLabel()`.

---

## Color Input

```js
const bg = initColorInput(document.getElementById('bg-root'), { onChange: applyAll });
btn.style.background = bg.getColor(); // rgba(...)
// Returns: { element, hexInput, opacityInput, getColor(), getHex(), updateUI() }
```

Data attrs: `[data-color-hex]`, `[data-color-opacity]`, `[data-color-swatch]`.

Opacity is 0–100 in UI. Hex accepts with or without `#`.

---

## Slider / Slider Tick

```js
initSlider(el, { min: 0, max: 100, value: 50, onChange: applyAll });
initSliderTick(el, { min: 0, max: 100, tickCount: 7, onChange: applyAll });
```

Slider needs four DOM nodes: input, track, fill, thumb. Double-click thumb resets to default.

SliderTick requires Slider/component.js loaded first. Tick count in HTML should match option.

---

## Cubic Bézier Input

```js
const easing = initCubicBezierInput(document.getElementById('easing-root'), {
  value: '0.7, 0, 0.25, 1',
  onChange: applyAll,
});
// Returns: { element, textInput, getRaw(), getValue(), getValues(), setRaw(), setValues() }
```

Text accepts `0.7, 0, 0.25, 1` or `cubic-bezier(...)`. Drag handles on the curve editor; arrow keys nudge (Shift = bigger step).

---

## Option Selector

```js
initOptionSelector(el, {
  options: ['A', 'B', 'C'], // or { value, label }[]
  value: 'B',
  onChange: applyAll,
});
// Returns: { element, input, getValue(), getLabel(), setValue(), openMenu(), closeMenu() }
```

Document event: `option-selector:close-all`.

---

## Toggle

```js
initToggle(el, { checked: true, disabled: false, onChange: applyAll });
// Returns: { element, getChecked(), setChecked(bool), setDisabled(bool) }
```

State class: `.is-on` on root.

---

## Checkbox

```js
initCheckbox(el, { checked: true, indeterminate: false, onChange: applyAll });
// Returns: { element, getChecked(), setChecked(), setIndeterminate() }
```

States: `.is-checked`, `.is-indeterminate`. Uses `ComponentIcons` for check marks.

---

## Divider

```html
<div class="panel-divider">
  <span class="panel-divider__line" role="separator"></span>
</div>
```

Presentational only. `initDivider(root)` returns `{ element }`.

---

## Snippet Output

```js
const snippet = initSnippetOutput(root, {
  filename: 'my-export.html',
  getContent: () => generateSnippet(),
  updateOnInit: false,
});
// In applyAll: snippet.update();
```

Always `escapeHtml` user text in generated snippets.

---

## Control Panel Shell

```js
await ControlPanelKit.load();
const shell = ControlPanelKit.createShell('#app', { previewHTML: '...' });
await ControlPanelKit.mountPanel(shell.panel, 'path/to/panel.html');
initControlPanel(shell.panel);
// Returns: { element, append(node), setHTML(html) }
```

Classes: `.cp-app`, `.cp-preview`, `.panel`, `.cp-app--fullscreen`.

---

## ComponentUtils helpers

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
| `bindNumericArrowKey(input, onChange, opts)` | ↑↓ step |
