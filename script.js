// Progressive enhancement only — page is fully usable without this.
(function () {
  var THEME_KEY = 'preferred-theme';

  function getStoredTheme() {
    try {
      var value = window.localStorage.getItem(THEME_KEY);
      return (value === 'dark' || value === 'light') ? value : null;
    } catch (err) {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      if (theme === 'dark' || theme === 'light') {
        window.localStorage.setItem(THEME_KEY, theme);
      } else {
        window.localStorage.removeItem(THEME_KEY);
      }
    } catch (err) {
      // Ignore storage errors in private mode.
    }
  }

  function getSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function getEffectiveTheme() {
    return getStoredTheme() || getSystemTheme();
  }

  function applyTheme() {
    var root = document.documentElement;
    var stored = getStoredTheme();

    if (stored) {
      root.setAttribute('data-theme', stored);
    } else {
      root.removeAttribute('data-theme');
    }
  }

  function updateThemeToggleLabel() {
    var button = document.getElementById('theme-toggle');
    if (!button) return;

    var textEl = button.querySelector('.theme-toggle-text');
    var iconEl = button.querySelector('.theme-toggle-icon');
    var stored = getStoredTheme();
    var effective = getEffectiveTheme();

    if (textEl) {
      textEl.textContent = stored ? ('Theme: ' + (effective === 'dark' ? 'Dark' : 'Light')) : 'Theme: Auto';
    }

    if (iconEl) {
      iconEl.textContent = effective === 'dark' ? '◑' : '◐';
    }

    button.setAttribute('aria-label', stored ? ('Switch to ' + (effective === 'dark' ? 'light' : 'dark') + ' mode') : 'Theme follows system settings. Tap to switch manually.');
  }

  function setupThemeToggle() {
    var button = document.getElementById('theme-toggle');
    if (!button) return;

    applyTheme();
    updateThemeToggleLabel();

    button.addEventListener('click', function () {
      var nextTheme = getEffectiveTheme() === 'dark' ? 'light' : 'dark';
      storeTheme(nextTheme);
      applyTheme();
      updateThemeToggleLabel();
    });

    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var onSystemThemeChange = function () {
        if (!getStoredTheme()) {
          applyTheme();
          updateThemeToggleLabel();
        }
      };

      if (typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', onSystemThemeChange);
      } else if (typeof mq.addListener === 'function') {
        mq.addListener(onSystemThemeChange);
      }
    }
  }

  function formatExperienceDuration(startDate, now) {
    var months = (now.getUTCFullYear() - startDate.getUTCFullYear()) * 12 + (now.getUTCMonth() - startDate.getUTCMonth());
    if (now.getUTCDate() < startDate.getUTCDate()) months -= 1;
    if (months < 0) months = 0;

    var years = Math.floor(months / 12);
    var remMonths = months % 12;

    var yearText = years + ' year' + (years === 1 ? '' : 's');
    var monthText = remMonths + ' month' + (remMonths === 1 ? '' : 's');
    return yearText + ' ' + monthText;
  }

  function updateExperienceDuration() {
    var durationEl = document.getElementById('experience-duration');
    var statusLine = document.querySelector('.status-line');

    // Career start date: Feb 2021 (month is 0-indexed).
    var startDate = new Date(Date.UTC(2021, 1, 1));
    var durationText = formatExperienceDuration(startDate, new Date());

    if (durationEl) {
      durationEl.textContent = durationText;
      return;
    }

    // Fallback: patch full status line text if the target element is missing.
    if (statusLine) {
      statusLine.innerHTML = '<span class="status-dot"></span><div class="status-items" aria-label="Profile summary metrics"><span class="status-item"><span class="status-k">Experience</span><b>' + durationText + '</b></span><span class="status-item"><span class="status-k">Current</span><b>Deloitte USI</b></span><span class="status-item"><span class="status-k">Stack</span><b>AWS | Azure | Databricks | Apache Spark</b></span></div>';
    }
  }

  function setupRevealAnimations() {
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var revealTargets = document.querySelectorAll('section, .casefile, .role, .cloud-col, .stack-group, .skill-group, .cred-col');

    if (!revealTargets.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(revealTargets, function (el) { el.classList.add('is-visible'); });
      return;
    }

    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

    Array.prototype.forEach.call(revealTargets, function (el, idx) {
      el.classList.add('reveal');
      el.style.setProperty('--reveal-delay', String((idx % 4) * 45) + 'ms');
      revealObserver.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setupThemeToggle();
      updateExperienceDuration();
    });
  } else {
    setupThemeToggle();
    updateExperienceDuration();
  }

  window.addEventListener('pageshow', updateExperienceDuration);
  setupRevealAnimations();

  var links = document.querySelectorAll('.nav-links a');
  var sections = Array.prototype.map.call(links, function (a) {
    return document.querySelector(a.getAttribute('href'));
  }).filter(Boolean);

  if (!sections.length || !('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var link = document.querySelector('.nav-links a[href="#' + entry.target.id + '"]');
      if (!link) return;
      if (entry.isIntersecting) {
        links.forEach(function (l) { l.style.color = ''; });
        link.style.color = 'var(--accent)';
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });

  sections.forEach(function (s) { observer.observe(s); });
})();
