const authTokenKey = "howToLearnAuthToken";
const adminEmails = ["lan.learning.tw@gmail.com"];

function getAuthToken() {
  return localStorage.getItem(authTokenKey) || "";
}

function getSupabaseClient() {
  return window.HowToLearnSupabase?.isConfigured ? window.HowToLearnSupabase.client : null;
}

function setAuthToken(token) {
  if (token) {
    localStorage.setItem(authTokenKey, token);
  } else {
    localStorage.removeItem(authTokenKey);
  }
}

function getPagePath(page) {
  return window.location.pathname.includes("/pages/") ? page : `pages/${page}`;
}

async function authRequest(path, options = {}) {
  const headers = {
    "content-type": "application/json",
    ...(options.headers || {}),
  };
  const token = getAuthToken();
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "操作失敗");
  }
  return payload;
}

async function getCurrentUser() {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setAuthToken("");
      return null;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id,name,bio,role,created_at,updated_at")
      .eq("id", user.id)
      .maybeSingle();

    return {
      id: user.id,
      email: user.email,
      name: profile?.name || user.user_metadata?.name || user.email,
      bio: profile?.bio || "",
      role: profile?.role === "admin" || adminEmails.includes(user.email) ? "admin" : "member",
      createdAt: profile?.created_at || user.created_at,
      updatedAt: profile?.updated_at || user.updated_at,
    };
  }

  if (!getAuthToken()) return null;
  try {
    const payload = await authRequest("/api/auth/me");
    return payload.user;
  } catch {
    setAuthToken("");
    return null;
  }
}

function updateAuthButtons(user) {
  document.querySelectorAll("[data-login-modal]").forEach((button) => {
    button.textContent = user ? "個人資料" : "會員登入";
    if (user && !button.nextElementSibling?.matches("[data-auth-logout]")) {
      const logoutButton = document.createElement("button");
      logoutButton.className = button.className;
      logoutButton.type = "button";
      logoutButton.dataset.authLogout = "";
      logoutButton.textContent = "登出";
      logoutButton.addEventListener("click", async () => {
        try {
          await authRequest("/api/auth/logout", { method: "POST", body: "{}" });
        } catch {
          // Local logout still works if the API is unavailable.
        }
        setAuthToken("");
        window.location.href = getPagePath("login.html");
      });
      button.insertAdjacentElement("afterend", logoutButton);
    }
    button.addEventListener("click", () => {
      window.location.href = getPagePath(user ? "profile.html" : "login.html");
    }, { once: true });
  });
}

async function initAuthNav() {
  updateAuthButtons(await getCurrentUser());
}

async function initLoginPage() {
  const form = document.querySelector("[data-login-form]");
  const status = document.querySelector("[data-auth-status]");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "登入中";

    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email.value.trim(),
          password: form.password.value,
        });
        if (error) throw error;
        setAuthToken("supabase");
      } else {
        const payload = await authRequest("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: form.email.value.trim(),
            password: form.password.value,
          }),
        });
        setAuthToken(payload.token);
      }
      status.textContent = "登入成功";
      window.location.href = "profile.html";
    } catch (error) {
      status.textContent = error.message;
    }
  });
}

async function initRegisterPage() {
  const form = document.querySelector("[data-register-form]");
  const status = document.querySelector("[data-auth-status]");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "建立帳號中";

    if (form.password.value !== form.confirmPassword.value) {
      status.textContent = "兩次輸入的密碼不同";
      return;
    }

    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const name = form.name.value.trim();
        const { data, error } = await supabase.auth.signUp({
          email: form.email.value.trim(),
          password: form.password.value,
          options: {
            data: { name },
          },
        });
        if (error) throw error;
        if (data.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            name,
            bio: "",
            role: "member",
            updated_at: new Date().toISOString(),
          });
        }
        setAuthToken("supabase");
      } else {
        const payload = await authRequest("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            password: form.password.value,
          }),
        });
        setAuthToken(payload.token);
      }
      status.textContent = "註冊成功";
      window.location.href = "profile.html";
    } catch (error) {
      status.textContent = error.message;
    }
  });
}

async function initProfilePage() {
  const form = document.querySelector("[data-profile-form]");
  const status = document.querySelector("[data-auth-status]");
  const logoutButton = document.querySelector("[data-logout]");
  const memberEmail = document.querySelector("[data-member-email]");
  const memberSince = document.querySelector("[data-member-since]");
  const memberRole = document.querySelector("[data-member-role]");
  const adminLink = document.querySelector("[data-admin-link]");
  if (!form) return;

  const user = await getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  form.name.value = user.name || "";
  form.bio.value = user.bio || "";
  memberEmail.textContent = user.email || "";
  memberSince.textContent = user.createdAt ? new Date(user.createdAt).toLocaleDateString("zh-TW") : "";
  if (memberRole) {
    memberRole.textContent = user.role === "admin" ? "管理員" : "一般會員";
  }
  if (adminLink) {
    adminLink.hidden = user.role !== "admin";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "儲存中";

    try {
      const supabase = getSupabaseClient();
      let updatedUser;
      if (supabase) {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        const { data, error } = await supabase
          .from("profiles")
          .upsert({
            id: authUser.id,
            name: form.name.value.trim(),
            bio: form.bio.value.trim(),
            role: user.role || "member",
            updated_at: new Date().toISOString(),
          })
          .select("id,name,bio,role,created_at,updated_at")
          .single();
        if (error) throw error;
        updatedUser = {
          id: authUser.id,
          email: authUser.email,
          name: data.name,
          bio: data.bio,
          role: data.role,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      } else {
        const payload = await authRequest("/api/auth/profile", {
          method: "PUT",
          body: JSON.stringify({
            name: form.name.value.trim(),
            bio: form.bio.value.trim(),
          }),
        });
        updatedUser = payload.user;
      }
      form.name.value = updatedUser.name || "";
      form.bio.value = updatedUser.bio || "";
      status.textContent = "個人資料已更新";
      updateAuthButtons(updatedUser);
    } catch (error) {
      status.textContent = error.message;
    }
  });

  logoutButton.addEventListener("click", async () => {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.auth.signOut();
      } else {
        await authRequest("/api/auth/logout", { method: "POST", body: "{}" });
      }
    } catch {
      // Logging out locally is enough if the server is unavailable.
    }
    setAuthToken("");
    window.location.href = "login.html";
  });
}

window.HowToLearnAuth = {
  getAuthToken,
  getCurrentUser,
  initAuthNav,
};

initAuthNav();
initLoginPage();
initRegisterPage();
initProfilePage();
