/*
 * Форма «Запросить бюджет».
 * Открывает письмо через mailto: на адрес из _config.yml (budget_email) с темой
 * budget_subject и телом «Поле: значение» по пяти полям формы. Незаполненные поля
 * и неверный e-mail браузер отмечает сам (атрибуты required, type="email").
 * Без JavaScript форма отправляется через mailto: браузером. Внешних сервисов нет.
 */
(function () {
  'use strict';

  var GROUP_SIZES = ['20', '21', '22', '23', '24', '25'];

  function init(form) {
    var email = (form.getAttribute('data-email') || '').trim();
    var subject = form.getAttribute('data-subject') || '';

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (typeof form.reportValidity === 'function' && !form.reportValidity()) {
        return;
      }
      var fields = Array.prototype.slice.call(form.querySelectorAll('input, select'));
      var group = form.querySelector('select');
      if (group && GROUP_SIZES.indexOf(group.value) === -1) {
        group.focus();
        return;
      }
      var body = fields.map(function (f) {
        var label = form.querySelector('label[for="' + f.id + '"]');
        return (label ? label.textContent.trim() : f.name) + ': ' + f.value.trim();
      }).join('\r\n');

      window.location.href = 'mailto:' + encodeURI(email) +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    });
  }

  function start() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-budget-form]'), init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
