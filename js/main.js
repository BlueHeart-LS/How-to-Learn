const loginButtons = document.querySelectorAll("[data-login-modal]");
const modalOverlay = document.querySelector("[data-modal-overlay]");
let modalTimer;

function openModal() {
  if (!modalOverlay) return;
  clearTimeout(modalTimer);
  modalOverlay.hidden = false;
  document.body.classList.add("modal-open");
  modalTimer = setTimeout(closeModal, 1500);
}

function closeModal() {
  if (!modalOverlay) return;
  clearTimeout(modalTimer);
  modalOverlay.hidden = true;
  document.body.classList.remove("modal-open");
}

loginButtons.forEach((button) => {
  button.addEventListener("click", openModal);
});

modalOverlay?.addEventListener("click", (event) => {
  if (event.target === modalOverlay) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});
