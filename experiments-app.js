(function () {
  const LEGACY_STORAGE_KEY = 'cp-kit-experiment-defaults';
  const STORAGE_PREFIX = 'cp-kit-experiment-defaults-';
  const ACTIVE_KEY = 'cp-kit-experiment-active';
  const DEFAULT_EXPERIMENT = '2';
  const EXPERIMENT_IDS = ['1', '2', '3', '4', '4.5'];

  window.ExperimentSettings = window.ExperimentSettings || {};

  const experiments = {
    1: { init: () => window.initExperiment1?.() },
    2: { init: () => window.initExperiment2?.() },
    3: { init: () => window.initExperiment3?.() },
    4: { init: () => window.initExperiment4?.() },
    '4.5': { init: () => window.initExperiment4_5?.() },
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
    return localStorage.getItem(ACTIVE_KEY) || DEFAULT_EXPERIMENT;
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
        EXPERIMENT_IDS.forEach((id) => {
          if (saved.panels[id] && !loadExperimentDefaults(id)) {
            saveExperimentDefaults(id, saved.panels[id]);
          }
        });
      }

      if (saved?.experiment) {
        saveActiveExperiment(saved.experiment);
      }

      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // ignore invalid legacy payload
    }
  }

  migrateLegacyDefaults();

  window.__pendingExperimentDefaults = Object.fromEntries(
    EXPERIMENT_IDS.map((id) => [id, loadExperimentDefaults(id)])
  );

  const startExperiment = loadActiveExperiment();

  const selector = window.initOptionSelector(document.getElementById('experiment-selector-root'), {
    label: 'Experiment',
    value: startExperiment,
    options: [
      { value: '1', label: 'Experiment 1' },
      { value: '2', label: 'Experiment 2' },
      { value: '3', label: 'Experiment 3' },
      { value: '4', label: 'Experiment 4' },
      { value: '4.5', label: 'Experiment 4.5' },
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
