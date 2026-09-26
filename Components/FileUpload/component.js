window.initFileUpload = function initFileUpload(root, options) {
  options = options || {};
  var utils = window.ComponentUtils;
  var field = root.querySelector('.file-upload') || root;
  var wrap = root.querySelector('.file-upload__wrap');
  var input = root.querySelector('input[type="file"]');
  var nameEl = root.querySelector('[data-upload-name]');
  var metaEl = root.querySelector('[data-upload-meta]');
  var clearBtn = root.querySelector('[data-upload-clear]');
  var labelEl = root.querySelector('.field-label');
  if (!wrap || !input || !nameEl) throw new Error('initFileUpload: missing file upload elements');

  var accept = options.accept != null ? options.accept : input.getAttribute('accept') || '';
  if (accept) input.setAttribute('accept', accept);
  var placeholder = options.placeholder || nameEl.textContent || 'Choose file';
  var maxSize = options.maxSize;
  var onChange = options.onChange;
  var onError = options.onError;
  var file = null;

  if (options.label && labelEl) labelEl.textContent = options.label;
  utils.fillIcons(root);

  function render() {
    wrap.classList.toggle('is-filled', !!file);
    nameEl.textContent = file ? file.name : placeholder;
    nameEl.title = file ? file.name : '';
    if (metaEl) metaEl.textContent = file ? utils.formatFileSize(file.size) : '';
    if (clearBtn) clearBtn.hidden = !file;
  }

  function setFile(next, notify) {
    if (next && accept && !utils.acceptMatches(next, accept)) {
      if (onError) onError('type', next);
      return false;
    }
    if (next && maxSize && next.size > maxSize) {
      if (onError) onError('size', next);
      return false;
    }
    file = next || null;
    render();
    if (notify !== false && onChange) onChange(file);
    return true;
  }

  utils.bindDropTarget(wrap, input, function (files) { setFile(files[0]); });
  if (clearBtn) {
    clearBtn.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      setFile(null);
    });
  }

  render();

  return {
    element: field,
    input: input,
    getFile: function () { return file; },
    setFile: function (next, notify) { return setFile(next, notify === true); },
    clear: function (notify) { setFile(null, notify === true); },
    setDisabled: function (disabled) {
      wrap.classList.toggle('is-disabled', !!disabled);
      wrap.setAttribute('tabindex', disabled ? '-1' : '0');
      input.disabled = !!disabled;
    },
  };
};
