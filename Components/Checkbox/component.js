window.initCheckbox = function initCheckbox(root, options = {}) {
  const field = root.querySelector('.checkbox-field') || root;
  const labelEl = root.querySelector('.field-label');
  const rows = [...root.querySelectorAll('.checkbox-row')];
  const onChange = options.onChange;
  const icons = window.ComponentIcons || {};

  if (!rows.length) {
    throw new Error('initCheckbox: missing checkbox rows');
  }

  if (options.label && labelEl) {
    labelEl.textContent = options.label;
  }

  root.querySelectorAll('[data-icon="check"]').forEach((img) => {
    if (icons.check) img.src = icons.check;
  });

  root.querySelectorAll('[data-icon="check-indeterminate"]').forEach((img) => {
    if (icons['check-indeterminate']) img.src = icons['check-indeterminate'];
  });

  function getState(row) {
    if (row.classList.contains('is-indeterminate') || row.getAttribute('aria-checked') === 'mixed') {
      return 'indeterminate';
    }
    if (row.classList.contains('is-checked') || row.getAttribute('aria-checked') === 'true') {
      return 'checked';
    }
    return 'unchecked';
  }

  function applyState(row, state) {
    row.classList.toggle('is-checked', state === 'checked');
    row.classList.toggle('is-indeterminate', state === 'indeterminate');
    row.setAttribute(
      'aria-checked',
      state === 'indeterminate' ? 'mixed' : state === 'checked' ? 'true' : 'false'
    );
  }

  function nextState(state) {
    if (options.cycleIndeterminate) {
      if (state === 'unchecked') return 'checked';
      if (state === 'checked') return 'indeterminate';
      return 'unchecked';
    }

    return state === 'checked' ? 'unchecked' : 'checked';
  }

  function bindRow(row, index) {
    applyState(row, getState(row));

    row.addEventListener('click', () => {
      if (row.disabled) return;

      const state = nextState(getState(row));
      applyState(row, state);
      onChange?.(state, row, index);
    });

    return {
      element: row,
      getState: () => getState(row),
      getChecked: () => getState(row) === 'checked',
      setState(state, shouldNotify = false) {
        const next = state === 'indeterminate' || state === 'checked' ? state : 'unchecked';
        applyState(row, next);
        if (shouldNotify) onChange?.(next, row, index);
      },
      setChecked(checked, shouldNotify = false) {
        this.setState(checked ? 'checked' : 'unchecked', shouldNotify);
      },
      setDisabled(disabled) {
        row.disabled = Boolean(disabled);
        row.classList.toggle('is-disabled', Boolean(disabled));
      },
    };
  }

  const controls = rows.map(bindRow);
  const primary = controls[0];

  if (options.state) {
    primary.setState(options.state);
  } else if (typeof options.checked === 'boolean') {
    primary.setChecked(options.checked);
  }

  if (typeof options.disabled === 'boolean') {
    primary.setDisabled(options.disabled);
  }

  if (options.rowLabel) {
    const text = primary.element.querySelector('.checkbox-row__label');
    if (text) text.textContent = options.rowLabel;
  }

  return {
    element: field,
    rows: controls,
    getState: primary.getState,
    getChecked: primary.getChecked,
    setState: primary.setState,
    setChecked: primary.setChecked,
    setDisabled: primary.setDisabled,
  };
};
