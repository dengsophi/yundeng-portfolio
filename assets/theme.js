(() => {
  const root = document.documentElement;
  const key = 'yun-deng-theme';

  try {
    if (localStorage.getItem(key) === 'light') root.dataset.theme = 'light';
  } catch {}

  document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.theme-switch');
    const meta = document.querySelector('meta[name="theme-color"]');

    function describeTheme() {
      const light = root.dataset.theme === 'light';
      const label = light ? 'Switch to dark theme' : 'Switch to light theme';
      button.setAttribute('aria-label', label);
      button.title = label;
      meta.content = light ? '#f1efe9' : '#0d0d0d';
    }

    describeTheme();
    button.addEventListener('click', () => {
      const light = root.dataset.theme !== 'light';
      root.dataset.theme = light ? 'light' : 'dark';
      try { localStorage.setItem(key, root.dataset.theme); } catch {}
      describeTheme();
    });
  }, { once: true });
})();
