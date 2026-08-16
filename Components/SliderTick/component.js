window.initSliderTick = function initSliderTick(root, options = {}) {
  const markCount = root.querySelectorAll('.slider-tick-mark').length;
  const tickCount = options.tickCount ?? (markCount || 7);

  return window.initSlider(root, { ...options, tickCount });
};
