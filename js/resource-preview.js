const previewButtons = document.querySelectorAll("[data-preview-image]");
const previewOverlay = document.querySelector("[data-image-preview]");
const previewImage = document.querySelector("[data-preview-output]");
const previewCaption = document.querySelector("[data-preview-caption]");
const assetFilterButtons = document.querySelectorAll("[data-asset-filter]");
const subjectFilterButtons = document.querySelectorAll("[data-subject-filter]");
const assetCards = document.querySelectorAll("[data-asset-ages]");
const assetEmpty = document.querySelector("[data-asset-empty]");

let selectedAge = "all";
let selectedSubject = "all";

function closePreview() {
  if (!previewOverlay) return;
  previewOverlay.hidden = true;
  document.body.classList.remove("preview-open");
}

previewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!previewOverlay || !previewImage || !previewCaption) return;

    const image = button.dataset.previewImage;
    const title = button.dataset.previewTitle || "素材預覽";

    previewImage.src = image;
    previewImage.alt = `${title}放大預覽`;
    previewCaption.textContent = title;
    previewOverlay.hidden = false;
    document.body.classList.add("preview-open");
  });
});

previewOverlay?.addEventListener("click", (event) => {
  if (event.target === previewOverlay) {
    closePreview();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePreview();
  }
});

function filterAssets() {
  let visibleCount = 0;

  assetCards.forEach((card) => {
    const ages = card.dataset.assetAges.split(" ");
    const subject = card.dataset.assetSubject;
    const matchesAge = selectedAge === "all" || ages.includes(selectedAge);
    const matchesSubject = selectedSubject === "all" || subject === selectedSubject;
    const isVisible = matchesAge && matchesSubject;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  if (assetEmpty) {
    assetEmpty.hidden = visibleCount !== 0;
  }
}

assetFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedAge = button.dataset.assetFilter;
    assetFilterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    filterAssets();
  });
});

subjectFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedSubject = button.dataset.subjectFilter;
    subjectFilterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    filterAssets();
  });
});
