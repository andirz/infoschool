/* block1.js — Passwort-Stärkemesser */

document.addEventListener('DOMContentLoaded', () => {
  const input    = document.getElementById('pw-input');
  const bars     = [1,2,3,4].map(i => document.getElementById('bar' + i));
  const feedback = document.getElementById('pw-feedback');

  if (!input) return;

  function evaluate(pw) {
    let score = 0;
    const checks = {
      length8:   pw.length >= 8,
      length12:  pw.length >= 12,
      lower:     /[a-z]/.test(pw),
      upper:     /[A-Z]/.test(pw),
      digit:     /[0-9]/.test(pw),
      special:   /[^a-zA-Z0-9]/.test(pw),
      noCommon:  !/(passwort|password|qwerty|123456|hunde|berlin|admin)/i.test(pw)
    };

    if (checks.length8)  score++;
    if (checks.length12) score++;
    if (checks.lower && checks.upper) score++;
    if (checks.digit)    score++;
    if (checks.special)  score++;
    if (!checks.noCommon) score = Math.max(0, score - 2);

    return { score: Math.min(score, 4), checks };
  }

  function render(score, checks) {
    const levels = ['', 'weak', 'weak', 'medium', 'strong'];
    bars.forEach((bar, i) => {
      bar.className = 'cc-pw-bar';
      if (i < score) bar.classList.add(levels[score]);
    });

    const msgs = {
      0: { text: 'Zu schwach — nicht akzeptiert', color: 'var(--red)' },
      1: { text: 'Schwach — leicht zu knacken',   color: 'var(--red)' },
      2: { text: 'Mittel — kann besser werden',   color: 'var(--amber)' },
      3: { text: 'Gut — fast sicher',              color: 'var(--amber)' },
      4: { text: 'Stark — Zugang gewährt ✓',       color: 'var(--green)' }
    };

    feedback.textContent = msgs[score].text;
    feedback.style.color = msgs[score].color;

    if (!checks.lower || !checks.upper) {
      feedback.textContent += ' · Groß- und Kleinbuchstaben verwenden';
    } else if (!checks.special) {
      feedback.textContent += ' · Sonderzeichen hinzufügen';
    } else if (!checks.digit) {
      feedback.textContent += ' · Ziffer hinzufügen';
    }
  }

  input.addEventListener('input', () => {
    const pw = input.value;
    if (!pw) {
      bars.forEach(b => b.className = 'cc-pw-bar');
      feedback.textContent = '—';
      feedback.style.color = 'var(--text-dim)';
      return;
    }
    const { score, checks } = evaluate(pw);
    render(score, checks);
    Storage.saveAnswer('b1_pw', pw.length + '_chars_score_' + score);
  });
});
