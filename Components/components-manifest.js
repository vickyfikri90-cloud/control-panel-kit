window.CONTROL_PANEL_COMPONENTS = [
  {
    id: 'control-panel',
    name: 'Control Panel',
    description: 'Sidebar shell — preview area + scrollable panel.',
    folder: 'ControlPanel',
    init: 'initControlPanel',
    styles: ['ControlPanel/component.css'],
    group: 'shell',
  },
  {
    id: 'field',
    name: 'Text Field',
    description: 'Wrapper label + input row untuk control panel.',
    folder: 'Field',
    init: 'initField',
    styles: [],
    group: 'primitive',
  },
  {
    id: 'input-wrap',
    name: 'Input Wrap',
    description: 'Text/number input with optional icon prefix.',
    folder: 'InputWrap',
    init: 'initInputWrap',
    styles: [],
    group: 'primitive',
  },
  {
    id: 'dimension-control',
    name: 'Dimension Control',
    description: 'Fixed / Hug Content selector.',
    folder: 'DimensionControl',
    init: 'initDimensionControl',
    styles: ['DimensionControl/component.css'],
    group: 'primitive',
  },
  {
    id: 'color-input',
    name: 'Color Input',
    description: 'Hex + opacity input with live swatch.',
    folder: 'ColorInput',
    init: 'initColorInput',
    styles: ['ColorInput/component.css'],
    group: 'primitive',
  },
  {
    id: 'snippet-output',
    name: 'Snippet Output',
    description: 'Readonly code output + download button.',
    folder: 'SnippetOutput',
    init: 'initSnippetOutput',
    styles: ['SnippetOutput/component.css'],
    group: 'primitive',
  },
  {
    id: 'slider',
    name: 'Slider',
    description: 'Numeric input + draggable slider control.',
    folder: 'Slider',
    init: 'initSlider',
    styles: ['Slider/component.css'],
    group: 'primitive',
  },
  {
    id: 'slider-tick',
    name: 'Slider Tick',
    description: 'Slider with tick marks on track.',
    folder: 'SliderTick',
    init: 'initSliderTick',
    styles: ['SliderTick/component.css'],
    group: 'primitive',
  },
  {
    id: 'divider',
    name: 'Divider',
    description: 'Horizontal separator for control panel sections.',
    folder: 'Divider',
    init: 'initDivider',
    styles: ['Divider/component.css'],
    group: 'primitive',
  },
  {
    id: 'option-selector',
    name: 'Option Selector',
    description: 'Searchable dropdown. Type to filter, click to select.',
    folder: 'OptionSelector',
    init: 'initOptionSelector',
    styles: ['OptionSelector/component.css'],
    group: 'primitive',
  },
  {
    id: 'toggle',
    name: 'Toggle',
    description: 'On / off switch. Disabled state supported.',
    folder: 'Toggle',
    init: 'initToggle',
    styles: ['Toggle/component.css'],
    group: 'primitive',
  },
  {
    id: 'checkbox',
    name: 'Checkbox',
    description: 'Checked, indeterminate, and unchecked states.',
    folder: 'Checkbox',
    init: 'initCheckbox',
    styles: ['Checkbox/component.css'],
    group: 'primitive',
  },
  {
    id: 'cubic-bezier-input',
    name: 'Cubic Bézier Input',
    description: 'Text + draggable curve editor for cubic-bezier easing.',
    folder: 'CubicBezierInput',
    init: 'initCubicBezierInput',
    styles: ['CubicBezierInput/component.css'],
    group: 'primitive',
  },
];

window.COMPONENTS = window.CONTROL_PANEL_COMPONENTS;

window.getComponent = function getComponent(id) {
  return window.COMPONENTS.find((component) => component.id === id);
};

window.getAllComponentIds = function getAllComponentIds() {
  return window.COMPONENTS.map((component) => component.id);
};
