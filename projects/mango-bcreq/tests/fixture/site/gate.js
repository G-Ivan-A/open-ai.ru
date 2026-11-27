// Синтетическая витрина для тестов open-ai.ru (issue #68): повторяет форму gate.js спицы.
(function () {
  const script = document.currentScript;
  const baseUrl = new URL(".", script.src);
  const HOME_URL = "https://example-owner.github.io/fixture-spoke/";
  document.documentElement.dataset.gate = "open";
  document.documentElement.dataset.home = HOME_URL;
  document.documentElement.dataset.base = baseUrl.pathname;
})();
