// Progressive enhancement only — page is fully usable without this.
(function () {
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
      statusLine.innerHTML = '<span class="status-dot"></span> experience: <b>' + durationText + '</b> &nbsp;·&nbsp; current: <b>Deloitte USI</b> &nbsp;·&nbsp; stack: <b>AWS / Azure / Databricks</b>';
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
    document.addEventListener('DOMContentLoaded', updateExperienceDuration);
  } else {
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
