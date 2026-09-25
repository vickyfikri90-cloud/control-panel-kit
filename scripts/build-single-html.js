#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function escapeTemplate(str) {
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

function escapeForInlineScript(str) {
  return str.replace(/<\/script/gi, '<\\/script');
}

function svgToDataUri(svg) {
  return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
}

const snippetCss = read('Components/InfiniteCarousel/component.css');
const snippetJs = escapeForInlineScript(read('Components/InfiniteCarousel/component.js'));
const snippetHeadingSrc = svgToDataUri(read('Components/InfiniteCarousel/assets/heading.svg'));

const snippetEmbed = `window.InfiniteCarouselSnippet = {
  css: \`${escapeTemplate(snippetCss)}\`,
  js: \`${escapeTemplate(snippetJs)}\`,
  headingSrc: ${JSON.stringify(snippetHeadingSrc)},
};\n`;
fs.writeFileSync(path.join(root, 'experiment-7-snippet-embed.js'), snippetEmbed);
console.log(`Built experiment-7-snippet-embed.js (${(Buffer.byteLength(snippetEmbed) / 1024).toFixed(1)} KB)`);

const staggerSnippetJs = escapeForInlineScript(read('Components/StaggerTextButton/component.js'));
const staggerSnippetEmbed = `window.StaggerTextButtonSnippetJs = \`${escapeTemplate(staggerSnippetJs)}\`;\n`;
fs.writeFileSync(path.join(root, 'experiment-9-snippet-embed.js'), staggerSnippetEmbed);
console.log(`Built experiment-9-snippet-embed.js (${(Buffer.byteLength(staggerSnippetEmbed) / 1024).toFixed(1)} KB)`);

const styles = [
  'Components/shared/base.css',
  'Components/ControlPanel/component.css',
  'Components/DimensionControl/component.css',
  'Components/ColorInput/component.css',
  'Components/CubicBezierInput/component.css',
  'Components/Slider/component.css',
  'Components/SnippetOutput/component.css',
  'Components/OptionSelector/component.css',
  'Components/Toggle/component.css',
  'Components/HoverButton/component.css',
  'Components/RotateXButton/component.css',
  'Components/RotateCarousel/component.css',
  'Components/RotateXCarousel/component.css',
  'Components/FlipCarousel/component.css',
  'Components/ArcScrollTransition/component.css',
  'Components/InfiniteCarousel/component.css',
  'Components/HorizontalParallax/component.css',
  'Components/StaggerTextButton/component.css',
].map(read).join('\n');

const scripts = [
  'Components/shared/icons.js',
  'Components/shared/utils.js',
  'Components/DimensionControl/component.js',
  'Components/ColorInput/component.js',
  'Components/CubicBezierInput/component.js',
  'Components/Slider/component.js',
  'Components/SnippetOutput/component.js',
  'Components/OptionSelector/component.js',
  'Components/Toggle/component.js',
  'Components/HoverButton/component.js',
  'Components/RotateXButton/component.js',
  'Components/RotateCarousel/component.js',
  'Components/RotateXCarousel/component.js',
  'Components/FlipCarousel/component.js',
  'Components/ArcScrollTransition/component.js',
  'Components/InfiniteCarousel/component.js',
  'Components/HorizontalParallax/component.js',
  'Components/StaggerTextButton/component.js',
  'hover-button-app.js',
  'experiment-2-app.js',
  'experiment-3-app.js',
  'experiment-4-5-app.js',
  'experiment-5-app.js',
  'experiment-6-app.js',
  'experiment-7-snippet-embed.js',
  'experiment-7-app.js',
  'experiment-8-app.js',
  'experiment-9-snippet-embed.js',
  'experiment-9-app.js',
  'experiments-app.js',
].map(read).join('\n');

const body = read('experiments.shell.html');

const shellEmbed = `window.EXPERIMENTS_SHELL_HTML = \`${escapeTemplate(body)}\`;\n`;
fs.writeFileSync(path.join(root, 'experiments-shell-embed.js'), shellEmbed);
console.log(`Built experiments-shell-embed.js (${(Buffer.byteLength(shellEmbed) / 1024).toFixed(1)} KB)`);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1">
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1">
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
