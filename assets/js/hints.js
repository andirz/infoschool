/* hints.js — Spoiler-Hinweise mit Counter */

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.cc-spoiler-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const spoiler = toggle.closest('.cc-spoiler');
      const content = spoiler.querySelector('.cc-spoiler-content');
      const hintId  = spoiler.dataset.hintId || 'unknown';
      const opened  = content.classList.contains('open');

      if (!opened) {
        content.classList.add('open');
        toggle.querySelector('.cc-hint-label').textContent = 'Hinweis verbergen';
        toggle.querySelector('i').className = 'fa-solid fa-eye-slash';
        if (!spoiler.dataset.counted) {
          spoiler.dataset.counted = '1';
          Storage.recordHint(hintId);
        }
      } else {
        content.classList.remove('open');
        toggle.querySelector('.cc-hint-label').textContent = 'Hinweis anzeigen';
        toggle.querySelector('i').className = 'fa-solid fa-eye';
      }
    });
  });

  document.querySelectorAll('.cc-input-area').forEach(area => {
    const taskId = area.dataset.taskId;
    if (!taskId) return;
    const saved = Storage.get().answers[taskId];
    if (saved) area.value = saved.value;
    area.addEventListener('input', () => {
      Storage.saveAnswer(taskId, area.value);
    });
  });

  document.querySelectorAll('.cc-task-done').forEach(btn => {
    btn.addEventListener('click', () => {
      const taskId = btn.dataset.taskId;
      Storage.markComplete(taskId);
      btn.textContent = '✓ Erledigt';
      btn.style.color = 'var(--green)';
      btn.style.borderColor = 'var(--green)';
      btn.disabled = true;
    });
  });
});
