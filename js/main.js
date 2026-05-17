const loginButtons = document.querySelectorAll("[data-login-modal]");
const modalOverlay = document.querySelector("[data-modal-overlay]");
const siteHeaders = document.querySelectorAll(".site-header");
let modalTimer;
const mainAuthTokenKey = "howToLearnAuthToken";

const rewardStorageKey = "howToLearnGameRewards";

function getLocalDateKey(time = Date.now()) {
  const date = new Date(time);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
}

function getPreviousDateKey(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() - 1);
  return getLocalDateKey(date.getTime());
}

function readRewardState() {
  try {
    return JSON.parse(localStorage.getItem(rewardStorageKey) || '{"coins":0,"totalEarned":0,"completedSessions":0}');
  } catch (error) {
    return { coins: 0, totalEarned: 0, completedSessions: 0 };
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
    const todayKey = getLocalDateKey();
    const state = readRewardState();
    if (state.todayKey !== todayKey) {
      state.todaySessions = 0;
      state.todayEarned = 0;
      state.todayKey = todayKey;
    }
    const previousDate = getPreviousDateKey(todayKey);
    if (state.lastPracticeDate === todayKey) {
      state.streakDays = Math.max(1, state.streakDays || 1);
    } else if (state.lastPracticeDate === previousDate) {
      state.streakDays = (state.streakDays || 0) + 1;
    } else {
      state.streakDays = 1;
    }
    state.coins = (state.coins || 0) + value;
    state.totalEarned = (state.totalEarned || 0) + value;
    state.completedSessions = (state.completedSessions || 0) + 1;
    state.todaySessions = (state.todaySessions || 0) + 1;
    state.todayEarned = (state.todayEarned || 0) + value;
    state.bestStreakDays = Math.max(state.bestStreakDays || 0, state.streakDays || 0);
    state.lastPracticeDate = todayKey;
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

siteHeaders.forEach((header, index) => {
  const nav = header.querySelector(".main-nav");
  const actions = header.querySelector(".header-actions");
  if (!nav || !actions || header.querySelector(".menu-toggle")) return;

  const navId = nav.id || `main-nav-${index + 1}`;
  nav.id = navId;

  const button = document.createElement("button");
  button.className = "menu-toggle";
  button.type = "button";
  button.setAttribute("aria-label", "開啟選單");
  button.setAttribute("aria-controls", navId);
  button.setAttribute("aria-expanded", "false");
  button.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16"></path>
      <path d="M4 12h16"></path>
      <path d="M4 17h16"></path>
    </svg>
    <span>選單</span>
  `;

  function closeMenu() {
    header.classList.remove("menu-open");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "開啟選單");
  }

  function toggleMenu() {
    const isOpen = header.classList.toggle("menu-open");
    button.setAttribute("aria-expanded", String(isOpen));
    button.setAttribute("aria-label", isOpen ? "關閉選單" : "開啟選單");
  }

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMenu();
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  actions.insertBefore(button, actions.firstChild);
});

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
