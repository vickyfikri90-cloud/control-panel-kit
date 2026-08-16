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
  'Components/SnippetOutput/component.css',
  'Components/HoverButton/component.css',
].map(read).join('\n');

const scripts = [
  'Components/shared/icons.js',
  'Components/shared/utils.js',
  'Components/DimensionControl/component.js',
  'Components/ColorInput/component.js',
  'Components/SnippetOutput/component.js',
  'Components/HoverButton/component.js',
  'hover-button-app.js',
].map(read).join('\n');

const body = read('hover-button.shell.html');

const html = `<!DOCTYPE html>
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

fs.writeFileSync(path.join(root, 'hover-button.html'), html);
console.log(`Built hover-button.html (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`);
