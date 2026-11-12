/*
 * «Светофор данных»: переключатель зон зелёная / жёлтая / красная.
 * Без JavaScript таблица показывает все зоны; скрипт включает переключатель
 * и показывает строку выбранной зоны. Внешних библиотек нет.
 */
(function () {
  'use strict';

  function init(root) {
    var switcher = root.querySelector('[data-zones-switch]');
    var buttons = Array.prototype.slice.call(root.querySelectorAll('[data-zone]'));
    var rows = Array.prototype.slice.call(root.querySelectorAll('[data-zone-row]'));
    var status = root.querySelector('[data-zones-status]');
    if (!switcher || !buttons.length || !rows.length) return;

    function labelOf(zone) {
      var lamp = root.querySelector('[data-zone="' + zone + '"] .traffic-light__label');
      return lamp ? lamp.textContent.trim() : '';
    }

    function select(zone) {
      buttons.forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-zone') === zone));
      });
      rows.forEach(function (r) {
        var match = zone === 'all' || r.getAttribute('data-zone-row') === zone;
        r.hidden = !match;
        r.classList.toggle('is-selected', zone !== 'all' && match);
      });
      root.setAttribute('data-active-zone', zone);
      if (status) {
        status.textContent = zone === 'all' ? 'Показаны все зоны данных' : 'Показана зона: ' + labelOf(zone);
      }
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        var zone = b.getAttribute('data-zone');
        // Повторное нажатие на выбранную зону возвращает все зоны.
        if (zone !== 'all' && b.getAttribute('aria-pressed') === 'true') zone = 'all';
        select(zone);
      });
    });

    switcher.hidden = false;
    root.classList.add('is-enhanced');
    select('all');
  }

  function start() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-zones]'), init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
