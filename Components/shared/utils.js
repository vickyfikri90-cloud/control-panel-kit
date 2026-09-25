window.ComponentUtils = {
  parsePx(value, fallback) {
    const n = parseFloat(String(value).trim());
    return Number.isFinite(n) ? n : fallback;
  },

  parseMs(value, fallback) {
    return this.parsePx(value, fallback);
  },

  parseOpacity(value, fallback = 1) {
    const n = parseFloat(String(value).trim());
    if (!Number.isFinite(n)) return fallback;
    const opacity = n > 1 ? n / 100 : n;
    return Math.min(Math.max(opacity, 0), 1);
  },

  normalizeHex(value) {
    let hex = String(value).trim().replace(/^#/, '');
    if (/^[0-9a-fA-F]{3}$/.test(hex)) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    return /^[0-9a-fA-F]{6}$/.test(hex) ? `#${hex.toUpperCase()}` : value.trim();
  },

  hexToRgba(hex, alpha) {
    let h = this.normalizeHex(hex).replace('#', '');
    if (h.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(h)) return hex;

    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  colorWithOpacity(colorValue, opacityValue) {
    const color = this.normalizeHex(colorValue);
    const opacity = this.parseOpacity(opacityValue, 1);

    if (!color) return `rgba(0, 0, 0, ${opacity})`;
    if (color.startsWith('rgba(') || color.startsWith('hsla(')) return color;
    if (color.startsWith('#')) return this.hexToRgba(color, opacity);
    if (color.startsWith('rgb(')) {
      return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
    }

    return color;
  },

  escapeHtml(value) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  bindInputBehavior(input) {
    if (!input || input.dataset.inputBehaviorBound) return;

    input.dataset.inputBehaviorBound = 'true';

    input.addEventListener('mousedown', (event) => {
      if (document.activeElement === input) {
        event.preventDefault();
      }
    });

    input.addEventListener('focus', () => {
      requestAnimationFrame(() => {
        if (document.activeElement !== input) return;
        input.select();
      });
    });
  },

  bindInputWrapInputs(root = document) {
    root.querySelectorAll('.input-wrap input').forEach((input) => {
      this.bindInputBehavior(input);
    });
  },

  // Binding the same input more than once (e.g. by a component and again by
  // the experiment app) shares one keydown handler, so each key press steps
  // once and every registered onChange still runs.
  // Step is 1 (Shift: 8) by default; set `options.step` or `data-arrow-step`
  // for fine-grained fields (e.g. 0.1 for scale, Shift steps 10×).
  bindNumericArrowKey(input, onChange, options = {}) {
    if (!input) return;

    let binding = input.__numericArrowKey;
    if (binding) {
      if (onChange) binding.handlers.push(onChange);
      if (options.isOpacity) binding.isOpacity = true;
      if (options.step != null) binding.step = options.step;
      return;
    }

    binding = {
      handlers: onChange ? [onChange] : [],
      isOpacity: !!options.isOpacity,
      step: options.step,
    };
    input.__numericArrowKey = binding;

    input.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;

      event.preventDefault();

      const raw = input.value.trim();
      const match = raw.match(/^(-?\d*\.?\d+)(.*)$/);
      if (!match) return;

      const base = Number(binding.step ?? input.dataset.arrowStep) || 1;
      const step = event.shiftKey ? (base === 1 ? 8 : base * 10) : base;
      const delta = event.key === 'ArrowUp' ? step : -step;

      let next = Math.round((parseFloat(match[1]) + delta) * 1e6) / 1e6;
      const suffix = match[2];

      if (binding.isOpacity) {
        next = Math.min(100, Math.max(0, next));
      }

      input.value = `${next}${suffix}`;
      binding.handlers.forEach((handler) => handler());
    });
  },

  loadStylesheet(href, id) {
    if (document.querySelector(`link[data-component-style="${id}"]`)) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.componentStyle = id;
    document.head.appendChild(link);
  },

  loadScript(src, id) {
    if (document.querySelector(`script[data-component-script="${id}"]`)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.dataset.componentScript = id;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  },
};
