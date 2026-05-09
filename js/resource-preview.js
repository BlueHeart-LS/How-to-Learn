const previewButtons = document.querySelectorAll("[data-preview-image]");
const previewOverlay = document.querySelector("[data-image-preview]");
const previewImage = document.querySelector("[data-preview-output]");
const previewCaption = document.querySelector("[data-preview-caption]");

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
