// Синтетическая витрина для тестов open-ai.ru (issue #68): тот же контракт, что у app.js спицы —
// hash-маршруты #<раздел> и #processes?step=<код>&track=<формат>, каталог с копированием,
// поиском и фильтрами, карточки шагов #bcreq-testkit-<код> с кнопками .testkit-copy.
const PAGES = ["about", "catalog", "standards", "dashboard", "roadmap", "processes", "patterns", "glossary"];
const [catalog, testKit, aInKit] = await Promise.all([
  fetch("data/prompts.json").then((r) => r.json()),
  fetch("data/test-kit.json").then((r) => r.json()),
  fetch("data/a-in-kit.json").then((r) => r.json()),
]);
const state = { query: "", filters: new Set() };
const $ = (selector) => document.querySelector(selector);

function copyButton(className, text, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", () => navigator.clipboard.writeText(text));
  return button;
}

function renderCatalog() {
  const items = catalog.prompts.filter((p) => (!state.query || `${p.id} ${p.title} ${p.text}`.toLowerCase().includes(state.query))
    && [...state.filters].every((f) => p.tags.includes(f)));
  $("#prompt-grid").replaceChildren(...items.map((p) => {
    const card = document.createElement("article");
    card.className = "prompt-card";
    card.append(Object.assign(document.createElement("h3"), { textContent: p.title }));
    const copy = copyButton("prompt-copy", p.text, "Копировать");
    copy.dataset.copyId = p.id;
    card.append(copy);
    return card;
  }));
  $("#result-count").textContent = `${items.length} из ${catalog.prompts.length}`;
}

$("#filters").replaceChildren(...catalog.filters.map((token) => {
  const chip = document.createElement("button");
  chip.type = "button";
  chip.dataset.filterToken = token;
  chip.textContent = token;
  chip.disabled = !catalog.prompts.some((p) => p.tags.includes(token));
  chip.addEventListener("click", () => {
    state.filters.has(token) ? state.filters.delete(token) : state.filters.add(token);
    renderCatalog();
  });
  return chip;
}));
$("#search-input").addEventListener("input", (event) => {
  state.query = event.target.value.trim().toLowerCase();
  renderCatalog();
});

const STEPS = [
  ...testKit.steps.map((s) => ({ code: s.step.split(" ")[0], title: s.step, prompt: s.prompt })),
  ...aInKit.steps.map((s) => ({ code: s.id, title: s.id, prompt: s.prompt })),
];
$("#steps").replaceChildren(...STEPS.map((s) => {
  const card = document.createElement("article");
  card.className = "testkit-card";
  card.id = `bcreq-testkit-${s.code}`;
  card.tabIndex = -1;
  card.append(Object.assign(document.createElement("h3"), { textContent: s.title }));
  card.append(copyButton("testkit-copy", s.prompt, "Копировать"));
  return card;
}));

function route() {
  const [name, query = ""] = decodeURIComponent(location.hash.slice(1)).split("?");
  const page = PAGES.includes(name) ? name : "catalog";
  for (const section of document.querySelectorAll("section[data-page]")) section.hidden = section.dataset.page !== page;
  if (page !== "processes") return;
  const params = new URLSearchParams(query);
  const track = params.get("track") === "system" ? "system" : "decomposed";
  for (const link of document.querySelectorAll("[data-step-format]")) link.dataset.active = String(link.dataset.stepFormat === track);
  const card = params.get("step") && document.getElementById(`bcreq-testkit-${params.get("step")}`);
  if (card) card.focus();
}

renderCatalog();
addEventListener("hashchange", route);
route();
