window.initDimensionControl = function initDimensionControl(root, options = {}) {
  const wrap = root.querySelector('.input-wrap--dimension') || root;
  const control = wrap.querySelector('.dimension-control');
  const modeLabel = wrap.querySelector('.dimension-mode-label');
  const menu = wrap.querySelector('.dimension-menu');
  const chevron = wrap.querySelector('.dimension-chevron');
  const fixedInput = wrap.querySelector('.dimension-fixed-input');
  const chevronImg = wrap.querySelector('[data-icon="chevron"]');

  if (chevronImg && window.ComponentIcons?.chevron) {
    chevronImg.src = window.ComponentIcons.chevron;
  }

  let mode = options.initialMode === 'fixed' ? 'fixed' : 'hug';
  const measure = options.measure || (() => 0);
  const onChange = options.onChange;

  function updateLabel() {
    if (mode !== 'hug') return;
    modeLabel.textContent = `Hug (${Math.max(Math.round(measure()), 0)})`;
  }

  function applyModeUI() {
    control.classList.toggle('is-fixed', mode === 'fixed');
    fixedInput.disabled = mode !== 'fixed';

    menu.querySelectorAll('[data-dimension-mode]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.dimensionMode === mode);
    });
  }

  function setMode(nextMode, shouldNotify = true) {
    const previousMode = mode;
    mode = nextMode === 'fixed' ? 'fixed' : 'hug';
    applyModeUI();

    if (mode === 'fixed') {
      if (previousMode === 'hug') {
        fixedInput.value = String(Math.max(Math.round(measure()), 0));
      }
    } else {
      updateLabel();
    }

    if (shouldNotify) onChange?.();
    else updateLabel();
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    wrap.classList.remove('is-menu-open');
  }

  function toggleMenu() {
    const willOpen = !menu.classList.contains('is-open');
    document.dispatchEvent(new CustomEvent('dimension-menu:close-all'));
    if (!willOpen) return;
    menu.classList.add('is-open');
    wrap.classList.add('is-menu-open');
  }

  menu.querySelectorAll('[data-dimension-mode]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      setMode(button.dataset.dimensionMode);
      closeMenu();
      // Focus only when the user picks Fixed, not on init/restore (it would
      // pop the keyboard on mobile).
      if (mode === 'fixed') {
        fixedInput.focus();
        fixedInput.select();
      }
    });
  });

  chevron.addEventListener('click', (event) => {
    event.preventDefault();
    toggleMenu();
  });

  modeLabel.addEventListener('click', (event) => {
    event.preventDefault();
    toggleMenu();
  });

  chevron.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleMenu();
    }
  });

  window.ComponentUtils.bindInputBehavior(fixedInput);

  fixedInput.addEventListener('input', () => onChange?.());

  window.ComponentUtils.bindNumericArrowKey(fixedInput, () => onChange?.());

  wrap.addEventListener('dimension-menu:close', closeMenu);

  document.addEventListener('click', (event) => {
    if (event.target.closest('.input-wrap--dimension') === wrap) return;
    closeMenu();
  });

  document.addEventListener('dimension-menu:close-all', closeMenu);

  setMode(mode, false);

  return {
    element: wrap,
    getMode: () => mode,
    getValue() {
      return mode === 'hug' ? 'auto' : fixedInput.value.trim();
    },
    setMode,
    updateLabel,
    closeMenu,
  };
};

window.initDimensionControlGroup = function initDimensionControlGroup(root, configs = {}) {
  const instances = {};

  root.querySelectorAll('.input-wrap--dimension').forEach((wrap) => {
    const key = wrap.dataset.dimensionId;
    if (!key || !configs[key]) return;
    instances[key] = initDimensionControl(wrap, configs[key]);
  });

  return instances;
};
