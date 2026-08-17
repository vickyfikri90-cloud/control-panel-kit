window.ComponentIndex = {
  async init() {
    const main = document.getElementById('component-index-main');
    if (!main) return;

    try {
      const components = window.CONTROL_PANEL_COMPONENTS.filter(
        (component) => component.group === 'primitive'
      );

      for (const meta of components) {
        main.appendChild(this.createCard(meta));
      }

      await this.mountAll(components);
    } catch (error) {
      console.error(error);
      main.innerHTML = `<p class="component-error">Gagal load components.<br><code>${error.message}</code></p>`;
    }
  },

  createCard(meta) {
    const card = document.createElement('section');
    card.className = 'component-card';
    card.dataset.componentId = meta.id;

    card.innerHTML = `
      <div class="component-card__header">
        <p class="component-card__name">${meta.name}</p>
        <p class="component-card__desc">${meta.description}</p>
      </div>
      <div class="component-card__preview" data-preview="${meta.id}"></div>
    `;

    return card;
  },

  async mountAll(components) {
    const loader = window.ComponentLoader;
    const demoOptions = {
      field: {},
      'input-wrap': { numeric: true, onChange() {} },
      'dimension-control': {
        initialMode: 'fixed',
        measure: () => 160,
        onChange() {},
      },
      'color-input': { onChange() {} },
      'snippet-output': {
        filename: 'demo.html',
        getContent: () => '<!-- your export -->',
      },
      slider: { min: 0, max: 100, value: 50, onChange() {} },
      'slider-tick': { min: 0, max: 100, value: 50, onChange() {} },
      divider: {},
      'option-selector': {
        options: [
          'Achilees',
          'Matt Demon',
          'Odessey',
          'Christopher Nolan',
          'Christian Bale',
          'James Gunn',
          'Jason',
        ],
        value: 'Jason',
        onChange() {},
      },
      toggle: { onChange() {} },
      checkbox: { onChange() {} },
      'cubic-bezier-input': { value: '0.7, 0, 0.25, 1', onChange() {} },
    };

    for (const meta of components) {
      const preview = document.querySelector(`[data-preview="${meta.id}"]`);
      if (!preview) continue;

      await loader.loadComponent(meta.id, preview, demoOptions[meta.id] || {});
    }
  },
};

document.addEventListener('DOMContentLoaded', () => {
  window.ComponentIndex.init();
});
