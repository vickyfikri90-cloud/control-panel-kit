window.ExperimentTool = {
  _basePath: null,
  _loaded: false,

  styles: [
    'shared/base.css',
    'ControlPanel/component.css',
    'DimensionControl/component.css',
    'ColorInput/component.css',
    'SnippetOutput/component.css',
    'Slider/component.css',
    'SliderTick/component.css',
    'Divider/component.css',
    'OptionSelector/component.css',
    'Toggle/component.css',
    'Checkbox/component.css',
    'CubicBezierInput/component.css',
    'FileUpload/component.css',
    'ImageUpload/component.css',
    'MultiImageUpload/component.css',
    'ColorSelector/component.css',
    'Tooltip/component.css',
    'SizeControl/component.css',
  ],

  scripts: [
    'shared/utils.js',
    'shared/icons.js',
    'Field/component.js',
    'InputWrap/component.js',
    'DimensionControl/component.js',
    'ColorInput/component.js',
    'SnippetOutput/component.js',
    'Slider/component.js',
    'SliderTick/component.js',
    'Divider/component.js',
    'OptionSelector/component.js',
    'Toggle/component.js',
    'Checkbox/component.js',
    'CubicBezierInput/component.js',
    'FileUpload/component.js',
    'ImageUpload/component.js',
    'MultiImageUpload/component.js',
    'ColorSelector/component.js',
    'Tooltip/component.js',
    'SizeControl/component.js',
    'ControlPanel/component.js',
  ],

  getBasePath() {
    if (this._basePath) return this._basePath;

    const script = document.querySelector('script[src*="experiment-tool.js"]');
    if (script) {
      const src = script.getAttribute('src') || '';
      const dir = src.replace(/experiment-tool\.js(\?.*)?$/, '');
      this._basePath = dir || '.';
      return this._basePath;
    }

    this._basePath = './Components';
    return this._basePath;
  },

  resolve(path) {
    const base = this.getBasePath().replace(/\/$/, '');
    return `${base}/${path}`.replace(/\/+/g, '/');
  },

  loadStylesheet(href, id) {
    if (document.querySelector(`link[data-cp-style="${id}"]`)) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = this.resolve(href);
    link.dataset.cpStyle = id;
    document.head.appendChild(link);
  },

  loadScript(src, id) {
    if (document.querySelector(`script[data-cp-script="${id}"]`)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = this.resolve(src);
      script.dataset.cpScript = id;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  },

  async load() {
    if (this._loaded) return this;

    this.styles.forEach((href) => {
      this.loadStylesheet(href, href);
    });

    for (const src of this.scripts) {
      await this.loadScript(src, src);
    }

    this._loaded = true;
    return this;
  },

  createShell(container, options = {}) {
    const root = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!root) throw new Error('ExperimentTool.createShell: container not found');

    const previewHTML = options.previewHTML ?? '';
    root.innerHTML = `
      <div class="cp-app">
        <div class="cp-preview" data-cp-preview>${previewHTML}</div>
        <aside class="panel" data-cp-panel></aside>
      </div>
    `;

    return {
      root,
      app: root.querySelector('.cp-app'),
      preview: root.querySelector('[data-cp-preview]'),
      panel: root.querySelector('[data-cp-panel]'),
    };
  },

  async mountPanel(panel, htmlPath) {
    const embedded = window.COMPONENT_TEMPLATES?.[htmlPath];
    if (embedded) {
      panel.innerHTML = embedded;
      return panel;
    }

    const response = await fetch(this.resolve(htmlPath));
    if (!response.ok) {
      throw new Error(`Failed to load panel HTML (${response.status})`);
    }
    panel.innerHTML = await response.text();
    return panel;
  },

  bindInputListeners(inputs, onChange) {
    inputs.forEach((input) => {
      if (input instanceof HTMLInputElement) {
        input.addEventListener('input', onChange);
      }
    });
  },

  bindNumericInputs(inputs, onChange, options = {}) {
    const utils = window.ComponentUtils;
    inputs.forEach((input) => {
      if (input) utils.bindNumericArrowKey(input, onChange, options);
    });
  },
};
