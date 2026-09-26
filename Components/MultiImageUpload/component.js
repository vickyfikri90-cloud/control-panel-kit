window.initMultiImageUpload = function initMultiImageUpload(root, options) {
  options = options || {};
  var utils = window.ComponentUtils;
  var field = root.querySelector('.multi-image-upload') || root;
  var grid = root.querySelector('.multi-image-upload__grid');
  var addTile = root.querySelector('.multi-image-upload__add');
  var input = root.querySelector('input[type="file"]');
  var countEl = root.querySelector('[data-upload-count]');
  var clearBtn = root.querySelector('[data-upload-clear]');
  var labelEl = root.querySelector('.field-label');
  if (!grid || !addTile || !input) throw new Error('initMultiImageUpload: missing multi image upload elements');

  var accept = options.accept || input.getAttribute('accept') || 'image/*';
  input.setAttribute('accept', accept);
  input.multiple = true;
  var max = options.max || Infinity;
  var maxSize = options.maxSize;
  var onChange = options.onChange;
  var onError = options.onError;
  var escapeHtml = (window.ComponentUtils && window.ComponentUtils.escapeHtml) || function (v) { return String(v); };
  var items = []; // { file, url, name, owned }

  if (options.label && labelEl) labelEl.textContent = options.label;
  utils.fillIcons(root);

  function render() {
    grid.querySelectorAll('.multi-image-upload__tile').forEach(function (tile) { tile.remove(); });
    items.forEach(function (item, index) {
      var tile = document.createElement('div');
      tile.className = 'multi-image-upload__tile';
      tile.setAttribute('role', 'listitem');
      tile.innerHTML =
        '<img class="multi-image-upload__img" alt="' + escapeHtml(item.name) + '" src="' + escapeHtml(item.url) + '">' +
        '<button type="button" class="upload-remove" data-upload-remove="' + index + '" aria-label="Remove ' + escapeHtml(item.name) + '">' +
        '<img src="' + ((window.ComponentIcons || {}).close || '') + '" alt=""></button>';
      grid.insertBefore(tile, addTile);
    });
    addTile.hidden = items.length >= max;
    field.classList.toggle('is-filled', items.length > 0);
    if (countEl) {
      countEl.textContent = items.length
        ? items.length + (max !== Infinity ? ' / ' + max : '') + (items.length === 1 ? ' image' : ' images')
        : (max !== Infinity ? 'Up to ' + max + ' images' : 'No images');
    }
    if (clearBtn) clearBtn.hidden = !items.length;
  }

  function notify() {
    if (onChange) onChange(items.map(function (i) { return i.file; }).filter(Boolean), items.slice());
  }

  function add(list, shouldNotify) {
    var added = 0;
    (list || []).forEach(function (entry) {
      if (items.length >= max) { if (onError) onError('max', entry); return; }
      if (typeof File !== 'undefined' && entry instanceof File) {
        if (!utils.acceptMatches(entry, accept)) { if (onError) onError('type', entry); return; }
        if (maxSize && entry.size > maxSize) { if (onError) onError('size', entry); return; }
        items.push({ file: entry, url: URL.createObjectURL(entry), name: entry.name, owned: true });
      } else if (entry && entry.url) {
        items.push({ file: null, url: entry.url, name: entry.name || 'Image', owned: false });
      } else {
        return;
      }
      added += 1;
    });
    render();
    if (added && shouldNotify !== false) notify();
    return added;
  }

  function remove(index, shouldNotify) {
    var item = items[index];
    if (!item) return;
    if (item.owned) URL.revokeObjectURL(item.url);
    items.splice(index, 1);
    render();
    if (shouldNotify !== false) notify();
    var next = grid.querySelector('[data-upload-remove="' + Math.min(index, items.length - 1) + '"]');
    (next || addTile).focus();
  }

  function clear(shouldNotify) {
    items.forEach(function (item) { if (item.owned) URL.revokeObjectURL(item.url); });
    items = [];
    render();
    if (shouldNotify !== false) notify();
  }

  utils.bindDropTarget(grid, input, function (files) { add(files); }, '.multi-image-upload__add');
  grid.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-upload-remove]');
    if (!btn) return;
    event.stopPropagation();
    remove(Number(btn.dataset.uploadRemove));
  });
  if (clearBtn) {
    clearBtn.addEventListener('click', function (event) {
      event.preventDefault();
      clear();
    });
  }

  if (options.value) add(options.value, false);
  else render();

  return {
    element: field,
    input: input,
    getFiles: function () { return items.map(function (i) { return i.file; }).filter(Boolean); },
    getItems: function () { return items.map(function (i) { return { file: i.file, url: i.url, name: i.name }; }); },
    add: function (list, shouldNotify) { return add(list, shouldNotify === true); },
    remove: function (index, shouldNotify) { remove(index, shouldNotify === true); },
    clear: function (shouldNotify) { clear(shouldNotify === true); },
  };
};
