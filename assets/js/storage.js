/* storage.js — Fortschritt im Browser speichern */

const Storage = (() => {
  const KEY = 'hls_quest_v1';

  const defaults = {
    started: null,
    hintsUsed: 0,
    hintsLog: [],
    answers: {},
    completed: {},
    unlockedBlocks: [1],
    exportedAt: null
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...defaults };
      return { ...defaults, ...JSON.parse(raw) };
    } catch {
      return { ...defaults };
    }
  }

  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Speichern fehlgeschlagen:', e);
    }
  }

  function get() { return load(); }

  function set(partial) {
    const current = load();
    const updated = { ...current, ...partial };
    save(updated);
    return updated;
  }

  function saveAnswer(taskId, value) {
    const data = load();
    data.answers[taskId] = { value, savedAt: Date.now() };
    save(data);
  }

  function markComplete(taskId) {
    const data = load();
    data.completed[taskId] = Date.now();
    save(data);
    updateMetrics();
  }

  function recordHint(hintId) {
    const data = load();
    data.hintsUsed = (data.hintsUsed || 0) + 1;
    data.hintsLog.push({ id: hintId, at: Date.now() });
    save(data);
    updateHintCounters();
  }

  function unlockBlock(blockNum) {
    const data = load();
    if (!data.unlockedBlocks.includes(blockNum)) {
      data.unlockedBlocks.push(blockNum);
      save(data);
    }
  }

  function updateHintCounters() {
    const data = load();
    const count = data.hintsUsed || 0;
    document.querySelectorAll('#sidebar-hint-count, #hint-count').forEach(el => {
      el.textContent = count;
    });
  }

  function updateMetrics() {
    const data = load();
    const completed = Object.keys(data.completed).length;
    const total = document.querySelectorAll('[data-task-id]').length || 12;
    const pct = Math.round((completed / total) * 100);
    const fill = document.querySelector('.cc-progress-fill');
    const val = document.querySelector('#tasks-completed');
    if (fill) fill.style.width = pct + '%';
    if (val) val.textContent = completed + '/' + total;
  }

  function exportData() {
    const data = load();
    data.exportedAt = Date.now();
    const json = JSON.stringify(data);
    const checksum = simpleHash(json);
    const payload = btoa(JSON.stringify({ data: json, checksum }));
    const blob = new Blob([payload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hls-quest-fortschritt.dat';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const decoded = JSON.parse(atob(e.target.result));
        const { data, checksum } = decoded;
        if (simpleHash(data) !== checksum) {
          alert('Datei wurde verändert oder ist beschädigt.');
          return;
        }
        localStorage.setItem(KEY, data);
        location.reload();
      } catch {
        alert('Ungültige Fortschrittsdatei.');
      }
    };
    reader.readAsText(file);
  }

  function simpleHash(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 0x01000193) >>> 0;
    }
    return h.toString(16);
  }

  function init() {
    const data = load();
    if (!data.started) set({ started: Date.now() });
    updateHintCounters();
    updateMetrics();

    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', e => {
        e.preventDefault();
        exportData();
      });
    }
  }

  return { get, set, saveAnswer, markComplete, recordHint,
           unlockBlock, exportData, importData, init };
})();

document.addEventListener('DOMContentLoaded', () => Storage.init());
