(function () {
  const LEGACY_STORAGE_KEY = 'cp-kit-experiment-defaults';
  const STORAGE_PREFIX = 'cp-kit-experiment-defaults-';
  const ACTIVE_KEY = 'cp-kit-experiment-active';
  const DEFAULT_EXPERIMENT = 'button-rotate-x';
  // Old numeric ids → semantic ids, so saved defaults survive the rename.
  const NUMERIC_ID_MAP = {
    1: 'button-hover',
    2: 'button-rotate-x',
    3: 'carousel-rotate',
    '4.5': 'carousel-rotate-x',
    5: 'carousel-flip',
    6: 'transition-arc-scroll',
    7: 'carousel-infinite',
    8: 'parallax-horizontal',
    9: 'button-stagger-text',
  };
  const EXPERIMENT_IDS = [...Object.values(NUMERIC_ID_MAP), 'heading-entrance'];

  window.ExperimentSettings = window.ExperimentSettings || {};

  const experiments = {
    'button-hover': { init: () => window.initHoverButtonExperiment?.() },
    'button-rotate-x': { init: () => window.initRotateXButtonExperiment?.() },
    'carousel-rotate': { init: () => window.initRotateCarouselExperiment?.() },
    'carousel-rotate-x': { init: () => window.initRotateXCarouselExperiment?.() },
    'carousel-flip': { init: () => window.initFlipCarouselExperiment?.() },
    'transition-arc-scroll': { init: () => window.initArcScrollTransitionExperiment?.() },
    'carousel-infinite': { init: () => window.initInfiniteCarouselExperiment?.() },
    'parallax-horizontal': { init: () => window.initHorizontalParallaxExperiment?.() },
    'button-stagger-text': { init: () => window.initStaggerTextButtonExperiment?.() },
    'heading-entrance': { init: () => window.initHeadingEntranceExperiment?.() },
  };

  function loadExperimentDefaults(id) {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function saveExperimentDefaults(id, settings) {
    localStorage.setItem(`${STORAGE_PREFIX}${id}`, JSON.stringify(settings));
  }

  function loadActiveExperiment() {
    const id = localStorage.getItem(ACTIVE_KEY);
    return EXPERIMENT_IDS.includes(id) ? id : DEFAULT_EXPERIMENT;
  }

  function saveActiveExperiment(id) {
    localStorage.setItem(ACTIVE_KEY, id);
  }

  function migrateLegacyDefaults() {
    try {
      const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!raw) return;

      const saved = JSON.parse(raw);
      if (saved?.panels) {
        Object.entries(NUMERIC_ID_MAP).forEach(([oldId, id]) => {
          const panel = saved.panels[id] || saved.panels[oldId];
          if (panel && !loadExperimentDefaults(id)) {
            saveExperimentDefaults(id, panel);
          }
        });
      }

      if (saved?.experiment) {
        saveActiveExperiment(NUMERIC_ID_MAP[saved.experiment] || saved.experiment);
      }

      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // ignore invalid legacy payload
    }
  }

  function migrateNumericIds() {
    try {
      Object.entries(NUMERIC_ID_MAP).forEach(([oldId, newId]) => {
        const raw = localStorage.getItem(`${STORAGE_PREFIX}${oldId}`);
        if (raw == null) return;
        if (localStorage.getItem(`${STORAGE_PREFIX}${newId}`) == null) {
          localStorage.setItem(`${STORAGE_PREFIX}${newId}`, raw);
        }
        localStorage.removeItem(`${STORAGE_PREFIX}${oldId}`);
      });
      const active = localStorage.getItem(ACTIVE_KEY);
      if (active && NUMERIC_ID_MAP[active]) localStorage.setItem(ACTIVE_KEY, NUMERIC_ID_MAP[active]);
    } catch {
      // ignore storage errors
    }
  }

  migrateLegacyDefaults();
  migrateNumericIds();

  window.__pendingExperimentDefaults = Object.fromEntries(
    EXPERIMENT_IDS.map((id) => [id, loadExperimentDefaults(id)])
  );

  const startExperiment = loadActiveExperiment();

  const selector = window.initOptionSelector(document.getElementById('experiment-selector-root'), {
    label: 'Experiment',
    value: startExperiment,
    options: [
      { value: 'button-hover', label: 'Button Hover' },
      { value: 'button-rotate-x', label: 'Button Rotate X' },
      { value: 'carousel-rotate', label: 'Carousel Rotate' },
      { value: 'carousel-rotate-x', label: 'Carousel Rotate X' },
      { value: 'carousel-flip', label: 'Carousel Flip' },
      { value: 'transition-arc-scroll', label: 'Transition Arc Scroll' },
      { value: 'carousel-infinite', label: 'Carousel Infinite' },
      { value: 'parallax-horizontal', label: 'Parallax Horizontal' },
      { value: 'button-stagger-text', label: 'Button Stagger Text' },
      { value: 'heading-entrance', label: 'Heading Entrance' },
    ],
    onChange: (value) => switchExperiment(value),
  });

  document.getElementById('save-default-btn')?.addEventListener('click', saveDefaults);

  function saveDefaults() {
    const id = selector.getValue();
    experiments[id]?.init();

    const settings = window.ExperimentSettings[id]?.collect?.();
    if (!settings) return;

    saveExperimentDefaults(id, settings);
    saveActiveExperiment(id);
    window.__pendingExperimentDefaults[id] = settings;
  }

  function switchExperiment(id) {
    document.querySelectorAll('[data-experiment-preview]').forEach((node) => {
      node.hidden = node.dataset.experimentPreview !== id;
    });

    document.querySelectorAll('[data-experiment-panel]').forEach((node) => {
      node.hidden = node.dataset.experimentPanel !== id;
    });

    experiments[id]?.init();
  }

  selector.setValue(startExperiment);
  switchExperiment(startExperiment);
})();
