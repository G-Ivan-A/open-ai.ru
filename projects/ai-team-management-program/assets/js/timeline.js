/*
 * Интерактивный таймлайн недель 0–11.
 * - клик по неделе (заголовок или узел оси) раскрывает темы, формат, а.ч., ведущего и результат;
 * - фильтр «Все недели / Очно / Онлайн»;
 * - строка состояния считает число недель и а.ч. по атрибутам data-hours.
 * Без JavaScript все недели раскрыты. Внешних библиотек нет.
 */
(function () {
  'use strict';

  function plural(n, one, few, many) {
    var mod10 = n % 10;
    var mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
  }

  function init(root) {
    var controls = root.querySelector('[data-timeline-controls]');
    var weeks = Array.prototype.slice.call(root.querySelectorAll('[data-week]'));
    var filters = Array.prototype.slice.call(root.querySelectorAll('[data-filter]'));
    var expandAll = root.querySelector('[data-expand-all]');
    var status = root.querySelector('[data-timeline-status]');
    if (!controls || !weeks.length) return;

    var filter = 'all';

    function toggleOf(week) { return week.querySelector('[data-week-toggle]'); }
    function bodyOf(week) { return document.getElementById(toggleOf(week).getAttribute('aria-controls')); }

    function setOpen(week, open) {
      toggleOf(week).setAttribute('aria-expanded', String(open));
      bodyOf(week).hidden = !open;
      week.classList.toggle('is-open', open);
    }

    function visibleWeeks() {
      return weeks.filter(function (w) { return !w.hidden; });
    }

    function syncExpandAll() {
      if (!expandAll) return;
      var visible = visibleWeeks();
      var allOpen = visible.length > 0 && visible.every(function (w) { return w.classList.contains('is-open'); });
      expandAll.setAttribute('aria-pressed', String(allOpen));
      expandAll.textContent = allOpen ? 'Свернуть все недели' : 'Раскрыть все недели';
    }

    function updateStatus() {
      if (!status) return;
      var visible = visibleWeeks();
      var hours = visible.reduce(function (sum, w) {
        return sum + parseInt(w.getAttribute('data-hours'), 10);
      }, 0);
      status.textContent = 'Показано: ' + visible.length + ' ' +
        plural(visible.length, 'неделя', 'недели', 'недель') + ' · ' + hours + ' а.ч.';
    }

    function applyFilter(value) {
      filter = value;
      filters.forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === value));
      });
      weeks.forEach(function (w) {
        w.hidden = !(value === 'all' || w.getAttribute('data-mode') === value);
      });
      Array.prototype.forEach.call(root.querySelectorAll('.rail__node'), function (node) {
        var match = value === 'all' || node.getAttribute('data-mode') === value;
        node.classList.toggle('is-dimmed', !match);
      });
      root.setAttribute('data-filter-active', value);
      updateStatus();
      syncExpandAll();
    }

    function openWeek(number, focus) {
      var week = document.getElementById('week-' + number);
      if (!week || weeks.indexOf(week) === -1) return;
      if (week.hidden) applyFilter('all');
      setOpen(week, true);
      syncExpandAll();
      if (focus) {
        toggleOf(week).focus({ preventScroll: true });
        week.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      }
    }

    function prefersReducedMotion() {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    weeks.forEach(function (w) {
      toggleOf(w).addEventListener('click', function () {
        setOpen(w, !w.classList.contains('is-open'));
        syncExpandAll();
      });
    });

    filters.forEach(function (b) {
      b.addEventListener('click', function () { applyFilter(b.getAttribute('data-filter')); });
    });

    if (expandAll) {
      expandAll.addEventListener('click', function () {
        var open = expandAll.getAttribute('aria-pressed') !== 'true';
        visibleWeeks().forEach(function (w) { setOpen(w, open); });
        syncExpandAll();
      });
    }

    // Узлы оси и ссылки «Неделя N» в других разделах раскрывают неделю.
    Array.prototype.forEach.call(document.querySelectorAll('[data-week-link]'), function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        var number = link.getAttribute('data-week-link');
        openWeek(number, true);
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', '#week-' + number);
        }
      });
    });

    // Свернуть все недели, кроме открытой по ссылке #week-N.
    var match = /^#week-(\d+)$/.exec(window.location.hash);
    weeks.forEach(function (w) { setOpen(w, false); });
    controls.hidden = false;
    root.classList.add('is-enhanced');
    applyFilter(filter);
    if (match) openWeek(match[1], false);

    // Переход по #week-N без перезагрузки страницы (ввод адреса, обычная ссылка).
    window.addEventListener('hashchange', function () {
      var m = /^#week-(\d+)$/.exec(window.location.hash);
      if (m) openWeek(m[1], true);
    });
  }

  function start() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-timeline]'), init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
