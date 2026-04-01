// ===== Tebex Configuration =====
// Replace these with your actual values from the Tebex creator panel
const TEBEX_PUBLIC_TOKEN = "12f8q-68d90da3b9d75d4c9bfde46712bac0ac4e3a9237"; // Headless API public token
const TEBEX_PACKAGE_IDS = {
  30: 7368970, // 30-day Lotus package ID
  90: 7368974, // 90-day Lotus package ID
  180: 7368975, // 180-day Lotus package ID
  365: 7368979, // 365-day Lotus package ID
};
const TEBEX_API = "https://headless.tebex.io/api";

// ===== State =====
let loggedInUser = null;
let loggedInEdition = null;
let pendingCheckout = false;

// ===== Copy server IP =====
function copyIP() {
  navigator.clipboard
    .writeText("havensurvival.net")
    .then(() => {
      const toast = document.getElementById("toast");
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2000);
    })
    .catch(() => {
      const el = document.createElement("textarea");
      el.value = "havensurvival.net";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      const toast = document.getElementById("toast");
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2000);
    });
}

// ===== Category filtering =====
document.querySelectorAll(".category-item").forEach((item) => {
  item.addEventListener("click", () => {
    document
      .querySelectorAll(".category-item")
      .forEach((i) => i.classList.remove("active"));
    item.classList.add("active");

    const category = item.dataset.category;
    document.querySelectorAll(".category-section").forEach((section) => {
      if (section.dataset.category === category) {
        section.style.display = "block";
        section.style.animation = "fadeIn 0.3s ease";
      } else {
        section.style.display = "none";
      }
    });
  });
});

// Add fadeIn animation
const style = document.createElement("style");
style.textContent = `@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`;
document.head.appendChild(style);

// ===== Plan modal =====
const planModal = document.getElementById("planModal");

document.getElementById("openPlanBtn").addEventListener("click", () => {
  planModal.classList.add("active");
});

document.getElementById("openPlanBtn2").addEventListener("click", () => {
  planModal.classList.add("active");
});

document.getElementById("planClose").addEventListener("click", () => {
  planModal.classList.remove("active");
});

planModal.addEventListener("click", (e) => {
  if (e.target === planModal) planModal.classList.remove("active");
});

// Plan selection
document.querySelectorAll(".plan-option").forEach((option) => {
  option.addEventListener("click", () => {
    document
      .querySelectorAll(".plan-option")
      .forEach((o) => o.classList.remove("selected"));
    option.classList.add("selected");
    option.querySelector('input[type="radio"]').checked = true;
  });
});

// ===== Perks modal =====
const perksModal = document.getElementById("perksModal");

document.getElementById("viewPerksBtn").addEventListener("click", () => {
  perksModal.classList.add("active");
});

document.getElementById("perksClose").addEventListener("click", () => {
  perksModal.classList.remove("active");
});

perksModal.addEventListener("click", (e) => {
  if (e.target === perksModal) perksModal.classList.remove("active");
});

document.getElementById("perksCtaBtn").addEventListener("click", () => {
  perksModal.classList.remove("active");
  planModal.classList.add("active");
});

// ===== Login modal =====
const loginModal = document.getElementById("loginModal");

document.getElementById("loginBtn").addEventListener("click", () => {
  loginModal.classList.add("active");
});

document.getElementById("loginClose").addEventListener("click", () => {
  loginModal.classList.remove("active");
});

loginModal.addEventListener("click", (e) => {
  if (e.target === loginModal) loginModal.classList.remove("active");
});

// Edition toggle
document.querySelectorAll(".edition-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".edition-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// Login submit
document.getElementById("loginSubmit").addEventListener("click", () => {
  const username = document.getElementById("usernameInput").value.trim();
  const edition = document.querySelector(".edition-btn.active").dataset.edition;
  if (username) {
    loggedInUser = username;
    loggedInEdition = edition;
    loginModal.classList.remove("active");
    const loginBtn = document.getElementById("loginBtn");
    loginBtn.textContent = edition === "bedrock" ? "." + username : username;
    loginBtn.style.color = "var(--text-primary)";

    if (pendingCheckout) {
      pendingCheckout = false;
      planModal.classList.add("active");
      startTebexCheckout();
    }
  }
});

// ===== Tebex Checkout =====
function getSelectedPlanDays() {
  const checked = document.querySelector('input[name="plan"]:checked');
  return checked ? parseInt(checked.value) : 30;
}

async function startTebexCheckout() {
  const subscribeBtn = document.getElementById("planSubscribeBtn");
  const planDays = getSelectedPlanDays();
  const packageId = TEBEX_PACKAGE_IDS[planDays];

  if (!packageId) {
    alert("This plan is not configured yet. Please set up Tebex package IDs.");
    return;
  }

  if (!loggedInUser) {
    pendingCheckout = true;
    planModal.classList.remove("active");
    loginModal.classList.add("active");
    return;
  }

  subscribeBtn.disabled = true;
  subscribeBtn.textContent = "Loading...";

  try {
    // 1. Create a basket
    const basketRes = await fetch(
      `${TEBEX_API}/accounts/${TEBEX_PUBLIC_TOKEN}/baskets`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username:
            loggedInEdition === "bedrock"
              ? "." + loggedInUser
              : loggedInUser,
          complete_url: window.location.href,
          cancel_url: window.location.href,
          complete_auto_redirect: true,
        }),
      },
    );

    if (!basketRes.ok) throw new Error("Failed to create basket");
    const basketData = await basketRes.json();
    const basketIdent = basketData.data.ident;

    // 2. Add the selected package to the basket
    const addRes = await fetch(`${TEBEX_API}/baskets/${basketIdent}/packages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        package_id: packageId,
        quantity: 1,
      }),
    });

    if (!addRes.ok) throw new Error("Failed to add package to basket");

    // 3. Launch Tebex.js checkout popup
    planModal.classList.remove("active");

    Tebex.checkout.init({
      ident: basketIdent,
      theme: "dark",
    });

    Tebex.checkout.launch();
  } catch (err) {
    console.error("Tebex checkout error:", err);
    alert("Something went wrong starting checkout. Please try again.");
  } finally {
    subscribeBtn.disabled = false;
    subscribeBtn.textContent = "Subscribe \u2192";
  }
}

document
  .getElementById("planSubscribeBtn")
  .addEventListener("click", startTebexCheckout);
