window.initControlPanelDemo = function initControlPanelDemo(shell) {
  const kit = window.ControlPanelKit;
  const utils = window.ComponentUtils;
  const previewBox = document.createElement('div');
  previewBox.className = 'cp-preview-box';
  previewBox.textContent = 'Preview';
  shell.preview.innerHTML = '';
  shell.preview.appendChild(previewBox);

  const controls = {
    label: shell.panel.querySelector('#demo-label'),
    paddingTop: shell.panel.querySelector('#demo-padding-top'),
    paddingRight: shell.panel.querySelector('#demo-padding-right'),
    paddingBottom: shell.panel.querySelector('#demo-padding-bottom'),
    paddingLeft: shell.panel.querySelector('#demo-padding-left'),
    borderWidth: shell.panel.querySelector('#demo-border-width'),
    radius: shell.panel.querySelector('#demo-radius'),
  };

  const dimensions = window.initDimensionControlGroup(shell.panel, {
    width: {
      initialMode: 'fixed',
      measure: () => Math.max(Math.round(previewBox.offsetWidth), 0),
      onChange: applyPreview,
    },
    height: {
      initialMode: 'fixed',
      measure: () => Math.max(Math.round(previewBox.offsetHeight), 0),
      onChange: applyPreview,
    },
  });

  const bgColor = window.initColorInput(shell.panel.querySelector('#demo-bg-color'), {
    onChange: applyPreview,
  });

  const borderColor = window.initColorInput(shell.panel.querySelector('#demo-border-color'), {
    onChange: applyPreview,
  });

  const snippet = window.initSnippetOutput(shell.panel.querySelector('#demo-snippet'), {
    filename: 'preview.html',
    getContent: generateSnippet,
  });

  utils.bindInputWrapInputs(shell.panel);

  kit.bindInputListeners(Object.values(controls), applyPreview);
  kit.bindNumericInputs([
    controls.paddingTop,
    controls.paddingRight,
    controls.paddingBottom,
    controls.paddingLeft,
    controls.borderWidth,
    controls.radius,
  ], applyPreview);
  kit.bindNumericInputs([bgColor.opacityInput, borderColor.opacityInput], applyPreview, {
    isOpacity: true,
  });

  applyPreview();

  function getConfig() {
    const border = utils.parsePx(controls.borderWidth.value, 0);
    const borderCss = border === 0
      ? 'none'
      : `${border}px solid ${borderColor.getColor()}`;

    return {
      label: controls.label.value,
      width: dimensions.width.getValue(),
      height: dimensions.height.getValue(),
      paddingTop: utils.parsePx(controls.paddingTop.value, 16),
      paddingRight: utils.parsePx(controls.paddingRight.value, 24),
      paddingBottom: utils.parsePx(controls.paddingBottom.value, 16),
      paddingLeft: utils.parsePx(controls.paddingLeft.value, 24),
      background: bgColor.getColor(),
      borderCss,
      radius: utils.parsePx(controls.radius.value, 8),
    };
  }

  function toSize(value, fallback) {
    return String(value).toLowerCase() === 'auto'
      ? 'auto'
      : `${utils.parsePx(value, fallback)}px`;
  }

  function applyPreview() {
    const config = getConfig();

    previewBox.textContent = config.label;
    previewBox.style.background = config.background;
    previewBox.style.border = config.borderCss;
    previewBox.style.borderRadius = `${config.radius}px`;
    previewBox.style.padding = `${config.paddingTop}px ${config.paddingRight}px ${config.paddingBottom}px ${config.paddingLeft}px`;
    previewBox.style.width = toSize(config.width, 160);
    previewBox.style.height = toSize(config.height, 80);

    dimensions.width.updateLabel();
    dimensions.height.updateLabel();
    snippet.update();
  }

  function generateSnippet() {
    const config = getConfig();
    const label = utils.escapeHtml(config.label);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Preview</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      font-family: Inter, sans-serif;
    }

    .box {
      width: ${toSize(config.width, 160)};
      height: ${toSize(config.height, 80)};
      padding: ${config.paddingTop}px ${config.paddingRight}px ${config.paddingBottom}px ${config.paddingLeft}px;
      background: ${config.background};
      border: ${config.borderCss};
      border-radius: ${config.radius}px;
      display: grid;
      place-items: center;
    }
  </style>
</head>
<body>
  <div class="box">${label}</div>
</body>
</html>`;
  }

  return { shell, previewBox, applyPreview };
};
