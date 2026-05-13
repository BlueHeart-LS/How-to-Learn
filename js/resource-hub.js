const resourceSearchInput = document.querySelector(".resource-search-row input");
const resourceSearchButton = document.querySelector(".resource-search-row button");
const searchableResources = document.querySelectorAll(
  ".resource-category-card, .resource-feature-card, .question-bank-card, .external-resource-row a",
);

function filterResourceCards() {
  const keyword = resourceSearchInput?.value.trim().toLowerCase() || "";
  searchableResources.forEach((item) => {
    const matched = !keyword || item.textContent.toLowerCase().includes(keyword);
    item.hidden = !matched;
  });
}

resourceSearchInput?.addEventListener("input", filterResourceCards);
resourceSearchButton?.addEventListener("click", filterResourceCards);
