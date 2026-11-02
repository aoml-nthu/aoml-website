/* AOML appearance switch — Auto (follows the OS) / Light / Dark.
   The choice is kept in localStorage under "aoml-theme".
   Pages also carry a tiny inline snippet in <head> that applies a
   stored choice before first paint, so there is no flash. */
(function () {
  var KEY = 'aoml-theme';
  var ORDER = ['auto', 'light', 'dark'];
  var LABEL = { auto: 'Auto', light: 'Light', dark: 'Dark' };
  var root = document.documentElement;

  function read() {
    try {
      var v = localStorage.getItem(KEY);
      return v === 'light' || v === 'dark' ? v : 'auto';
    } catch (e) { return 'auto'; }
  }

  function apply(mode) {
    if (mode === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', mode);
    try {
      if (mode === 'auto') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, mode);
    } catch (e) {}
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var host = document.querySelector('.header-top');
    if (!host) return;

    var mode = read();
    apply(mode);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';
    btn.innerHTML = '<span class="dot"></span><span class="label"></span>';
    var label = btn.querySelector('.label');

    function paint() {
      label.textContent = LABEL[mode];
      btn.setAttribute('aria-label', 'Appearance: ' + LABEL[mode] + ' — click to change');
      btn.title = 'Appearance: ' + LABEL[mode];
    }
    paint();

    btn.addEventListener('click', function () {
      mode = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
      apply(mode);
      paint();
    });

    host.appendChild(btn);
  });
})();
