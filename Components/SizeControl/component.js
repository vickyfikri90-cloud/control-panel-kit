window.initSizeControl = function initSizeControl(root, options = {}) {
  const utils = window.ComponentUtils;
  const icons = window.ComponentIcons || {};
  const field = root.querySelector('.size-control') || root;
  const widthInput = root.querySelector('[data-size-width]');
  const heightInput = root.querySelector('[data-size-height]');
  const lockBtn = root.querySelector('[data-size-lock]');
  const lockImg = lockBtn?.querySelector('img');
  const labelEl = root.querySelector('.field-label');

  if (!widthInput || !heightInput || !lockBtn) {
    throw new Error('initSizeControl: missing size control elements');
  }

  const min = options.min ?? 0;
  const max = options.max ?? Infinity;
  const precision = options.precision ?? 0;
  const onChange = options.onChange;

  if (options.label && labelEl) labelEl.textContent = options.label;

  const factor = 10 ** precision;
  const round = (n) => Math.round(n * factor) / factor;
  const clamp = (n) => Math.min(max, Math.max(min, n));
  const parse = (input, fallback) => {
    const n = parseFloat(String(input.value).trim());
    return Number.isFinite(n) ? n : fallback;
  };

  let width = clamp(round(options.width ?? parse(widthInput, 0)));
  let height = clamp(round(options.height ?? parse(heightInput, 0)));
  let locked = false;
  let ratio = null; // width / height, captured when the lock turns on

  function captureRatio() {
    ratio = width > 0 && height > 0 ? width / height : null;
  }

  function renderInputs(skip) {
    if (skip !== widthInput) widthInput.value = String(width);
    if (skip !== heightInput) heightInput.value = String(height);
  }

  function renderLock() {
    lockBtn.classList.toggle('is-active', locked);
    lockBtn.setAttribute('aria-pressed', locked ? 'true' : 'false');
    const label = locked ? 'Unlock aspect ratio' : 'Lock aspect ratio';
    lockBtn.setAttribute('aria-label', label);
    lockBtn.setAttribute('data-tooltip', label);
    if (lockImg) {
      const src = locked ? icons.link : icons['link-broken'];
      if (src) lockImg.src = src;
      lockImg.dataset.icon = locked ? 'link' : 'link-broken';
    }
  }

  function notify() {
    onChange?.({ width, height, locked });
  }

  // Typing in one side: that side follows the text, the other follows the ratio.
  function fromInput(input) {
    const isWidth = input === widthInput;
    const raw = parse(input, NaN);
    if (!Number.isFinite(raw)) return;

    const value = clamp(round(raw));
    if (isWidth) width = value; else height = value;

    if (locked) {
      if (!ratio) captureRatio();
      if (ratio) {
        if (isWidth) height = clamp(round(width / ratio));
        else width = clamp(round(height * ratio));
      }
    }

    // Keep what the user is typing; only rewrite it when it was clamped.
    renderInputs(value === raw ? input : null);
    notify();
  }

  [widthInput, heightInput].forEach((input) => {
    utils.bindInputBehavior(input);
    input.addEventListener('input', () => fromInput(input));
    utils.bindNumericArrowKey(input, () => fromInput(input), options.step ? { step: options.step } : {});
    input.addEventListener('blur', () => renderInputs());
  });

  function setLocked(next, shouldNotify = false) {
    locked = Boolean(next);
    if (locked) captureRatio();
    renderLock();
    if (shouldNotify) notify();
  }

  lockBtn.addEventListener('click', (event) => {
    event.preventDefault();
    setLocked(!locked, true);
  });

  renderInputs();
  setLocked(options.locked ?? lockBtn.getAttribute('aria-pressed') === 'true');

  return {
    element: field,
    widthInput,
    heightInput,
    lockButton: lockBtn,
    getValue: () => ({ width, height, locked }),
    getRatio: () => ratio,
    setValue(nextWidth, nextHeight, shouldNotify = false) {
      if (nextWidth != null) width = clamp(round(nextWidth));
      if (nextHeight != null) height = clamp(round(nextHeight));
      if (locked) captureRatio();
      renderInputs();
      if (shouldNotify) notify();
    },
    getLocked: () => locked,
    setLocked,
  };
};
