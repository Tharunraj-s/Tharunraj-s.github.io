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
    if (window.innerWidth <= 992) {
      const expanded = sidebar.classList.toggle("active");
      sidebarBtn.setAttribute("aria-expanded", String(expanded));
      sidebarBtn.querySelector("span").textContent = contactToggleText(expanded);
    }
  });
}

window.addEventListener("resize", () => {
  if (!sidebar) return;
  if (window.innerWidth > 992) {
    sidebar.classList.remove("active");
    sidebarBtn?.setAttribute("aria-expanded", "false");
    if(sidebarBtn) sidebarBtn.querySelector("span").textContent = contactToggleText(false);
  }
});

/* =====================
   SPA page navigation
   ===================== */

const navLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const target = link.dataset.navTarget;

    pages.forEach((page) => {
      page.classList.toggle("active", page.dataset.page === target);
    });

    navLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");

    // Close sidebar on nav (mobile)
    if (sidebar && window.innerWidth <= 992) {
      sidebar.classList.remove("active");
      sidebarBtn?.setAttribute("aria-expanded", "false");
      if(sidebarBtn) sidebarBtn.querySelector("span").textContent = contactToggleText(false);
    }

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
      const category = btn.dataset.filterCategory;

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

/* Text translations retain each original node for lossless switching. */
const tamilText = new Map([["Themes","தோற்றங்கள்"],["MAKE IT YOURS","உங்கள் விருப்பப்படி"],["Choose your atmosphere","உங்கள் தோற்றத்தைத் தேர்ந்தெடுங்கள்"],["Frosted blue · airy","பனிநீலம் · மென்மை"],["Midnight · teal glow","நள்ளிரவு · நீலப்பச்சை ஒளி"],["Ink black · brushed gold","கருப்பு · தங்கம்"],["Warm ivory · soft gold","வெண்மை · மென்மையான தங்கம்"],["Deep plum · lilac light","அடர் ஊதா · இளஊதா ஒளி"],["Navy glass · electric blue","அடர்நீலம் · மின்னும் நீலம்"],["Smoked charcoal · silver","கருஞ்சாம்பல் · வெள்ளி"],["Preview instantly. Your choice stays saved on this device.","உடனே மாற்றிப் பாருங்கள். உங்கள் தேர்வு இந்தச் சாதனத்தில் சேமிக்கப்படும்."],["Tharunraj","தருண்ராஜ்"],["Tharunraj Singaravelu","தருண்ராஜ் சிங்காரவேலு"],["Machine Learning Engineer","இயந்திரக் கற்றல் பொறியாளர்"],["Show Contacts","தொடர்பு விவரங்கள்"],["Hide Contacts","விவரங்களை மறைக்க"],["Email","மின்னஞ்சல்"],["Mobile","கைப்பேசி"],["Location","இருப்பிடம்"],["Ireland","அயர்லாந்து"],["About","நான்"],["Projects","செயல்திட்டங்கள்"],["Certificates","சான்றிதழ்கள்"],["Publications","வெளியீடுகள்"],["Contact","தொடர்பு"],["About Me","நான்"],["What I'm Doing","நான் செய்யும் பணிகள்"],["Machine Learning","இயந்திரக் கற்றல்"],["Predictive modelling, feature engineering and rigorous evaluation.","முன்கணிப்பு மாதிரிகள், அம்ச உருவாக்கம் மற்றும் துல்லியமான மதிப்பீடு."],["Computer Vision & Edge AI","கணினிப் பார்வை மற்றும் Edge AI"],["Visual recognition and hardware-integrated prototypes.","காட்சிகளை அடையாளம் காணுதல் மற்றும் வன்பொருளுடன் இணைந்த முன்மாதிரிகள்."],["Data Engineering & Analytics","தரவுப் பொறியியல் மற்றும் பகுப்பாய்வு"],["Distributed processing and decision-focused insights.","பகிர்ந்தமைந்த தரவுச் செயலாக்கம் மற்றும் முடிவுகளுக்கு உதவும் நுண்ணறிவு."],["Data Science & Statistics","தரவு அறிவியல் மற்றும் புள்ளியியல்"],["Experiment design, numerical modelling and reproducible analysis.","பரிசோதனை வடிவமைப்பு, எண்சார் மாதிரிகள் மற்றும் மீளுருவாக்கக்கூடிய பகுப்பாய்வு."],["Research Experience","ஆராய்ச்சி அனுபவம்"],["Applied Machine Learning Research","பயன்பாட்டு இயந்திரக் கற்றல் ஆராய்ச்சி"],["Nov 2022 – Dec 2024","நவம்பர் 2022 – டிசம்பர் 2024"],["Faculty-supervised academic research","பேராசிரியர் வழிகாட்டுதலுடன் கல்விசார் ஆராய்ச்சி"],["Developed computer-vision, healthcare-imaging and speech-analysis workflows, from data annotation and augmentation to model training and evaluation. Led vision development and hardware integration for an IEEE-published edge-AI prototype recognised with the ICBSII 2023 Best Paper Award.","தரவுகளுக்குக் குறிப்பிடுதல், தரவுப் பெருக்கம், மாதிரிப் பயிற்சி மற்றும் மதிப்பீடு வரை கணினிப் பார்வை, மருத்துவப் படங்கள் மற்றும் பேச்சுப் பகுப்பாய்வுக்கான செயல்முறைகளை உருவாக்கினேன். ICBSII 2023 சிறந்த ஆய்வுக் கட்டுரை விருது பெற்ற, IEEE-இல் வெளியான Edge AI முன்மாதிரியின் கணினிப் பார்வை உருவாக்கத்தையும் வன்பொருள் இணைப்பையும் வழிநடத்தினேன்."],["Education","கல்வி"],["MSc Data Science & Statistical Learning","MSc தரவு அறிவியல் மற்றும் புள்ளியியல் கற்றல்"],["B.Tech Computer Science & Engineering","B.Tech கணினி அறிவியல் மற்றும் பொறியியல்"],["University of Limerick · Ireland","University of Limerick · அயர்லாந்து"],["SRM Institute of Science and Technology · India","SRM Institute of Science and Technology · இந்தியா"],["Technical Skills","தொழில்நுட்பத் திறன்கள்"],["Languages & Databases","நிரலாக்க மொழிகள் மற்றும் தரவுத்தளங்கள்"],["ML & Statistical Methods","இயந்திரக் கற்றல் மற்றும் புள்ளியியல் முறைகள்"],["Deep Learning & Vision","ஆழ்கற்றல் மற்றும் கணினிப் பார்வை"],["Data Processing & Visualisation","தரவுச் செயலாக்கம் மற்றும் காட்சிப்படுத்தல்"],["Development & Cloud","மென்பொருள் உருவாக்கம் மற்றும் மேகக் கணினி"],["Hardware & Simulation","வன்பொருள் மற்றும் உருவகப்படுத்தல்"],["Python · SQL · R · C++ · Relational Database Design","Python · SQL · R · C++ · தொடர்புநிலைத் தரவுத்தள வடிவமைப்பு"],["scikit-learn · Statistical Inference · Cross-Validation · Hyperparameter Optimisation · A/B Testing","scikit-learn · புள்ளியியல் உய்த்துணர்வு · குறுக்கு மதிப்பீடு · மிகைஅளவுரு மேம்பாடு · A/B சோதனை"],["All","அனைத்தும்"],["AI/ML","AI/ML"],["Data Analytics","தரவுப் பகுப்பாய்வு"],["Select category","வகையைத் தேர்ந்தெடுங்கள்"],["Real-Time Edge AI Active Protection System","நிகழ்நேர Edge AI செயற்பாட்டுப் பாதுகாப்பு அமைப்பு"],["Real-time detection with hardware integration…","வன்பொருள் இணைப்புடன் நிகழ்நேரக் கண்டறிதல்…"],["Read more ↗","மேலும் படிக்க ↗"],["View project ↗","செயல்திட்டத்தைப் பார்க்க ↗"],["Led computer-vision development in a five-member team, from annotation and model experimentation to servo-controlled target alignment. IEEE publication and ICBSII 2023 Best Paper Award.","ஐவர் குழுவில், தரவுகளுக்குக் குறிப்பிடுதல் மற்றும் மாதிரிப் பரிசோதனைகள் முதல் சர்வோ மூலம் இலக்குடன் சீரமைத்தல் வரை கணினிப் பார்வை உருவாக்கத்தை வழிநடத்தினேன். IEEE வெளியீடு மற்றும் ICBSII 2023 சிறந்த ஆய்வுக் கட்டுரை விருது."],["Renal Failure Prediction System","சிறுநீரகச் செயலிழப்பு முன்கணிப்பு அமைப்பு"],["Biomarker prediction and renal CT-image analysis…","உயிரியல் குறிகாட்டிகள் மூலம் முன்கணிப்பு மற்றும் சிறுநீரக CT படப் பகுப்பாய்வு…"],["Combined 24 biomarkers across approximately 400 records with CT-image analysis. Random Forest achieved approximately 96% accuracy; YOLOv8 achieved approximately 0.94–0.96 mAP@50 on the project evaluation.","சுமார் 400 பதிவுகளில் உள்ள 24 உயிரியல் குறிகாட்டிகளை CT படப் பகுப்பாய்வுடன் இணைத்தேன். செயல்திட்ட மதிப்பீட்டில் Random Forest சுமார் 96% துல்லியத்தையும் YOLOv8 சுமார் 0.94–0.96 mAP@50 மதிப்பையும் பெற்றன."],["Speech Emotion Recognition","பேச்சில் உணர்ச்சிகளை அடையாளம் காணுதல்"],["Speech-emotion modelling across four datasets…","நான்கு தரவுத்தொகுப்புகளில் பேச்சு உணர்ச்சி மாதிரிகள்…"],["Explored TESS, CREMA-D, SAVEE and RAVDESS. The best TESS experiment achieved 99.64% accuracy using MFCC-40 and first-level DWT; this result is specific to that dataset and experiment.","TESS, CREMA-D, SAVEE மற்றும் RAVDESS தரவுத்தொகுப்புகளை ஆய்வு செய்தேன். MFCC-40 மற்றும் முதல் நிலை DWT பயன்படுத்திய சிறந்த TESS பரிசோதனை 99.64% துல்லியத்தைப் பெற்றது; இந்த முடிவு அந்தத் தரவுத்தொகுப்புக்கும் பரிசோதனைக்கும் மட்டுமே பொருந்தும்."],["Large-Scale Chicago Crime Analytics","பெருமளவிலான சிகாகோ குற்றத் தரவுப் பகுப்பாய்வு"],["Distributed analytics across 7 million crime records…","70 லட்சம் குற்றப் பதிவுகளில் பகிர்ந்தமைந்த பகுப்பாய்வு…"],["Processed 7M+ records with distributed preprocessing and feature engineering. Improved Random Forest accuracy from approximately 87% to 89% through feature selection, cross-validation and tuning.","பகிர்ந்தமைந்த முன்செயலாக்கம் மற்றும் அம்ச உருவாக்கம் மூலம் 70 லட்சத்துக்கும் மேற்பட்ட பதிவுகளைச் செயலாக்கினேன். அம்சத் தேர்வு, குறுக்கு மதிப்பீடு மற்றும் அளவுருத் திருத்தம் மூலம் Random Forest துல்லியத்தைச் சுமார் 87%-இலிருந்து 89%-ஆக உயர்த்தினேன்."],["Customer Segmentation & Analytics","வாடிக்கையாளர் பிரிவாக்கம் மற்றும் பகுப்பாய்வு"],["Customer segments and interactive business insights…","வாடிக்கையாளர் பிரிவுகள் மற்றும் ஊடாடும் வணிக நுண்ணறிவு…"],["Compared clustering methods, analysed customer lifetime value and experimental outcomes, and presented results through an interactive R Shiny application.","குழுவாக்க முறைகளை ஒப்பிட்டு, வாடிக்கையாளரின் வாழ்நாள் மதிப்பையும் பரிசோதனை முடிவுகளையும் பகுப்பாய்வு செய்து, ஊடாடும் R Shiny செயலி மூலம் முடிவுகளை வழங்கினேன்."],["Mathematical Modelling of Glass Etching","கண்ணாடி அரிப்பின் கணித மாதிரியாக்கம்"],["Multi-species glass etching through numerical models…","பல வேதிப்பொருட்களால் நிகழும் கண்ணாடி அரிப்பின் எண்சார் மாதிரிகள்…"],["MSc thesis exploring multi-species glass etching through MATLAB differential-equation models and an exploratory Python lattice simulation. The public release includes run instructions and model limitations.","MATLAB வகைக்கெழுச் சமன்பாட்டு மாதிரிகள் மற்றும் தொடக்கநிலை Python கட்டமைப்பு உருவகப்படுத்தல் மூலம் பல வேதிப்பொருட்களால் நிகழும் கண்ணாடி அரிப்பை ஆராய்ந்த MSc ஆய்வேடு. பொதுவெளியீட்டில் இயக்க வழிமுறைகளும் மாதிரியின் வரம்புகளும் உள்ளன."],["US Road Network Analysis","அமெரிக்கச் சாலை வலையமைப்புப் பகுப்பாய்வு"],["Road-network topology and local connectivity…","சாலை வலையமைப்பின் கட்டமைப்பும் உள்ளூர் இணைப்புகளும்…"],["Explored US road-network connectivity using degree distributions, complementary cumulative distributions, local clustering coefficients and six-hop neighbourhood visualisations in R.","R மூலம் இணைப்பு எண்ணிக்கைப் பரவல்கள், நிரப்பு ஒட்டுமொத்தப் பரவல்கள், உள்ளூர் குழுவாக்கக் குணகங்கள் மற்றும் ஆறு இணைப்புப் படிநிலைகளுக்குள் உள்ள அண்டைப் பகுதிகளின் காட்சிப்படுத்தல்களைப் பயன்படுத்தி அமெரிக்கச் சாலை வலையமைப்பை ஆராய்ந்தேன்."],["Heart Disease Analysis & Prediction","இதய நோய்ப் பகுப்பாய்வு மற்றும் முன்கணிப்பு"],["Comparing classifiers on heart-disease survey data…","இதய நோய்க் கணக்கெடுப்புத் தரவுகளில் வகைப்படுத்தும் மாதிரிகளின் ஒப்பீடு…"],["Compared XGBoost and Random Forest using stratified train/test splitting, cross-validation, ROC-AUC and feature importance. The curated release documents evaluation conventions and requires the original input dataset.","பிரிவுகளின் விகிதத்தைப் பேணும் பயிற்சி/சோதனைப் பிரிப்பு, குறுக்கு மதிப்பீடு, ROC-AUC மற்றும் அம்ச முக்கியத்துவம் மூலம் XGBoost மற்றும் Random Forest-ஐ ஒப்பிட்டேன். தொகுக்கப்பட்ட வெளியீட்டில் மதிப்பீட்டு முறைகள் விளக்கப்பட்டுள்ளன; அதை இயக்க அசல் தரவுத்தொகுப்பு தேவை."],["Credly Badges","Credly சான்றுப் பதக்கங்கள்"],["Credential earned via Credly.","Credly மூலம் பெறப்பட்ட சான்று."],["Learned and built AI-powered applications using Python, IBM Watson APIs and OpenCV.","Python, IBM Watson API-கள் மற்றும் OpenCV மூலம் AI செயலிகளை உருவாக்கக் கற்றுக்கொண்டேன்."],["Best Paper Award – ICBSII 2023","சிறந்த ஆய்வுக் கட்டுரை விருது – ICBSII 2023"],["Presented “Vision-Based Realtime Active Protection System Using Deep CNN” and won Best Paper Award.","“Vision-Based Realtime Active Protection System Using Deep CNN” ஆய்வை வழங்கிச் சிறந்த ஆய்வுக் கட்டுரை விருதைப் பெற்றேன்."],["Built and trained ML models using NumPy and Scikit-learn for regression and classification tasks.","பின்னடைவு மற்றும் வகைப்படுத்தலுக்கான இயந்திரக் கற்றல் மாதிரிகளை NumPy மற்றும் Scikit-learn மூலம் உருவாக்கிப் பயிற்றுவித்தேன்."],["Earned Microsoft AI-900 certification, demonstrating foundational knowledge of AI services on Azure.","Azure AI சேவைகளின் அடிப்படை அறிவை உறுதிப்படுத்தும் Microsoft AI-900 சான்றிதழைப் பெற்றேன்."],["Built a CNN model using the Fashion MNIST dataset for image classification.","பட வகைப்படுத்தலுக்காக Fashion MNIST தரவுத்தொகுப்பைப் பயன்படுத்தி CNN மாதிரியை உருவாக்கினேன்."],["Created beginner games using Python and Pygame framework.","Python மற்றும் Pygame மூலம் தொடக்கநிலை விளையாட்டுகளை உருவாக்கினேன்."],["Completed Udemy course covering Python fundamentals and OOP.","Python அடிப்படைகள் மற்றும் பொருள் நோக்கு நிரலாக்கம் குறித்த Udemy படிப்பை முடித்தேன்."],["Participated in national AI initiative and built a face recognition model.","தேசிய AI முயற்சியில் பங்கேற்று முக அடையாள மாதிரியை உருவாக்கினேன்."],["Completed AWS Machine Learning Essentials training for technical decision-makers.","தொழில்நுட்ப முடிவெடுப்பவர்களுக்கான AWS Machine Learning Essentials பயிற்சியை முடித்தேன்."],["Completed JavaScript course conducted by SRM Axis Intellects.","SRM Axis Intellects நடத்திய JavaScript படிப்பை முடித்தேன்."],["Read paper details ↗","ஆய்வு விவரங்களைப் படிக்க ↗"],["Read publisher PDF ↗","வெளியீட்டாளரின் PDF-ஐப் படிக்க ↗"],["Read IEEE publication ↗","IEEE வெளியீட்டைப் படிக்க ↗"],["FMDB Transactions on Sustainable Health Science Letters, 2(3), 152–163. Published 1 September 2024.","FMDB Transactions on Sustainable Health Science Letters, 2(3), 152–163. வெளியீடு: 1 செப்டம்பர் 2024."],["Research on deep learning for renal CT-image analysis, including YOLOv8-based detection and segmentation of kidney abnormalities.","YOLOv8 அடிப்படையில் சிறுநீரகப் பாதிப்புகளைக் கண்டறிதல் மற்றும் படப் பிரிவாக்கம் உட்பட, சிறுநீரக CT படப் பகுப்பாய்வுக்கான ஆழ்கற்றல் ஆராய்ச்சி."],["Published in the 2023 International Conference on Biosignals, Images and Instrumentation (ICBSII), IEEE Xplore.","2023 International Conference on Biosignals, Images and Instrumentation (ICBSII) மாநாட்டில் வெளியிடப்பட்டு IEEE Xplore-இல் இடம்பெற்றது."],["Research on deep-learning-based real-time visual detection with hardware integration. The project combined YOLOv5 and OpenCV with Raspberry Pi and Arduino for detection and servo-controlled target alignment.","வன்பொருள் இணைப்புடன் ஆழ்கற்றல் அடிப்படையிலான நிகழ்நேரக் காட்சிக் கண்டறிதல் ஆராய்ச்சி. கண்டறிதல் மற்றும் சர்வோ மூலம் இலக்குடன் சீரமைத்தலுக்காக YOLOv5, OpenCV, Raspberry Pi மற்றும் Arduino இணைக்கப்பட்டன."],["Recognised with the ICBSII 2023 Best Paper Award.","ICBSII 2023 சிறந்த ஆய்வுக் கட்டுரை விருது பெற்றது."],["Let’s connect about graduate and junior opportunities in machine learning, computer vision and data science.","இயந்திரக் கற்றல், கணினிப் பார்வை மற்றும் தரவு அறிவியல் துறைகளில் வாய்ப்புகள் குறித்து பேசலாம்."],["Send an email ↗","மின்னஞ்சல் அனுப்ப ↗"],["Connect on LinkedIn ↗","LinkedIn-இல் இணைய ↗"],["Call me ↗","அழைக்க ↗"],["Explore my code ↗","என் நிரல்களைப் பார்க்க ↗"],["Based in Ireland","அயர்லாந்தில் வசிக்கிறேன்"],["Jun 2023","ஜூன் 2023"],["Mar 2023","மார்ச் 2023"],["Feb 2023","பிப்ரவரி 2023"],["Oct 2022","அக்டோபர் 2022"],["Dec 2022","டிசம்பர் 2022"],["Nov 2022","நவம்பர் 2022"],["Jan 2023","ஜனவரி 2023"],["Apr 2021","ஏப்ரல் 2021"],["Feb 2022","பிப்ரவரி 2022"]]);
let siteLanguage = "en";
const contactToggleText = expanded => siteLanguage === "ta" ? (expanded ? "விவரங்களை மறைக்க" : "தொடர்பு விவரங்கள்") : (expanded ? "Hide Contacts" : "Show Contacts");
const languageButton = document.getElementById("language-toggle");
const languageWave = document.getElementById("language-wave");
const summaryElement = document.querySelector(".intro-summary p");
const englishSummary = summaryElement.innerHTML;
const translatedNodes = [];
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
let translationNode;
while ((translationNode = walker.nextNode())) {
  if (translationNode.parentElement.closest("script,style,#language-toggle,.intro-summary,.projects-modal")) continue;
  const original = translationNode.nodeValue;
  const key = original.trim();
  if (tamilText.has(key)) translatedNodes.push({node:translationNode,original,tamil:original.replace(key,tamilText.get(key))});
}
const attributeTranslations = [
  ["Choose a theme","தோற்றத்தைத் தேர்ந்தெடுங்கள்"],["Theme picker","தோற்றத் தேர்வு"],["Close theme picker","தோற்றத் தேர்வை மூடுக"],["Primary","முதன்மை வழிசெலுத்தல்"],["Project filters","செயல்திட்ட வடிகட்டிகள்"],["Project list","செயல்திட்டப் பட்டியல்"],["Credly badges","Credly சான்றுப் பதக்கங்கள்"],["Certificates list","சான்றிதழ் பட்டியல்"],["Publications list","வெளியீட்டுப் பட்டியல்"],["Contact options","தொடர்பு வழிகள்"],["Details modal","விவரங்கள்"],["Close","மூடுக"]
];
const attributeMap = new Map(attributeTranslations);
const translatedAttributes = [];
document.querySelectorAll("[aria-label],img[alt]").forEach(element=>{
  ["aria-label","alt"].forEach(name=>{
    const original=element.getAttribute(name); if(!original)return;
    const tamil=attributeMap.get(original)||tamilText.get(original)||(original.startsWith("Read about ") ? "விவரங்களைப் படிக்க: "+(tamilText.get(original.slice(11))||original.slice(11)) : null);
    if(tamil)translatedAttributes.push({element,name,original,tamil});
  });
});
function setSiteLanguage(language, persist=true) {
  siteLanguage=language==="ta"?"ta":"en";
  document.documentElement.lang=siteLanguage;
  translatedNodes.forEach(item=>item.node.nodeValue=siteLanguage==="ta"?item.tamil:item.original);
  translatedAttributes.forEach(item=>item.element.setAttribute(item.name,siteLanguage==="ta"?item.tamil:item.original));
  summaryElement.innerHTML=siteLanguage==="ta"?"இயந்திரங்களுக்கு வடிவங்களை அடையாளம் காணக் கற்றுக்கொடுத்துக்கொண்டும், அவை எப்போதும் சொல்வதைக் கேட்பதில்லை என்று புரிந்துகொண்டுக்கொண்டும் இருந்த இடைவெளியில், <strong>University of Limerick-இல் தரவு அறிவியல் மற்றும் புள்ளியியல் கற்றலில் MSc பட்டம்</strong> பெற்றேன். தரவைச் சந்திக்கும் வரை அருமையாகத் தெரிந்த சில யோசனைகளைக் கடந்து, <strong>இரண்டு ஆய்வுக் கட்டுரை வெளியீடுகளும்</strong> <strong>IEEE மாநாட்டின் சிறந்த ஆய்வுக் கட்டுரை விருதும்</strong> கிடைத்தன. இப்போது அயர்லாந்தில், இந்த அனுபவத்தைக் குழுவுடன் சேர்ந்து பயன்படுத்தக்கூடிய ஒரு பணியைத் தேடுகிறேன். மருத்துவ முன்கணிப்பு, கணித மாதிரியாக்கம், <strong>70 லட்சம் பதிவுகளில்</strong> கொஞ்சம் ஒழுங்கைக் கண்டுபிடித்தல் என்று என் வேலை நீள்கிறது—அதுவும் போதவில்லை போல, இலக்குகளைக் கண்டறிந்து, பின்தொடர்ந்து, அவற்றைக் குறிவைக்கும் <strong>கணினிப் பார்வை அடிப்படையிலான செயற்பாட்டுப் பாதுகாப்பு முன்மாதிரியையும்</strong> உருவாக்கினேன்.":englishSummary;
  if(sidebarBtn)sidebarBtn.querySelector("span").textContent=contactToggleText(sidebar.classList.contains("active"));
  languageButton.setAttribute("aria-pressed",String(siteLanguage==="ta"));
  languageButton.setAttribute("aria-label",siteLanguage==="ta"?"Switch to English":"Switch to Tamil");
  closeModal();
  if(persist){try{localStorage.setItem("portfolio-language",siteLanguage)}catch{}}
}
let languageBusy=false;
const tamilFontReady=document.fonts ? document.fonts.load('400 16px "Noto Sans Tamil"').catch(()=>[]) : Promise.resolve();
languageButton.addEventListener("click",async()=>{
  if(languageBusy)return;
  languageBusy=true;
  const next=siteLanguage==="en"?"ta":"en";
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduced){setSiteLanguage(next);languageBusy=false;return;}
  const rect=languageButton.getBoundingClientRect();
  const x=rect.left+rect.width/2,y=rect.top+rect.height/2;
  const radius=Math.hypot(Math.max(x,window.innerWidth-x),Math.max(y,window.innerHeight-y));
  const origin=x+"px "+y+"px";
  languageWave.style.clipPath="circle(0px at "+origin+")";
  languageWave.style.opacity="1";
  languageWave.hidden=false;
  try {
    await languageWave.animate([{clipPath:"circle(0px at "+origin+")"},{clipPath:"circle("+radius+"px at "+origin+")"}],{duration:260,easing:"cubic-bezier(.2,.7,.3,1)",fill:"forwards"}).finished;
    document.body.classList.add("language-covered");
    setSiteLanguage(next);
    await Promise.race([tamilFontReady,new Promise(resolve=>setTimeout(resolve,60))]);
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    document.body.classList.remove("language-covered");
    await languageWave.animate([{opacity:1},{opacity:0}],{duration:180,easing:"ease-out",fill:"forwards"}).finished;
  } finally {
    document.body.classList.remove("language-covered");
    languageWave.hidden=true;
    languageWave.getAnimations().forEach(animation=>animation.cancel());
    languageBusy=false;
  }
});
let savedLanguage;
try{savedLanguage=localStorage.getItem("portfolio-language")}catch{}
setSiteLanguage(savedLanguage||"en",false);
