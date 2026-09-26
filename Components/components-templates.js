window.COMPONENT_TEMPLATES = {
  'Field/component.html': `<div class="field">
  <label class="field-label" for="demo-label-text">Text Label</label>
  <div class="row">
    <div class="input-wrap input-wrap--label">
      <input type="text" id="demo-label-text" value="Hover here">
    </div>
  </div>
</div>`,

  'InputWrap/component.html': `<div class="input-wrap">
  <span class="input-icon">W</span>
  <input type="text" id="demo-input" value="160">
</div>`,

  'DimensionControl/component.html': `<div class="input-wrap input-wrap--dimension" data-dimension-id="width">
  <span class="input-icon">W</span>
  <div class="dimension-control">
    <span class="dimension-mode-label">Hug (0)</span>
    <input type="text" class="dimension-fixed-input" value="160">
  </div>
  <span class="chevron-wrap dimension-chevron" role="button" tabindex="0" aria-label="Width mode">
    <img src="" alt="" data-icon="chevron">
  </span>
  <div class="dimension-menu">
    <button type="button" data-dimension-mode="fixed">Fixed</button>
    <button type="button" data-dimension-mode="hug">Hug Content</button>
  </div>
</div>`,

  'ColorInput/component.html': `<div class="field">
  <span class="field-label">Background color</span>
  <div class="row">
    <div class="input-wrap color-wrap">
      <span class="swatch" data-color-swatch></span>
      <input type="text" data-color-hex value="F0F0F0">
      <div class="opacity-wrap">
        <input type="text" data-color-opacity value="100">
        <span class="opacity-suffix">%</span>
      </div>
    </div>
  </div>
  <div class="color-preview" data-color-preview></div>
</div>`,

  'SnippetOutput/component.html': `<div class="field code-field">
  <span class="field-label">Code</span>
  <textarea class="snippet-output" data-snippet-output readonly spellcheck="false"></textarea>
  <button type="button" class="download-btn" data-snippet-download>Download HTML</button>
</div>`,

  'ControlPanel/component.html': `<aside class="panel" data-control-panel></aside>`,

  'Slider/component.html': `<div class="slider-field">
  <span class="slider-field__label">Slider</span>
  <div class="slider-field__row">
    <div class="slider-value-wrap">
      <input type="text" class="slider-value-input" value="50" inputmode="numeric">
    </div>
    <div class="slider-track-wrap">
      <div class="slider-track">
        <div class="slider-fill"></div>
        <button type="button" class="slider-thumb" aria-label="Slider"></button>
      </div>
    </div>
  </div>
</div>`,

  'SliderTick/component.html': `<div class="slider-tick-field">
  <span class="slider-tick-field__label">Slider Tick</span>
  <div class="slider-field__row">
    <div class="slider-value-wrap">
      <input type="text" class="slider-value-input" value="50" inputmode="numeric">
    </div>
    <div class="slider-track-wrap">
      <div class="slider-track">
        <div class="slider-fill"></div>
        <div class="slider-ticks" aria-hidden="true">
          <span class="slider-tick-mark"></span>
          <span class="slider-tick-mark"></span>
          <span class="slider-tick-mark"></span>
          <span class="slider-tick-mark"></span>
          <span class="slider-tick-mark"></span>
          <span class="slider-tick-mark"></span>
          <span class="slider-tick-mark"></span>
        </div>
        <button type="button" class="slider-thumb" aria-label="Slider Tick"></button>
      </div>
    </div>
  </div>
</div>`,

  'Divider/component.html': `<div class="panel-divider">
  <span class="panel-divider__line" role="separator"></span>
</div>`,

  'OptionSelector/component.html': `<div class="field option-selector">
  <span class="field-label">Option Selector</span>
  <div class="row">
    <div class="input-wrap input-wrap--label option-selector__wrap">
      <input type="text" class="option-selector__input" value="Jason" autocomplete="off" spellcheck="false">
      <div class="option-selector__menu" role="listbox"></div>
    </div>
  </div>
</div>`,

  'Toggle/component.html': `<div class="field toggle-field">
  <span class="field-label">Toggle</span>
  <div class="toggle-stack">
    <button type="button" class="toggle-row is-on" role="switch" aria-checked="true">
      <span class="toggle-switch" aria-hidden="true">
        <span class="toggle-switch__knob"></span>
      </span>
      <span class="toggle-row__label">Toggle On</span>
    </button>
    <button type="button" class="toggle-row" role="switch" aria-checked="false">
      <span class="toggle-switch" aria-hidden="true">
        <span class="toggle-switch__knob"></span>
      </span>
      <span class="toggle-row__label">Toggle Off</span>
    </button>
    <button type="button" class="toggle-row is-disabled" role="switch" aria-checked="false" disabled>
      <span class="toggle-switch" aria-hidden="true">
        <span class="toggle-switch__knob"></span>
      </span>
      <span class="toggle-row__label">Toggle Disabled</span>
    </button>
  </div>
</div>`,

  'CubicBezierInput/component.html': `<div class="field cubic-bezier-field">
  <span class="field-label">Easing</span>
  <div class="cubic-bezier-editor" data-bezier-editor>
    <svg class="cubic-bezier-svg" data-bezier-svg viewBox="0 0 208 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="208" height="200" rx="5" fill="#F5F5F5"/>
      <line class="cubic-bezier-guide" x1="29" y1="25" x2="179" y2="25"/>
      <line class="cubic-bezier-guide" x1="29" y1="175" x2="179" y2="175"/>
      <path class="cubic-bezier-curve" data-bezier-curve></path>
      <line class="cubic-bezier-handle-line" data-bezier-line1></line>
      <line class="cubic-bezier-handle-line" data-bezier-line2></line>
      <circle class="cubic-bezier-handle" data-bezier-p1 r="6" tabindex="0" role="slider" aria-label="First control point"></circle>
      <circle class="cubic-bezier-handle" data-bezier-p2 r="6" tabindex="0" role="slider" aria-label="Second control point"></circle>
    </svg>
  </div>
  <div class="input-wrap cubic-bezier-value-input">
    <span class="input-icon"><img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDEuNjY3NTlDMTAgMS41NTcwOCA5Ljk1NjEgMS40NTExIDkuODc3OTYgMS4zNzI5NkM5Ljc5OTgyIDEuMjk0ODIgOS42OTM4NCAxLjI1MDkyIDkuNTgzMzQgMS4yNTA5MkM4LjYyOTM4IDEuMjUwNTUgNy42OTQyIDEuNTE2IDYuODgyNyAyLjAxNzVDNi4wNzEyIDIuNTE5IDUuNDE1NTEgMy4yMzY3MSA0Ljk4OTE3IDQuMDkwMDlMNC4yNjUgNS41MzkyNkMzLjkwNzg5IDYuMjU0MTEgMy4zNTg2NCA2Ljg1NTMyIDIuNjc4ODkgNy4yNzU0MkMxLjk5OTEzIDcuNjk1NTIgMS4yMTU3NiA3LjkxNzg5IDAuNDE2NjY4IDcuOTE3NTlDMC4zMDYxNjEgNy45MTc1OSAwLjIwMDE4IDcuOTYxNDkgMC4xMjIwNCA4LjAzOTYzQzAuMDQzODk5NyA4LjExNzc3IDkuMjM0MTVlLTA3IDguMjIzNzUgOS4yMzQxNWUtMDcgOC4zMzQyNkM5LjIzNDE1ZS0wNyA4LjQ0NDc3IDAuMDQzODk5NyA4LjU1MDc1IDAuMTIyMDQgOC42Mjg4OUMwLjIwMDE4IDguNzA3MDMgMC4zMDYxNjEgOC43NTA5MyAwLjQxNjY2OCA4Ljc1MDkzQzEuMzcwNjIgOC43NTEzIDIuMzA1ODEgOC40ODU4NCAzLjExNzMgNy45ODQzNEMzLjkyODggNy40ODI4NSA0LjU4NDUgNi43NjUxNCA1LjAxMDgzIDUuOTExNzZMNS43MzUgNC40NjI1OUM2LjA5MjEyIDMuNzQ3NzMgNi42NDEzNiAzLjE0NjUzIDcuMzIxMTIgMi43MjY0M0M4LjAwMDg3IDIuMzA2MzMgOC43ODQyNCAyLjA4Mzk2IDkuNTgzMzQgMi4wODQyNkM5LjY5Mzg0IDIuMDg0MjYgOS43OTk4MiAyLjA0MDM2IDkuODc3OTYgMS45NjIyMkM5Ljk1NjEgMS44ODQwOCAxMCAxLjc3ODEgMTAgMS42Njc1OVpNNS44MzMzNCAxLjY2NzU5QzUuODMzMzQgMS41NTcwOCA1Ljc4OTQ0IDEuNDUxMSA1LjcxMTMgMS4zNzI5NkM1LjYzMzE2IDEuMjk0ODIgNS41MjcxOCAxLjI1MDkyIDUuNDE2NjcgMS4yNTA5MkgzLjI3OTE3QzMuMTc4MTEgMC44NTc5NyAyLjkzNzExIDAuNTE1NDA4IDIuNjAxNCAwLjI4NzUzNUMyLjI2NTY5IDAuMDU5NjYyNCAxLjg1ODM2IC0wLjAzNzg1MyAxLjQ1NTg1IDAuMDEzMjkxMkMxLjA1MzM1IDAuMDY0NDM1NSAwLjY4MzM0NyAwLjI2MDcyMyAwLjQxNTI5NiAwLjU2NTMxMkMwLjE0NzI0NCAwLjg2OTkwMSAtMC4wMDA0MjYwNzEgMS4yNjE4NSA5LjIzNDE1ZS0wNyAxLjY2NzU5QzAuMDAxMTU2ODYgMi4wNzI0MSAwLjE0OTYxNCAyLjQ2Mjk3IDAuNDE3NjUxIDIuNzY2MzVDMC42ODU2ODkgMy4wNjk3MyAxLjA1NDk4IDMuMjY1MTggMS40NTY1OCAzLjMxNjJDMS44NTgxNyAzLjM2NzIzIDIuMjY0NjEgMy4yNzAzNSAyLjYgMy4wNDM2NUMyLjkzNTM5IDIuODE2OTUgMy4xNzY4MSAyLjQ3NTkyIDMuMjc5MTcgMi4wODQyNkg1LjQxNjY3QzUuNTI3MTggMi4wODQyNiA1LjYzMzE2IDIuMDQwMzYgNS43MTEzIDEuOTYyMjJDNS43ODk0NCAxLjg4NDA4IDUuODMzMzQgMS43NzgxIDUuODMzMzQgMS42Njc1OVpNMi41IDEuNjY3NTlDMi41IDEuODg4NiAyLjQxMjIgMi4xMDA1NyAyLjI1NTkyIDIuMjU2ODVDMi4wOTk2NCAyLjQxMzEzIDEuODg3NjggMi41MDA5MiAxLjY2NjY3IDIuNTAwOTJDMS40NDU2NSAyLjUwMDkyIDEuMjMzNjkgMi40MTMxMyAxLjA3NzQxIDIuMjU2ODVDMC45MjExMzIgMi4xMDA1NyAwLjgzMzMzNCAxLjg4ODYgMC44MzMzMzQgMS42Njc1OUMwLjgzMzMzNCAxLjQ0NjU4IDAuOTIxMTMyIDEuMjM0NjIgMS4wNzc0MSAxLjA3ODM0QzEuMjMzNjkgMC45MjIwNTUgMS40NDU2NSAwLjgzNDI1NyAxLjY2NjY3IDAuODM0MjU3QzEuODg3NjggMC44MzQyNTcgMi4wOTk2NCAwLjkyMjA1NSAyLjI1NTkyIDEuMDc4MzRDMi40MTMyIDEuMjM0NjIgMi41IDEuNDQ2NTggMi41IDEuNjY3NTlaTTEwIDguMzM0MjZDMTAuMDAxMyA3LjkyODE1IDkuODU0MDQgNy41MzU1OCA5LjU4NjA2IDcuMjMwNDRDOS4zMTgwOCA2LjkyNTI5IDguOTQ3ODEgNi43Mjg2MSA4LjU0NDk0IDYuNjc3NDFDOC4xNDIwNyA2LjYyNjIgNy43MzQzNyA2LjcyNDAxIDcuMzk4NTggNi45NTI0MUM3LjA2Mjc4IDcuMTgwODIgNi44MjIwNCA3LjUyNDA4IDYuNzIxNjcgNy45MTc1OUg0LjU4MzMzQzQuNDcyODMgNy45MTc1OSA0LjM2Njg1IDcuOTYxNDkgNC4yODg3MSA4LjAzOTYzQzQuMjEwNTcgOC4xMTc3NyA0LjE2NjY3IDguMjIzNzUgNC4xNjY2NyA4LjMzNDI2QzQuMTY2NjcgOC40NDQ3NyA0LjIxMDU3IDguNTUwNzUgNC4yODg3MSA4LjYyODg5QzQuMzY2ODUgOC43MDcwMyA0LjQ3MjgzIDguNzUwOTMgNC41ODMzMyA4Ljc1MDkzSDYuNzIxNjdDNi44MjIwNCA5LjE0NDQ0IDcuMDYyNzggOS40ODc3IDcuMzk4NTggOS43MTYxQzcuNzM0MzcgOS45NDQ1MSA4LjE0MjA3IDEwLjA0MjMgOC41NDQ5NCA5Ljk5MTExQzguOTQ3ODEgOS45Mzk5MSA5LjMxODA4IDkuNzQzMjMgOS41ODYwNiA5LjQzODA4QzkuODU0MDQgOS4xMzI5NCAxMC4wMDEzIDguNzQwMzcgMTAgOC4zMzQyNlpNOS4xNjY2NyA4LjMzNDI2QzkuMTY2NjcgOC41NTUyNyA5LjA3ODg3IDguNzY3MjMgOC45MjI1OSA4LjkyMzUxQzguNzY2MzEgOS4wNzk3OSA4LjU1NDM1IDkuMTY3NTkgOC4zMzMzNCA5LjE2NzU5QzguMTEyMzIgOS4xNjc1OSA3LjkwMDM2IDkuMDc5NzkgNy43NDQwOCA4LjkyMzUxQzcuNTg3OCA4Ljc2NzIzIDcuNSA4LjU1NTI3IDcuNSA4LjMzNDI2QzcuNSA4LjExMzI1IDcuNTg3OCA3LjkwMTI4IDcuNzQ0MDggNy43NDVDNy45MDAzNiA3LjU4ODcyIDguMTEyMzIgNy41MDA5MyA4LjMzMzM0IDcuNTAwOTNDOC41NTQzNSA3LjUwMDkzIDguNzY2MzEgNy41ODg3MiA4LjkyMjU5IDcuNzQ1QzkuMDc4ODcgNy45MDEyOCA5LjE2NjY3IDguMTEzMjUgOS4xNjY2NyA4LjMzNDI2WiIgZmlsbD0iYmxhY2siIGZpbGwtb3BhY2l0eT0iMC41Ii8+Cjwvc3ZnPgo=" alt=""></span>
    <input type="text" data-bezier-text value="0.7, 0, 0.25, 1" spellcheck="false" autocomplete="off">
  </div>
</div>`,

  'Checkbox/component.html': `<div class="field checkbox-field">
  <span class="field-label">Checkbox</span>
  <div class="checkbox-stack">
    <button type="button" class="checkbox-row is-checked" role="checkbox" aria-checked="true">
      <span class="checkbox-box" aria-hidden="true">
        <img class="checkbox-box__icon checkbox-box__icon--check" src="" alt="" data-icon="check">
        <img class="checkbox-box__icon checkbox-box__icon--indeterminate" src="" alt="" data-icon="check-indeterminate">
      </span>
      <span class="checkbox-row__label">Check Active</span>
    </button>
    <button type="button" class="checkbox-row is-indeterminate" role="checkbox" aria-checked="mixed">
      <span class="checkbox-box" aria-hidden="true">
        <img class="checkbox-box__icon checkbox-box__icon--check" src="" alt="" data-icon="check">
        <img class="checkbox-box__icon checkbox-box__icon--indeterminate" src="" alt="" data-icon="check-indeterminate">
      </span>
      <span class="checkbox-row__label">Check Indeterminate</span>
    </button>
    <button type="button" class="checkbox-row" role="checkbox" aria-checked="false">
      <span class="checkbox-box" aria-hidden="true">
        <img class="checkbox-box__icon checkbox-box__icon--check" src="" alt="" data-icon="check">
        <img class="checkbox-box__icon checkbox-box__icon--indeterminate" src="" alt="" data-icon="check-indeterminate">
      </span>
      <span class="checkbox-row__label">Check Inactive</span>
    </button>
  </div>
</div>`,

  'FileUpload/component.html': `<div class="field file-upload">
  <span class="field-label">File</span>
  <div class="row">
    <div class="input-wrap file-upload__wrap" role="button" tabindex="0" aria-label="Choose file">
      <span class="input-icon"><img src="" alt="" data-icon="file"></span>
      <span class="file-upload__name" data-upload-name>Choose file</span>
      <span class="upload-meta" data-upload-meta></span>
      <button type="button" class="upload-clear" data-upload-clear aria-label="Remove file" hidden><img src="" alt="" data-icon="close"></button>
      <input type="file" class="upload-file-input" tabindex="-1" aria-hidden="true">
    </div>
  </div>
</div>`,

  'ImageUpload/component.html': `<div class="field image-upload">
  <span class="field-label">Image</span>
  <div class="image-upload__drop" role="button" tabindex="0" aria-label="Choose image">
    <img class="image-upload__icon" src="" alt="" data-icon="upload">
    <span class="image-upload__hint">Drop image or click</span>
    <img class="image-upload__img" data-upload-image alt="">
    <input type="file" class="upload-file-input" accept="image/*" tabindex="-1" aria-hidden="true">
  </div>
  <div class="input-wrap input-wrap--label image-upload__file">
    <span class="image-upload__name" data-upload-name></span>
    <span class="upload-meta" data-upload-meta></span>
    <button type="button" class="upload-clear" data-upload-clear aria-label="Remove image" hidden><img src="" alt="" data-icon="close"></button>
  </div>
</div>`,

  'MultiImageUpload/component.html': `<div class="field multi-image-upload">
  <span class="field-label">Images</span>
  <div class="multi-image-upload__grid" role="list">
    <button type="button" class="multi-image-upload__add" aria-label="Add images"><img src="" alt="" data-icon="plus"></button>
    <input type="file" class="upload-file-input" accept="image/*" multiple tabindex="-1" aria-hidden="true">
  </div>
  <div class="multi-image-upload__footer">
    <span class="upload-meta" data-upload-count></span>
    <button type="button" class="multi-image-upload__clear" data-upload-clear hidden>Clear all</button>
  </div>
</div>`,

  'ColorSelector/component.html': `<div class="field color-selector">
  <span class="field-label">Fill</span>
  <div class="row">
    <div class="input-wrap color-wrap color-selector__wrap">
      <button type="button" class="color-selector__trigger" data-color-trigger aria-haspopup="dialog" aria-expanded="false" aria-label="Open color picker"><span class="swatch" data-color-swatch></span></button>
      <input type="text" data-color-hex value="4372FF" spellcheck="false" aria-label="Hex">
      <div class="opacity-wrap">
        <input type="text" data-color-opacity value="100" aria-label="Opacity">
        <span class="opacity-suffix">%</span>
      </div>
      <div class="color-selector__popover" role="dialog" aria-label="Color picker">
        <div class="color-selector__sv" data-color-sv tabindex="0" role="slider" aria-label="Saturation and brightness"><span class="color-selector__thumb"></span></div>
        <div class="color-selector__hue" data-color-hue tabindex="0" role="slider" aria-label="Hue" aria-valuemin="0" aria-valuemax="360"><span class="color-selector__thumb"></span></div>
        <div class="color-selector__alpha" data-color-alpha tabindex="0" role="slider" aria-label="Opacity" aria-valuemin="0" aria-valuemax="100"><span class="color-selector__alpha-fill"></span><span class="color-selector__thumb"></span></div>
        <div class="color-selector__hsb">
          <div class="input-wrap"><span class="input-icon">H</span><input type="text" data-color-h inputmode="numeric" aria-label="Hue (0–360)"></div>
          <div class="input-wrap"><span class="input-icon">S</span><input type="text" data-color-s inputmode="numeric" aria-label="Saturation (0–100)"></div>
          <div class="input-wrap"><span class="input-icon">B</span><input type="text" data-color-b inputmode="numeric" aria-label="Brightness (0–100)"></div>
          <button type="button" class="color-selector__eyedropper" data-color-eyedropper aria-label="Pick color from screen" aria-pressed="false" data-tooltip="Pick color from screen"><img src="" alt=""></button>
        </div>
      </div>
    </div>
  </div>
</div>`,

  'Tooltip/component.html': `<div class="field tooltip-demo">
  <span class="field-label">Tooltip</span>
  <div class="row">
    <div class="input-wrap" data-tooltip="Width in px">
      <span class="input-icon">W</span>
      <input type="text" value="160">
    </div>
    <div class="input-wrap" data-tooltip="Height in px" data-tooltip-placement="bottom">
      <span class="input-icon">H</span>
      <input type="text" value="48">
    </div>
  </div>
</div>`,

  'SizeControl/component.html': `<div class="field size-control">
  <span class="field-label">Size</span>
  <div class="row">
    <div class="input-wrap">
      <span class="input-icon">W</span>
      <input type="text" data-size-width value="160" inputmode="decimal" aria-label="Width">
    </div>
    <div class="input-wrap">
      <span class="input-icon">H</span>
      <input type="text" data-size-height value="48" inputmode="decimal" aria-label="Height">
    </div>
    <button type="button" class="size-control__lock" data-size-lock aria-pressed="false" aria-label="Lock aspect ratio"><img src="" alt=""></button>
  </div>
</div>`,
};

window.getComponentHTML = function getComponentHTML(folder) {
  return window.COMPONENT_TEMPLATES[`${folder}/component.html`] || '';
};
