window.initInputWrap = function initInputWrap(root, options = {}) {
  const input = root.querySelector('input');
  const onChange = options.onChange;

  if (input) {
    window.ComponentUtils.bindInputBehavior(input);
  }

  if (input && onChange) {
    input.addEventListener('input', onChange);
  }

  if (input && options.numeric) {
    window.ComponentUtils.bindNumericArrowKey(input, onChange, options);
  }

  return {
    element: root.querySelector('.input-wrap') || root,
    input,
    getValue() {
      return input?.value ?? '';
    },
    setValue(value) {
      if (input) input.value = value;
    },
  };
};
