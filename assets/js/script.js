/* ============================================================
   Tharunraj Portfolio — script.js
   ------------------------------------------------------------
   Features:
   - Sidebar toggle (mobile)
   - SPA page switcher (navbar)
   - Project category filter
   - Shared modal (Credly badges + publications)
   - Theme toggle with localStorage + system preference
   ============================================================ */

/* =====================
   Sidebar toggle (mobile)
   ===================== */

const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

if (sidebar && sidebarBtn) {
  sidebarBtn.addEventListener("click", () => {
    if (window.innerWidth <= 992) sidebar.classList.toggle("active");
  });
}

window.addEventListener("resize", () => {
  if (!sidebar) return;
  if (window.innerWidth > 992) sidebar.classList.remove("active");
});

/* =====================
   SPA page navigation
   ===================== */

const navLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const target = link.textContent.trim().toLowerCase();

    pages.forEach((page) => {
      page.classList.toggle("active", page.dataset.page === target);
    });

    navLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");

    // Close sidebar on nav (mobile)
    if (sidebar && window.innerWidth <= 992) sidebar.classList.remove("active");

    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

/* =====================
   Shared Modal (badges + publications)
   ===================== */

const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector(".projects-modal [data-modal-title]");
const modalText = document.querySelector(".projects-modal [data-modal-text]");

const modalItems = document.querySelectorAll("[data-modal-item]");

const openModal = ({ imgSrc, imgAlt, title, html }) => {
  if (!modalContainer) return;
  if (modalImg) {
    modalImg.src = imgSrc || "";
    modalImg.alt = imgAlt || "";
  }
  if (modalTitle) modalTitle.textContent = title || "";
  if (modalText) modalText.innerHTML = html || "";

  modalContainer.classList.add("active");
};

const closeModal = () => {
  if (!modalContainer) return;
  modalContainer.classList.remove("active");
};

if (modalItems.length) {
  modalItems.forEach((item) => {
    item.addEventListener("click", () => {
      const avatar = item.querySelector("[data-modal-avatar]");
      const title = item.querySelector("[data-modal-title]");
      const text = item.querySelector("[data-modal-text]");

      openModal({
        imgSrc: avatar?.getAttribute("src") || "",
        imgAlt: avatar?.getAttribute("alt") || "",
        title: title?.textContent?.trim() || "",
        html: text?.innerHTML || "",
      });
    });
  });
}

if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
if (overlay) overlay.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

/* =====================
   Project Filter
   ===================== */

const filterBtns = document.querySelectorAll("[data-filter-btn]");
const filterItems = document.querySelectorAll("[data-filter-item]");

if (filterBtns.length && filterItems.length) {
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.textContent.trim().toLowerCase();

      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      filterItems.forEach((item) => {
        const itemCat = (item.dataset.category || "").toLowerCase();
        const show = category === "all" || itemCat === category;
        item.classList.toggle("active", show);
        item.style.display = show ? "block" : "none";
      });
    });
  });
}

/* =====================
   Theme Toggle (persisted + system aware)
   ===================== */

document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  if (!themeToggle) return;

  const STORAGE_KEY = "theme";
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const applyTheme = (mode) => {
    const isDark = mode === "dark";
    document.body.classList.toggle("dark-mode", isDark);

    // Dark -> show SUN (switch to light). Light -> show MOON (switch to dark).
    themeToggle.innerHTML = isDark
      ? '<ion-icon name="sunny-outline"></ion-icon>'
      : '<ion-icon name="moon-outline"></ion-icon>';

    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode"
    );

    // Small pulse glow on toggle
    themeToggle.classList.add("pulse");
    themeToggle.style.setProperty(
      "--pulse-color",
      isDark ? "rgba(0,224,255,0.6)" : "rgba(0,255,136,0.6)"
    );
    setTimeout(() => themeToggle.classList.remove("pulse"), 600);
  };

  const saved = localStorage.getItem(STORAGE_KEY);
  const initial = saved ? saved : prefersDark ? "dark" : "light";
  applyTheme(initial);

  themeToggle.addEventListener("click", () => {
    const nowDark = document.body.classList.contains("dark-mode");
    const next = nowDark ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  });
});

console.log("%cPortfolio Loaded Successfully 🚀", "color:#00ff88; font-weight:bold;");
