const loginButtons = document.querySelectorAll("[data-login-modal]");
const modalOverlay = document.querySelector("[data-modal-overlay]");
let modalTimer;
const mainAuthTokenKey = "howToLearnAuthToken";

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

function getMemberPagePath(page) {
  return window.location.pathname.includes("/pages/") ? page : `pages/${page}`;
}

async function logoutMember() {
  const token = localStorage.getItem(mainAuthTokenKey);
  const supabase = window.HowToLearnSupabase?.isConfigured ? window.HowToLearnSupabase.client : null;
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Local logout still works if the API is unavailable.
    }
  }
  if (token) {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: "{}",
      });
    } catch {
      // Local logout still works if the API is unavailable.
    }
  }
  localStorage.removeItem(mainAuthTokenKey);
  window.location.href = getMemberPagePath("login.html");
}

loginButtons.forEach((button) => {
  if (window.HowToLearnAuth) return;
  const isLoggedIn = Boolean(localStorage.getItem(mainAuthTokenKey));
  if (isLoggedIn) {
    button.textContent = "個人資料";
    const logoutButton = document.createElement("button");
    logoutButton.className = button.className;
    logoutButton.type = "button";
    logoutButton.textContent = "登出";
    logoutButton.addEventListener("click", logoutMember);
    button.insertAdjacentElement("afterend", logoutButton);
  }
  button.addEventListener("click", () => {
    window.location.href = getMemberPagePath(isLoggedIn ? "profile.html" : "login.html");
  });
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
