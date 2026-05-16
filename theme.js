// theme.js — dark mode toggle, shared across all pages
// Load this AFTER dark.css

(function () {
  const THEME_KEY = 'sfps-theme';

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    const next = isDark ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
    updateToggleIcon();
  }

  function updateToggleIcon() {
    const btn = document.getElementById('themeToggleBtn');
    if (!btn) return;
    const isDark = document.documentElement.classList.contains('dark');
    btn.textContent = isDark ? '☀️' : '🌙';
    btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  }

  function injectToggleButton() {
    const btn = document.createElement('button');
    btn.id = 'themeToggleBtn';
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', 'Toggle dark mode');
    btn.addEventListener('click', toggleTheme);
    document.body.appendChild(btn);
    updateToggleIcon();
  }

  // Apply saved theme immediately (before page renders to avoid flash)
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(saved);

  // Inject the toggle button once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectToggleButton);
  } else {
    injectToggleButton();
  }
})();
