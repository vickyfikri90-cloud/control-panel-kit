# Experiment Examples

## Hover Button (reference implementation)

Files:
- Shell: `button-hover.shell.html`
- Logic: `button-hover-app.js`
- Preview: `Components/HoverButton/`
- Build: `scripts/build-single-html.js` → `button-hover.html`

### Wiring pattern to copy

```js
(function () {
  const utils = window.ComponentUtils;

  // 1. Init preview component in .cp-preview
  const preview = initHoverButton(document.querySelector('.cp-preview'), { /* defaults */ });
  const el = preview.element;

  // 2. Init panel controls
  const dims = initDimensionControlGroup(document, {
    width: { initialMode: 'hug', measure: () => el.offsetWidth, onChange: applyAll },
    height: { initialMode: 'fixed', measure: () => el.offsetHeight, onChange: applyAll },
  });
  const bgColor = initColorInput(document.getElementById('bg-color-root'), { onChange: applyAll });
  const snippet = initSnippetOutput(document.getElementById('snippet-root'), {
    filename: 'button-hover.html',
    getContent: generateSnippet,
    updateOnInit: false,
  });

  // 3. Bind bare inputs
  utils.bindInputWrapInputs(document);
  document.getElementById('label-text').addEventListener('input', applyAll);
  utils.bindNumericArrowKey(document.getElementById('padding-top'), applyAll);

  // 4. Single apply loop
  function applyAll() {
    preview.apply(getConfig());
    dims.width.updateLabel();
    dims.height.updateLabel();
    snippet.update();
  }

  function getConfig() {
    return {
      label: document.getElementById('label-text').value,
      width: dims.width.getValue(),
      height: dims.height.getValue(),
      bg: bgColor.getColor(),
      // ... all panel values
    };
  }

  function generateSnippet() {
    const c = getConfig();
    return `<!DOCTYPE html>
<html>
<head><style>/* escaped user values */</style></head>
<body><button>${utils.escapeHtml(c.label)}</button></body>
</html>`;
  }

  applyAll();
})();
```

### Panel HTML patterns from button-hover.shell.html

**Dimension row:**
```html
<div class="field">
  <span class="field-label">Dimensions</span>
  <div class="row">
    <div class="input-wrap input-wrap--dimension" data-dimension-id="width">
      <span class="input-icon">W</span>
      <div class="dimension-control">
        <span class="dimension-mode-label">Hug (0)</span>
        <input type="text" class="dimension-fixed-input" value="160">
      </div>
      <span class="chevron-wrap dimension-chevron" role="button" tabindex="0">
        <img src="" alt="" data-icon="chevron">
      </span>
      <div class="dimension-menu">
        <button type="button" data-dimension-mode="fixed">Fixed</button>
        <button type="button" data-dimension-mode="hug">Hug Content</button>
      </div>
    </div>
  </div>
</div>
```

**Color input root:**
```html
<div id="bg-color-root">
  <div class="field">
    <span class="field-label">Background</span>
    <div class="row color-wrap">
      <div class="input-wrap swatch-wrap">
        <span class="swatch" data-color-swatch></span>
      </div>
      <div class="input-wrap">
        <input type="text" data-color-hex value="F0F0F0">
      </div>
      <div class="input-wrap opacity-wrap">
        <input type="text" data-color-opacity value="100">
        <span class="opacity-suffix">%</span>
      </div>
    </div>
  </div>
</div>
```

**Snippet output:**
```html
<div id="snippet-root">
  <div class="field code-field">
    <span class="field-label">Snippet</span>
    <textarea readonly data-snippet-output></textarea>
    <button type="button" data-snippet-download>Download</button>
  </div>
</div>
```

---

## Starting a brand-new experiment

Example: `card-hover` experiment.

1. **Create `card-hover.shell.html`** — copy structure from `button-hover.shell.html`, replace preview markup with your component.

2. **Create `Components/CardHover/component.{js,css,html}`** — preview component with `apply(config)` method.

3. **Create `card-hover-app.js`** — wire panel controls to `CardHover.apply(getConfig())`.

4. **Create entry HTML** (or extend shell):
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Card Hover Experiment</title>
</head>
<body>
  <div id="app"></div>
  <script src="Components/experiment-tool.js"></script>
  <script src="Components/CardHover/component.js"></script>
  <script>
    (async () => {
      await ExperimentTool.load();
      await ExperimentTool.loadScript('Components/CardHover/component.css', 'card-hover-css');
      const res = await fetch('card-hover.shell.html');
      const shellHTML = await res.text();
      document.getElementById('app').innerHTML = shellHTML;
      await ExperimentTool.loadScript('card-hover-app.js', 'app');
    })();
  </script>
</body>
</html>
```

5. **Optional single-file build** — add entry to `scripts/build-single-html.js`.

---

## Component catalog

Open `Components/component-index.html` to preview every primitive with live demos.

When adding a new primitive, register in `components-manifest.js` and add a demo entry in `component-index.js` → `demoOptions`.
