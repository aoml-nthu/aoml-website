/* AOML motion layer — presentation only, no content changes. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var root = document.documentElement;
    var file = (location.pathname.split('/').pop() || '').toLowerCase();
    if (file === '' || /^index(_main)?\.html?$/.test(file)) root.setAttribute('data-page', 'home');

    /* ---- per-page washed cover artwork behind the content ---- */
    var art = {
      '': 'ami', 'index.html': 'ami', 'index_main.html': 'ami',
      'research.html': 'am', 'research-opv.html': 'afm2',
      'research-oleds.html': 'am', 'research-photophysics.html': 'small',
      'facilities.html': 'afm2', 'fabrication.html': 'afm2', 'measurement.html': 'afm2',
      'people.html': 'small', 'photo.html': 'small',
      'publication.html': 'afm', 'collaborations.html': 'afm',
      'contact.html': 'afm', 'news.html': 'afm'
    };
    if (art[file]) {
      root.setAttribute('data-bg', art[file]);
      var artLayer = document.createElement('div');
      artLayer.className = 'page-art';
      document.body.insertBefore(artLayer, document.body.firstChild);
    }

    /* ---- scroll progress ---- */
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);

    /* ---- hero headline: split into words ---- */
    var title = document.querySelector('h1.pagetitle');
    if (title && !reduce) {
      var words = title.textContent.trim().split(/\s+/);
      title.textContent = '';
      words.forEach(function (w, i) {
        var wrap = document.createElement('span');
        wrap.className = 'w';
        var inner = document.createElement('span');
        inner.textContent = w;
        inner.style.setProperty('--d', 90 + i * 55 + 'ms');
        wrap.appendChild(inner);
        title.appendChild(wrap);
        if (i < words.length - 1) title.appendChild(document.createTextNode(' '));
      });
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { title.classList.add('is-in'); });
      });
    } else if (title) {
      title.classList.add('is-in');
    }

    /* ---- scroll cue under the homepage hero ---- */
    if (root.getAttribute('data-page') === 'home' && title) {
      var cue = document.createElement('div');
      cue.className = 'scroll-cue';
      cue.innerHTML = '<i></i><span>Scroll</span>';
      title.parentNode.insertBefore(cue, title.nextSibling);
    }

    /* ---- reveal on scroll ---- */
    var sel = [
      '.main-content h1.block',
      '.main-content .main-subcontent',
      '.main-content .column1-unit',
      '.main-content .column2-unit',
      '.main-content .column2-unit-left',
      '.main-content .column2-unit-right',
      '.main-content .column3-unit',
      '.main-content .column1-unit-left',
      '.main-content .main-content_3',
      '.main-content table',
      '.main-content > p',
      '.main-content > h4',
      '.main-content > h5',
      '.main-content > img',
      '.main-content > a > img'
    ].join(',');

    var nodes = [].slice.call(document.querySelectorAll(sel));
    /* drop anything already covered by a marked ancestor */
    var picked = nodes.filter(function (n) {
      for (var p = n.parentNode; p && p !== document.body; p = p.parentNode) {
        if (nodes.indexOf(p) !== -1) return false;
      }
      return true;
    });

    /* blocks taller than the viewport are never "mostly visible" —
       reveal them immediately instead of animating the whole slab */
    picked = picked.filter(function (n) {
      if (n.getBoundingClientRect().height > window.innerHeight * 1.2) return false;
      n.setAttribute('data-reveal', '');
      return true;
    });

    /* stagger siblings within the same parent */
    var seen = new Map();
    picked.forEach(function (n) {
      var k = n.parentNode;
      var i = seen.get(k) || 0;
      seen.set(k, i + 1);
      n.style.setProperty('--d', Math.min(i, 6) * 80 + 'ms');
    });

    if ('IntersectionObserver' in window && !reduce) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
      picked.forEach(function (n) { io.observe(n); });
    } else {
      picked.forEach(function (n) { n.classList.add('is-in'); });
    }

    /* ---- scroll-linked bits ---- */
    var header = document.querySelector('.header');
    var figure = document.querySelector('html[data-page="home"] .main-content_4 .column1-unit-left');
    var band = document.querySelector('html[data-page="home"] .main-content_3');
    var ticking = false;

    function frame() {
      ticking = false;
      var y = window.pageYOffset || document.documentElement.scrollTop;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(y / h, 1) : 0) + ')';

      if (header) header.classList.toggle('is-scrolled', y > 12);

      if (!reduce) {
        if (figure) {
          var r = figure.getBoundingClientRect();
          var p = 1 - Math.min(Math.max(r.top / (window.innerHeight * 0.9), 0), 1);
          figure.querySelectorAll('img,embed').forEach(function (el) {
            el.style.setProperty('--p', p.toFixed(3));
          });
        }
        if (band) {
          var rb = band.getBoundingClientRect();
          if (rb.bottom > 0 && rb.top < window.innerHeight) {
            var q = (window.innerHeight - rb.top) / (window.innerHeight + rb.height);
            band.style.setProperty('--shift', ((q - 0.5) * 90).toFixed(1) + 'px');
          }
        }
      }
    }

    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(frame); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    frame();
  });
})();
