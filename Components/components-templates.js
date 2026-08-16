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
};

window.getComponentHTML = function getComponentHTML(folder) {
  return window.COMPONENT_TEMPLATES[`${folder}/component.html`] || '';
};
