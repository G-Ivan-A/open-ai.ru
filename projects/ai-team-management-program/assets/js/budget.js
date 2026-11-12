/*
 * Форма «Запросить детальный бюджет».
 * Проверяет поля и открывает письмо через mailto: на адрес из _config.yml (budget_email)
 * с заполненными темой и телом. Без JavaScript форма отправляется через mailto: браузером.
 * Внешних сервисов и библиотек нет.
 */
(function () {
  'use strict';

  var MIN_GROUP = 20;
  var MAX_GROUP = 25;

  function init(form) {
    var email = (form.getAttribute('data-email') || '').trim();
    var subject = form.getAttribute('data-subject') || '';
    var error = form.querySelector('[data-budget-error]');

    function showError(message, field) {
      if (error) {
        error.textContent = message;
        error.hidden = false;
      }
      if (field) {
        field.setAttribute('aria-invalid', 'true');
        field.focus();
      }
    }

    function clearErrors() {
      if (error) {
        error.textContent = '';
        error.hidden = true;
      }
      Array.prototype.forEach.call(form.querySelectorAll('[aria-invalid]'), function (f) {
        f.removeAttribute('aria-invalid');
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      clearErrors();

      if (!email) {
        showError('Адрес для запросов не указан.');
        return;
      }

      var fields = Array.prototype.slice.call(form.querySelectorAll('input, select'));
      for (var i = 0; i < fields.length; i++) {
        var f = fields[i];
        var label = form.querySelector('label[for="' + f.id + '"]');
        var name = label ? label.textContent.trim() : f.name;
        if (!f.value.trim()) {
          showError('Заполните поле «' + name + '».', f);
          return;
        }
        if (f.type === 'email' && !f.checkValidity()) {
          showError('Проверьте e-mail.', f);
          return;
        }
        if (f.tagName === 'SELECT') {
          var size = parseInt(f.value, 10);
          if (!(size >= MIN_GROUP && size <= MAX_GROUP)) {
            showError('Размер группы — от ' + MIN_GROUP + ' до ' + MAX_GROUP + ' человек.', f);
            return;
          }
        }
      }

      var body = fields.map(function (f) {
        var label = form.querySelector('label[for="' + f.id + '"]');
        return (label ? label.textContent.trim() : f.name) + ': ' + f.value.trim();
      }).join('\r\n');

      window.location.href = 'mailto:' + email +
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
