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


const themeToggle = document.getElementById("theme-toggle");
const themePicker = document.getElementById("theme-picker");
const themeClose = document.getElementById("theme-picker-close");
const themeChoices = [...document.querySelectorAll("[data-theme-choice]")];
const darkThemes = new Set(["aurora","obsidian","amethyst","cobalt","graphite"]);
const applyTheme = (id, persist = true) => {
  if (!themeChoices.some(button => button.dataset.themeChoice === id)) id = "arctic";
  document.body.dataset.theme = id;
  document.body.classList.toggle("dark-mode", darkThemes.has(id));
  themeChoices.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.themeChoice === id)));
  if (persist) { try { localStorage.setItem("portfolio-theme", id); } catch {} }
};
const closeThemePicker = () => {themePicker.hidden = true;themeToggle.setAttribute("aria-expanded","false");};
themeToggle.addEventListener("click", () => {
  themePicker.hidden = !themePicker.hidden;
  themeToggle.setAttribute("aria-expanded", String(!themePicker.hidden));
  if (!themePicker.hidden) themeChoices.find(b=>b.getAttribute("aria-pressed")==="true")?.focus();
});
themeClose.addEventListener("click", () => {closeThemePicker();themeToggle.focus();});
themeChoices.forEach(button=>button.addEventListener("click",()=>applyTheme(button.dataset.themeChoice)));
document.addEventListener("click", event=>{if (!themePicker.contains(event.target) && !themeToggle.contains(event.target)) closeThemePicker();});
document.addEventListener("keydown", event=>{if(event.key==="Escape" && !themePicker.hidden){closeThemePicker();themeToggle.focus();}});
let savedTheme;
try { savedTheme = localStorage.getItem("portfolio-theme"); if(!savedTheme && localStorage.getItem("theme")==="dark")savedTheme="aurora"; } catch {}
applyTheme(savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "aurora" : "arctic"), false);
