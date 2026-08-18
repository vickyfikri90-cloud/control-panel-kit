#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

const styles = [
  'Components/shared/base.css',
  'Components/ControlPanel/component.css',
  'Components/DimensionControl/component.css',
  'Components/ColorInput/component.css',
  'Components/CubicBezierInput/component.css',
  'Components/SnippetOutput/component.css',
  'Components/OptionSelector/component.css',
  'Components/HoverButton/component.css',
  'Components/RotateXButton/component.css',
  'Components/RotateCarousel/component.css',
  'Components/RotateXCarousel/component.css',
].map(read).join('\n');

const scripts = [
  'Components/shared/icons.js',
  'Components/shared/utils.js',
  'Components/DimensionControl/component.js',
  'Components/ColorInput/component.js',
  'Components/CubicBezierInput/component.js',
  'Components/SnippetOutput/component.js',
  'Components/OptionSelector/component.js',
  'Components/HoverButton/component.js',
  'Components/RotateXButton/component.js',
  'Components/RotateCarousel/component.js',
  'Components/RotateXCarousel/component.js',
  'hover-button-app.js',
  'experiment-2-app.js',
  'experiment-3-app.js',
  'experiment-4-app.js',
  'experiment-4-5-app.js',
  'experiments-app.js',
].map(read).join('\n');

const body = read('experiments.shell.html');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Experiments</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@500&family=Inter:wght@500&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      font-family: Inter, system-ui, sans-serif;
      background: #fff;
      overflow: hidden;
    }

${styles}
  </style>
</head>
<body>
${body}
  <script>
${scripts}
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(root, 'experiments.html'), html);
console.log(`Built experiments.html (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`);

// Legacy single-experiment build (Experiment 1 only)
const hoverStyles = [
  'Components/shared/base.css',
  'Components/ControlPanel/component.css',
  'Components/DimensionControl/component.css',
  'Components/ColorInput/component.css',
  'Components/CubicBezierInput/component.css',
  'Components/SnippetOutput/component.css',
  'Components/HoverButton/component.css',
].map(read).join('\n');

const hoverScripts = [
  'Components/shared/icons.js',
  'Components/shared/utils.js',
  'Components/DimensionControl/component.js',
  'Components/ColorInput/component.js',
  'Components/CubicBezierInput/component.js',
  'Components/SnippetOutput/component.js',
  'Components/HoverButton/component.js',
  'hover-button-app.js',
].map(read).join('\n');

const hoverBody = read('hover-button.shell.html');

const hoverHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hover Button</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@500&family=Inter:wght@500&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      font-family: Inter, system-ui, sans-serif;
      background: #fff;
      overflow: hidden;
    }

${hoverStyles}
  </style>
</head>
<body>
${hoverBody}
  <script>
${hoverScripts}
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(root, 'hover-button.html'), hoverHtml);
console.log(`Built hover-button.html (${(Buffer.byteLength(hoverHtml) / 1024).toFixed(1)} KB)`);
