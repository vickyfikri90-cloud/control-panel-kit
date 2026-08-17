(function () {
  const STORAGE_KEY = 'cp-kit-experiment-defaults';
  const DEFAULT_EXPERIMENT = '2';

  window.ExperimentSettings = window.ExperimentSettings || {};

  const experiments = {
    1: { init: () => window.initExperiment1?.() },
    2: { init: () => window.initExperiment2?.() },
  };

  function loadDefaults() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function ensureAllExperimentsInited() {
    experiments['1'].init();
    experiments['2'].init();
  }

  function saveDefaults() {
    ensureAllExperimentsInited();

    const panels = {};
    Object.keys(window.ExperimentSettings).forEach((id) => {
      panels[id] = window.ExperimentSettings[id].collect();
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      experiment: selector.getValue(),
      panels,
    }));
  }

  const saved = loadDefaults();
  window.__pendingExperimentDefaults = saved?.panels || null;
  const startExperiment = saved?.experiment || DEFAULT_EXPERIMENT;

  const selector = window.initOptionSelector(document.getElementById('experiment-selector-root'), {
    label: 'Experiment',
    value: startExperiment,
    options: [
      { value: '1', label: 'Experiment 1' },
      { value: '2', label: 'Experiment 2' },
    ],
    onChange: (value) => switchExperiment(value),
  });

  document.getElementById('save-default-btn')?.addEventListener('click', saveDefaults);

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
