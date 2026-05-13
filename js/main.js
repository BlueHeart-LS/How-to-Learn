const loginButtons = document.querySelectorAll("[data-login-modal]");
const modalOverlay = document.querySelector("[data-modal-overlay]");
let modalTimer;

const rewardStorageKey = "howToLearnGameRewards";

function readRewardState() {
  try {
    return JSON.parse(localStorage.getItem(rewardStorageKey) || '{"coins":0,"totalEarned":0}');
  } catch (error) {
    return { coins: 0, totalEarned: 0 };
  }
}

function writeRewardState(state) {
  localStorage.setItem(rewardStorageKey, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent("howtolearn:rewards-updated", { detail: state }));
}

window.HowToLearnRewards = {
  getState() {
    return readRewardState();
  },
  getCoins() {
    return readRewardState().coins || 0;
  },
  award(amount) {
    const value = Math.max(0, Math.floor(Number(amount) || 0));
    const state = readRewardState();
    state.coins = (state.coins || 0) + value;
    state.totalEarned = (state.totalEarned || 0) + value;
    state.updatedAt = Date.now();
    writeRewardState(state);
    return state;
  },
  spend(amount) {
    const value = Math.max(0, Math.floor(Number(amount) || 0));
    const state = readRewardState();
    if ((state.coins || 0) < value) return { ok: false, state };
    state.coins -= value;
    state.updatedAt = Date.now();
    writeRewardState(state);
    return { ok: true, state };
  },
};

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
