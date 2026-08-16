window.ComponentLoader = {
  _basePath: null,

  getBasePath() {
    if (this._basePath) return this._basePath;

    const script = document.querySelector('script[src*="components-loader.js"]');
    if (script) {
      const src = script.getAttribute('src') || '';
      const dir = src.replace(/components-loader\.js(\?.*)?$/, '');
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

  async loadShared() {
    if (!window.ComponentUtils) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = this.resolve('shared/utils.js');
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    window.ComponentUtils.loadStylesheet(this.resolve('shared/base.css'), 'shared-base');

    if (!window.ComponentIcons) {
      await window.ComponentUtils.loadScript(this.resolve('shared/icons.js'), 'shared-icons');
    }
  },

  ensureStyles(styles = []) {
    styles.forEach((href) => {
      window.ComponentUtils.loadStylesheet(this.resolve(href), href);
    });
  },

  async loadScriptForComponent(meta) {
    if (typeof window[meta.init] === 'function') return;

    await window.ComponentUtils.loadScript(
      this.resolve(`${meta.folder}/component.js`),
      meta.id
    );
  },

  async getHTML(meta) {
    const embedded = window.getComponentHTML?.(meta.folder);
    if (embedded) return embedded;

    const response = await fetch(this.resolve(`${meta.folder}/component.html`));
    if (!response.ok) {
      throw new Error(`Failed to load ${meta.name} HTML (${response.status})`);
    }
    return response.text();
  },

  async loadComponent(id, target, options = {}) {
    const meta = window.getComponent(id);
    if (!meta) throw new Error(`Unknown component: ${id}`);

    await this.loadShared();
    this.ensureStyles(meta.styles || []);

    const html = await this.getHTML(meta);
    target.innerHTML = html;

    await this.loadScriptForComponent(meta);

    const initFn = window[meta.init];
    if (typeof initFn !== 'function') {
      throw new Error(`Missing init function: ${meta.init}`);
    }

    return initFn(target, options);
  },

  async loadComponents(entries) {
    await this.loadShared();

    const results = {};
    for (const entry of entries) {
      const { id, target, options } = entry;
      results[id] = await this.loadComponent(id, target, options);
    }
    return results;
  },

  async loadStylesForAll() {
    await this.loadShared();
    window.COMPONENTS.forEach((component) => {
      this.ensureStyles(component.styles || []);
    });
  },
};
