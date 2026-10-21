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


const navigationBar=document.querySelector(".navbar");
const navList=document.querySelector(".navbar-list");
const navPill=document.createElement("span");
navPill.className="nav-motion-pill";
navPill.setAttribute("aria-hidden","true");
navList.prepend(navPill);
function positionNavPill(){
  const active=navList.querySelector(".navbar-link.active");
  if(!active)return;
  const box=active.getBoundingClientRect(),list=navList.getBoundingClientRect();
  navPill.style.width=box.width+"px";navPill.style.height=box.height+"px";
  navPill.style.transform="translate("+(box.left-list.left+navList.scrollLeft)+"px,"+(box.top-list.top+navList.scrollTop)+"px)";
}
const reduceMotion=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function highlightSection(target){
  navLinks.forEach(link=>{
    const active=link.dataset.navTarget===target;
    link.classList.toggle("active",active);
    if(active)link.setAttribute("aria-current","location");else link.removeAttribute("aria-current");
  });
  positionNavPill();
}
let navigationAnimation=0;
function cancelNavigationScroll(){if(navigationAnimation)cancelAnimationFrame(navigationAnimation);navigationAnimation=0;}
window.addEventListener("wheel",cancelNavigationScroll,{passive:true});
window.addEventListener("touchstart",cancelNavigationScroll,{passive:true});
window.addEventListener("keydown",event=>{if(["ArrowDown","ArrowUp","PageDown","PageUp","Home","End"," "].includes(event.key))cancelNavigationScroll();});
function scrollToSection(top){
  cancelNavigationScroll();
  const start=window.scrollY;
  const end=Math.max(0,Math.min(top,document.documentElement.scrollHeight-window.innerHeight));
  const distance=end-start;
  if(reduceMotion()||Math.abs(distance)<2){window.scrollTo(0,end);return;}
  const duration=Math.min(700,Math.max(320,Math.abs(distance)*.13));
  let began;
  function frame(now){
    if(began===undefined)began=now;
    const progress=Math.min(1,(now-began)/duration);
    const eased=progress<.5?4*progress*progress*progress:1-Math.pow(-2*progress+2,3)/2;
    window.scrollTo({top:start+distance*eased,left:0,behavior:"instant"});
    if(progress<1)navigationAnimation=requestAnimationFrame(frame);else navigationAnimation=0;
  }
  navigationAnimation=requestAnimationFrame(frame);
}
navLinks.forEach(link=>link.addEventListener("click",()=>{
  const target=document.querySelector('[data-page="'+link.dataset.navTarget+'"]');
  if(!target)return;
  if(sidebar && window.innerWidth<=992){
    sidebar.classList.remove("active");
    sidebarBtn?.setAttribute("aria-expanded","false");
    if(sidebarBtn)sidebarBtn.querySelector("span").textContent=contactToggleText(false);
  }
  const offset=navigationBar.getBoundingClientRect().height+26;
  scrollToSection(target.getBoundingClientRect().top+window.scrollY-offset);
}));
let scrollFrame=0;
function updateCurrentSection(){
  scrollFrame=0;
  const threshold=navigationBar.getBoundingClientRect().height+40;
  let current=pages[0];
  pages.forEach(page=>{if(page.getBoundingClientRect().top<=threshold)current=page;});
  if(window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-8)current=pages[pages.length-1];
  highlightSection(current.dataset.page);
}
window.addEventListener("scroll",()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateCurrentSection)},{passive:true});
window.addEventListener("resize",updateCurrentSection);
updateCurrentSection();

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

  clearTimeout(modalCloseTimer);
  modalContainer.classList.remove("is-closing");
  modalContainer.classList.add("active");
  modalCloseBtn?.focus();
};

let modalCloseTimer;
const closeModal = () => {
  if(!modalContainer?.classList.contains("active"))return;
  clearTimeout(modalCloseTimer);
  if(reduceMotion()){modalContainer.classList.remove("active");return;}
  modalContainer.classList.add("is-closing");
  modalCloseTimer=setTimeout(()=>{modalContainer.classList.remove("active","is-closing");},150);
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


if(filterBtns.length && filterItems.length){
  filterBtns.forEach(btn=>btn.addEventListener("click",()=>{
    const category=btn.dataset.filterCategory;
    const oldBoxes=new Map([...filterItems].filter(item=>item.style.display!=="none").map(item=>[item,item.getBoundingClientRect()]));
    filterBtns.forEach(b=>b.classList.toggle("active",b===btn));
    filterItems.forEach(item=>{
      item.getAnimations().forEach(animation=>animation.cancel());
      const show=category==="all"||item.dataset.category===category;
      item.classList.toggle("active",show);
      item.style.display=show?"block":"none";
      if(!show)return;
      item.classList.add("is-revealed");
      if(reduceMotion())return;
      const box=item.getBoundingClientRect(),old=oldBoxes.get(item);
      const frames=old?[{transform:"translate("+(old.left-box.left)+"px,"+(old.top-box.top)+"px)"},{transform:"translate(0,0)"}]:[{opacity:0,transform:"translateY(8px)"},{opacity:1,transform:"translateY(0)"}];
      item.animate(frames,{duration:220,easing:"cubic-bezier(.2,.8,.2,1)"});
    });
  }));
}


const themeToggle = document.getElementById("theme-toggle");
const themePicker = document.getElementById("theme-picker");
const themeClose = document.getElementById("theme-picker-close");
const themeChoices = [...document.querySelectorAll("[data-theme-choice]")];
const darkThemes = new Set(["velvet","obsidian","amethyst","cobalt","graphite","emerald"]);
const applyTheme = (id, persist = true) => {
  if (!themeChoices.some(button => button.dataset.themeChoice === id)) id = "arctic";
  document.body.dataset.theme = id;
  document.body.classList.toggle("dark-mode", darkThemes.has(id));
  document.documentElement.style.setProperty("--scroll-accent",getComputedStyle(document.body).getPropertyValue("--accent-blue").trim());
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
try { savedTheme = localStorage.getItem("portfolio-theme"); if(savedTheme==="aurora")savedTheme="velvet"; if(!savedTheme && localStorage.getItem("theme")==="dark")savedTheme="velvet"; } catch {}
applyTheme(savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "velvet" : "arctic"), false);

/* Text translations retain each original node for lossless switching. */
const tamilText = new Map([["Play a round against me, or take the rover for a run.","என்னுடன் ஒரு சுற்று விளையாடுங்கள், அல்லது ரோவரை ஓட்டிப் பாருங்கள்."],["Feeling bored? Let’s play a game.","சலிப்பாக இருக்கிறதா? ஒரு விளையாட்டு விளையாடலாம்."],["A little robot. A few obstacles. How far can you go?","ஒரு சிறிய ரோபோ. சில தடைகள். எவ்வளவு தூரம் செல்ல முடியும்?"],["Play","விளையாடு"],["Feeling bored? Let’s play.","சலிப்பாக இருக்கிறதா? விளையாடலாம்."],["A quick round of XO. You’re X. The computer is O.","ஒரு சிறிய XO ஆட்டம். நீங்கள் X. கணினி O."],["Forest glass · quiet emerald","காட்டுப்பச்சை கண்ணாடி · மென்மையான மரகதம்"],["Project-day demo: visual detection, hardware setup and radar display.","செயல்திட்ட நாள் விளக்கம்: காட்சிக் கண்டறிதல், வன்பொருள் அமைப்பு மற்றும் ரேடார் காட்சி."],["Your browser cannot play this video.","இந்த உலாவியில் காணொளியை இயக்க முடியவில்லை."],["Watch on GitHub ↗","GitHub-இல் பார்க்க ↗"],["Copy email","மின்னஞ்சலை நகலெடுக்க"],["Themes","தோற்றங்கள்"],["MAKE IT YOURS","உங்கள் விருப்பப்படி"],["Choose your atmosphere","உங்கள் தோற்றத்தைத் தேர்ந்தெடுங்கள்"],["Frosted blue · airy","பனிநீலம் · மென்மை"],["Burgundy glass · scarlet glow","பர்கண்டி கண்ணாடி · செந்நிற ஒளி"],["Ink black · brushed gold","கருப்பு · தங்கம்"],["Warm ivory · soft gold","வெண்மை · மென்மையான தங்கம்"],["Deep plum · lilac light","அடர் ஊதா · இளஊதா ஒளி"],["Navy glass · electric blue","அடர்நீலம் · மின்னும் நீலம்"],["Smoked charcoal · silver","கருஞ்சாம்பல் · வெள்ளி"],["Preview instantly. Your choice stays saved on this device.","உடனே மாற்றிப் பாருங்கள். உங்கள் தேர்வு இந்தச் சாதனத்தில் சேமிக்கப்படும்."],["Tharunraj","தருண்ராஜ்"],["Tharunraj Singaravelu","தருண்ராஜ் சிங்காரவேலு"],["Machine Learning Engineer","இயந்திரக் கற்றல் பொறியாளர்"],["Show Contacts","தொடர்பு விவரங்கள்"],["Hide Contacts","விவரங்களை மறைக்க"],["Email","மின்னஞ்சல்"],["Mobile","கைப்பேசி"],["Location","இருப்பிடம்"],["Ireland","அயர்லாந்து"],["About","நான்"],["Projects","செயல்திட்டங்கள்"],["Certificates","சான்றிதழ்கள்"],["Publications","வெளியீடுகள்"],["Contact","தொடர்பு"],["About Me","நான்"],["What I'm Doing","நான் செய்யும் பணிகள்"],["Machine Learning","இயந்திரக் கற்றல்"],["Predictive modelling, feature engineering and rigorous evaluation.","முன்கணிப்பு மாதிரிகள், அம்ச உருவாக்கம் மற்றும் துல்லியமான மதிப்பீடு."],["Computer Vision & Edge AI","கணினிப் பார்வை மற்றும் Edge AI"],["Visual recognition and hardware-integrated prototypes.","காட்சிகளை அடையாளம் காணுதல் மற்றும் வன்பொருளுடன் இணைந்த முன்மாதிரிகள்."],["Data Engineering & Analytics","தரவுப் பொறியியல் மற்றும் பகுப்பாய்வு"],["Distributed processing and decision-focused insights.","பகிர்ந்தமைந்த தரவுச் செயலாக்கம் மற்றும் முடிவுகளுக்கு உதவும் நுண்ணறிவு."],["Data Science & Statistics","தரவு அறிவியல் மற்றும் புள்ளியியல்"],["Experiment design, numerical modelling and reproducible analysis.","பரிசோதனை வடிவமைப்பு, எண்சார் மாதிரிகள் மற்றும் மீளுருவாக்கக்கூடிய பகுப்பாய்வு."],["Research Experience","ஆராய்ச்சி அனுபவம்"],["Applied Machine Learning Research","பயன்பாட்டு இயந்திரக் கற்றல் ஆராய்ச்சி"],["Nov 2022 – Dec 2024","நவம்பர் 2022 – டிசம்பர் 2024"],["Faculty-supervised academic research","பேராசிரியர் வழிகாட்டுதலுடன் கல்விசார் ஆராய்ச்சி"],["Developed computer-vision, healthcare-imaging and speech-analysis workflows, from data annotation and augmentation to model training and evaluation. Led vision development and hardware integration for an IEEE-published edge-AI prototype recognised with the ICBSII 2023 Best Paper Award.","தரவுகளுக்குக் குறிப்பிடுதல், தரவுப் பெருக்கம், மாதிரிப் பயிற்சி மற்றும் மதிப்பீடு வரை கணினிப் பார்வை, மருத்துவப் படங்கள் மற்றும் பேச்சுப் பகுப்பாய்வுக்கான செயல்முறைகளை உருவாக்கினேன். ICBSII 2023 சிறந்த ஆய்வுக் கட்டுரை விருது பெற்ற, IEEE-இல் வெளியான Edge AI முன்மாதிரியின் கணினிப் பார்வை உருவாக்கத்தையும் வன்பொருள் இணைப்பையும் வழிநடத்தினேன்."],["Education","கல்வி"],["MSc Data Science & Statistical Learning","MSc தரவு அறிவியல் மற்றும் புள்ளியியல் கற்றல்"],["B.Tech Computer Science & Engineering","B.Tech கணினி அறிவியல் மற்றும் பொறியியல்"],["University of Limerick · Ireland","University of Limerick · அயர்லாந்து"],["SRM Institute of Science and Technology · India","SRM Institute of Science and Technology · இந்தியா"],["Technical Skills","தொழில்நுட்பத் திறன்கள்"],["Languages & Databases","நிரலாக்க மொழிகள் மற்றும் தரவுத்தளங்கள்"],["ML & Statistical Methods","இயந்திரக் கற்றல் மற்றும் புள்ளியியல் முறைகள்"],["Deep Learning & Vision","ஆழ்கற்றல் மற்றும் கணினிப் பார்வை"],["Data Processing & Visualisation","தரவுச் செயலாக்கம் மற்றும் காட்சிப்படுத்தல்"],["Development & Cloud","மென்பொருள் உருவாக்கம் மற்றும் மேகக் கணினி"],["Hardware & Simulation","வன்பொருள் மற்றும் உருவகப்படுத்தல்"],["Python · SQL · R · C++ · Relational Database Design","Python · SQL · R · C++ · தொடர்புநிலைத் தரவுத்தள வடிவமைப்பு"],["scikit-learn · Statistical Inference · Cross-Validation · Hyperparameter Optimisation · A/B Testing","scikit-learn · புள்ளியியல் உய்த்துணர்வு · குறுக்கு மதிப்பீடு · மிகைஅளவுரு மேம்பாடு · A/B சோதனை"],["All","அனைத்தும்"],["AI/ML","AI/ML"],["Data Analytics","தரவுப் பகுப்பாய்வு"],["Select category","வகையைத் தேர்ந்தெடுங்கள்"],["Real-Time Edge AI Active Protection System","நிகழ்நேர Edge AI செயற்பாட்டுப் பாதுகாப்பு அமைப்பு"],["Real-time detection with hardware integration…","வன்பொருள் இணைப்புடன் நிகழ்நேரக் கண்டறிதல்…"],["Read more ↗","மேலும் படிக்க ↗"],["View project ↗","செயல்திட்டத்தைப் பார்க்க ↗"],["Led computer-vision development in a five-member team, from annotation and model experimentation to servo-controlled target alignment. IEEE publication and ICBSII 2023 Best Paper Award.","ஐவர் குழுவில், தரவுகளுக்குக் குறிப்பிடுதல் மற்றும் மாதிரிப் பரிசோதனைகள் முதல் சர்வோ மூலம் இலக்குடன் சீரமைத்தல் வரை கணினிப் பார்வை உருவாக்கத்தை வழிநடத்தினேன். IEEE வெளியீடு மற்றும் ICBSII 2023 சிறந்த ஆய்வுக் கட்டுரை விருது."],["Renal Failure Prediction System","சிறுநீரகச் செயலிழப்பு முன்கணிப்பு அமைப்பு"],["Biomarker prediction and renal CT-image analysis…","உயிரியல் குறிகாட்டிகள் மூலம் முன்கணிப்பு மற்றும் சிறுநீரக CT படப் பகுப்பாய்வு…"],["Combined 24 biomarkers across approximately 400 records with CT-image analysis. Random Forest achieved approximately 96% accuracy; YOLOv8 achieved approximately 0.94–0.96 mAP@50 on the project evaluation.","சுமார் 400 பதிவுகளில் உள்ள 24 உயிரியல் குறிகாட்டிகளை CT படப் பகுப்பாய்வுடன் இணைத்தேன். செயல்திட்ட மதிப்பீட்டில் Random Forest சுமார் 96% துல்லியத்தையும் YOLOv8 சுமார் 0.94–0.96 mAP@50 மதிப்பையும் பெற்றன."],["Speech Emotion Recognition","பேச்சில் உணர்ச்சிகளை அடையாளம் காணுதல்"],["Speech-emotion modelling across four datasets…","நான்கு தரவுத்தொகுப்புகளில் பேச்சு உணர்ச்சி மாதிரிகள்…"],["Explored TESS, CREMA-D, SAVEE and RAVDESS. The best TESS experiment achieved 99.64% accuracy using MFCC-40 and first-level DWT; this result is specific to that dataset and experiment.","TESS, CREMA-D, SAVEE மற்றும் RAVDESS தரவுத்தொகுப்புகளை ஆய்வு செய்தேன். MFCC-40 மற்றும் முதல் நிலை DWT பயன்படுத்திய சிறந்த TESS பரிசோதனை 99.64% துல்லியத்தைப் பெற்றது; இந்த முடிவு அந்தத் தரவுத்தொகுப்புக்கும் பரிசோதனைக்கும் மட்டுமே பொருந்தும்."],["Large-Scale Chicago Crime Analytics","பெருமளவிலான சிகாகோ குற்றத் தரவுப் பகுப்பாய்வு"],["Distributed analytics across 7 million crime records…","70 லட்சம் குற்றப் பதிவுகளில் பகிர்ந்தமைந்த பகுப்பாய்வு…"],["Processed 7M+ records with distributed preprocessing and feature engineering. Improved Random Forest accuracy from approximately 87% to 89% through feature selection, cross-validation and tuning.","பகிர்ந்தமைந்த முன்செயலாக்கம் மற்றும் அம்ச உருவாக்கம் மூலம் 70 லட்சத்துக்கும் மேற்பட்ட பதிவுகளைச் செயலாக்கினேன். அம்சத் தேர்வு, குறுக்கு மதிப்பீடு மற்றும் அளவுருத் திருத்தம் மூலம் Random Forest துல்லியத்தைச் சுமார் 87%-இலிருந்து 89%-ஆக உயர்த்தினேன்."],["Customer Segmentation & Analytics","வாடிக்கையாளர் பிரிவாக்கம் மற்றும் பகுப்பாய்வு"],["Customer segments and interactive business insights…","வாடிக்கையாளர் பிரிவுகள் மற்றும் ஊடாடும் வணிக நுண்ணறிவு…"],["Compared clustering methods, analysed customer lifetime value and experimental outcomes, and presented results through an interactive R Shiny application.","குழுவாக்க முறைகளை ஒப்பிட்டு, வாடிக்கையாளரின் வாழ்நாள் மதிப்பையும் பரிசோதனை முடிவுகளையும் பகுப்பாய்வு செய்து, ஊடாடும் R Shiny செயலி மூலம் முடிவுகளை வழங்கினேன்."],["Mathematical Modelling of Glass Etching","கண்ணாடி அரிப்பின் கணித மாதிரியாக்கம்"],["Multi-species glass etching through numerical models…","பல வேதிப்பொருட்களால் நிகழும் கண்ணாடி அரிப்பின் எண்சார் மாதிரிகள்…"],["MSc thesis exploring multi-species glass etching through MATLAB differential-equation models and an exploratory Python lattice simulation. The public release includes run instructions and model limitations.","MATLAB வகைக்கெழுச் சமன்பாட்டு மாதிரிகள் மற்றும் தொடக்கநிலை Python கட்டமைப்பு உருவகப்படுத்தல் மூலம் பல வேதிப்பொருட்களால் நிகழும் கண்ணாடி அரிப்பை ஆராய்ந்த MSc ஆய்வேடு. பொதுவெளியீட்டில் இயக்க வழிமுறைகளும் மாதிரியின் வரம்புகளும் உள்ளன."],["US Road Network Analysis","அமெரிக்கச் சாலை வலையமைப்புப் பகுப்பாய்வு"],["Road-network topology and local connectivity…","சாலை வலையமைப்பின் கட்டமைப்பும் உள்ளூர் இணைப்புகளும்…"],["Explored US road-network connectivity using degree distributions, complementary cumulative distributions, local clustering coefficients and six-hop neighbourhood visualisations in R.","R மூலம் இணைப்பு எண்ணிக்கைப் பரவல்கள், நிரப்பு ஒட்டுமொத்தப் பரவல்கள், உள்ளூர் குழுவாக்கக் குணகங்கள் மற்றும் ஆறு இணைப்புப் படிநிலைகளுக்குள் உள்ள அண்டைப் பகுதிகளின் காட்சிப்படுத்தல்களைப் பயன்படுத்தி அமெரிக்கச் சாலை வலையமைப்பை ஆராய்ந்தேன்."],["Heart Disease Analysis & Prediction","இதய நோய்ப் பகுப்பாய்வு மற்றும் முன்கணிப்பு"],["Comparing classifiers on heart-disease survey data…","இதய நோய்க் கணக்கெடுப்புத் தரவுகளில் வகைப்படுத்தும் மாதிரிகளின் ஒப்பீடு…"],["Compared XGBoost and Random Forest using stratified train/test splitting, cross-validation, ROC-AUC and feature importance. The curated release documents evaluation conventions and requires the original input dataset.","பிரிவுகளின் விகிதத்தைப் பேணும் பயிற்சி/சோதனைப் பிரிப்பு, குறுக்கு மதிப்பீடு, ROC-AUC மற்றும் அம்ச முக்கியத்துவம் மூலம் XGBoost மற்றும் Random Forest-ஐ ஒப்பிட்டேன். தொகுக்கப்பட்ட வெளியீட்டில் மதிப்பீட்டு முறைகள் விளக்கப்பட்டுள்ளன; அதை இயக்க அசல் தரவுத்தொகுப்பு தேவை."],["Credly Badges","Credly சான்றுப் பதக்கங்கள்"],["Credential earned via Credly.","Credly மூலம் பெறப்பட்ட சான்று."],["Learned and built AI-powered applications using Python, IBM Watson APIs and OpenCV.","Python, IBM Watson API-கள் மற்றும் OpenCV மூலம் AI செயலிகளை உருவாக்கக் கற்றுக்கொண்டேன்."],["Best Paper Award – ICBSII 2023","சிறந்த ஆய்வுக் கட்டுரை விருது – ICBSII 2023"],["Presented “Vision-Based Realtime Active Protection System Using Deep CNN” and won Best Paper Award.","“Vision-Based Realtime Active Protection System Using Deep CNN” ஆய்வை வழங்கிச் சிறந்த ஆய்வுக் கட்டுரை விருதைப் பெற்றேன்."],["Built and trained ML models using NumPy and Scikit-learn for regression and classification tasks.","பின்னடைவு மற்றும் வகைப்படுத்தலுக்கான இயந்திரக் கற்றல் மாதிரிகளை NumPy மற்றும் Scikit-learn மூலம் உருவாக்கிப் பயிற்றுவித்தேன்."],["Earned Microsoft AI-900 certification, demonstrating foundational knowledge of AI services on Azure.","Azure AI சேவைகளின் அடிப்படை அறிவை உறுதிப்படுத்தும் Microsoft AI-900 சான்றிதழைப் பெற்றேன்."],["Built a CNN model using the Fashion MNIST dataset for image classification.","பட வகைப்படுத்தலுக்காக Fashion MNIST தரவுத்தொகுப்பைப் பயன்படுத்தி CNN மாதிரியை உருவாக்கினேன்."],["Created beginner games using Python and Pygame framework.","Python மற்றும் Pygame மூலம் தொடக்கநிலை விளையாட்டுகளை உருவாக்கினேன்."],["Completed Udemy course covering Python fundamentals and OOP.","Python அடிப்படைகள் மற்றும் பொருள் நோக்கு நிரலாக்கம் குறித்த Udemy படிப்பை முடித்தேன்."],["Participated in national AI initiative and built a face recognition model.","தேசிய AI முயற்சியில் பங்கேற்று முக அடையாள மாதிரியை உருவாக்கினேன்."],["Completed AWS Machine Learning Essentials training for technical decision-makers.","தொழில்நுட்ப முடிவெடுப்பவர்களுக்கான AWS Machine Learning Essentials பயிற்சியை முடித்தேன்."],["Completed JavaScript course conducted by SRM Axis Intellects.","SRM Axis Intellects நடத்திய JavaScript படிப்பை முடித்தேன்."],["Read paper details ↗","ஆய்வு விவரங்களைப் படிக்க ↗"],["Read publisher PDF ↗","வெளியீட்டாளரின் PDF-ஐப் படிக்க ↗"],["Read IEEE publication ↗","IEEE வெளியீட்டைப் படிக்க ↗"],["FMDB Transactions on Sustainable Health Science Letters, 2(3), 152–163. Published 1 September 2024.","FMDB Transactions on Sustainable Health Science Letters, 2(3), 152–163. வெளியீடு: 1 செப்டம்பர் 2024."],["Research on deep learning for renal CT-image analysis, including YOLOv8-based detection and segmentation of kidney abnormalities.","YOLOv8 அடிப்படையில் சிறுநீரகப் பாதிப்புகளைக் கண்டறிதல் மற்றும் படப் பிரிவாக்கம் உட்பட, சிறுநீரக CT படப் பகுப்பாய்வுக்கான ஆழ்கற்றல் ஆராய்ச்சி."],["Published in the 2023 International Conference on Biosignals, Images and Instrumentation (ICBSII), IEEE Xplore.","2023 International Conference on Biosignals, Images and Instrumentation (ICBSII) மாநாட்டில் வெளியிடப்பட்டு IEEE Xplore-இல் இடம்பெற்றது."],["Research on deep-learning-based real-time visual detection with hardware integration. The project combined YOLOv5 and OpenCV with Raspberry Pi and Arduino for detection and servo-controlled target alignment.","வன்பொருள் இணைப்புடன் ஆழ்கற்றல் அடிப்படையிலான நிகழ்நேரக் காட்சிக் கண்டறிதல் ஆராய்ச்சி. கண்டறிதல் மற்றும் சர்வோ மூலம் இலக்குடன் சீரமைத்தலுக்காக YOLOv5, OpenCV, Raspberry Pi மற்றும் Arduino இணைக்கப்பட்டன."],["Recognised with the ICBSII 2023 Best Paper Award.","ICBSII 2023 சிறந்த ஆய்வுக் கட்டுரை விருது பெற்றது."],["Let’s connect about opportunities, projects and collaborations in machine learning, computer vision and data science.","இயந்திரக் கற்றல், கணினிப் பார்வை மற்றும் தரவு அறிவியலில் வாய்ப்புகள், செயல்திட்டங்கள் மற்றும் கூட்டுப்பணிகள் குறித்து இணையலாம்."],["Send an email ↗","மின்னஞ்சல் அனுப்ப ↗"],["Connect on LinkedIn ↗","LinkedIn-இல் இணைய ↗"],["Call me ↗","அழைக்க ↗"],["Explore my code ↗","என் நிரல்களைப் பார்க்க ↗"],["Based in Ireland","அயர்லாந்தில் வசிக்கிறேன்"],["Jun 2023","ஜூன் 2023"],["Mar 2023","மார்ச் 2023"],["Feb 2023","பிப்ரவரி 2023"],["Oct 2022","அக்டோபர் 2022"],["Dec 2022","டிசம்பர் 2022"],["Nov 2022","நவம்பர் 2022"],["Jan 2023","ஜனவரி 2023"],["Apr 2021","ஏப்ரல் 2021"],["Feb 2022","பிப்ரவரி 2022"]]);
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
  if (translationNode.parentElement.closest("script,style,#language-toggle,.intro-summary,.projects-modal,[data-keep-english]")) continue;
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
  requestAnimationFrame(updateCurrentSection);
  document.dispatchEvent(new Event("portfolio-language-change"));
  if(persist){try{localStorage.setItem("portfolio-language",siteLanguage)}catch{}}
}
let languageBusy=false;
const tamilFontReady=document.fonts ? document.fonts.load('400 16px "Noto Sans Tamil"').catch(()=>[]) : Promise.resolve();
languageButton.addEventListener("click",async()=>{
  if(languageBusy)return;
  languageBusy=true;
  languageButton.disabled=true;
  const next=siteLanguage==="en"?"ta":"en";
  const main=document.querySelector("main");
  let wave;
  try {
    if(next==="ta")await tamilFontReady;
    cancelNavigationScroll();
    const threshold=navigationBar.getBoundingClientRect().bottom+20;
    const anchor=[...pages].reverse().find(page=>page.getBoundingClientRect().top<=threshold)||pages[0];
    const anchorTop=anchor.getBoundingClientRect().top;
    const animate=!reduceMotion()&&typeof main.animate==="function";
    const bounds=languageButton.getBoundingClientRect();
    const x=bounds.left+bounds.width/2;
    const y=bounds.top+bounds.height/2;
    const radius=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
    const closed=`circle(0px at ${x}px ${y}px)`;
    const open=`circle(${Math.ceil(radius)}px at ${x}px ${y}px)`;
    if(animate){
      languageWave.hidden=false;
      wave=languageWave.animate([{clipPath:closed},{clipPath:open}],{duration:300,easing:"cubic-bezier(.22,1,.36,1)",fill:"forwards"});
      await wave.finished;
    }
    setSiteLanguage(next);
    await new Promise(resolve=>requestAnimationFrame(resolve));
    window.scrollTo({top:window.scrollY+anchor.getBoundingClientRect().top-anchorTop,behavior:"instant"});
    positionNavPill();
    if(animate){
      wave.cancel();
      wave=languageWave.animate([{clipPath:open},{clipPath:closed}],{duration:340,easing:"cubic-bezier(.65,0,.35,1)",fill:"forwards"});
      await wave.finished;
    }
  } finally {
    wave?.cancel();
    languageWave.hidden=true;
    languageButton.disabled=false;
    languageBusy=false;
  }
});
let savedLanguage;
try{savedLanguage=localStorage.getItem("portfolio-language")}catch{}
setSiteLanguage(savedLanguage||"en",false);

const languageToolbar=document.querySelector(".language-toolbar");
function placeLanguageControl(){
  if(window.innerWidth<=992){document.body.appendChild(languageToolbar);}
  else if(languageToolbar.parentElement!==navigationBar){navigationBar.insertBefore(languageToolbar,navigationBar.firstChild);}
}
window.addEventListener("resize",placeLanguageControl);
placeLanguageControl();

/* Reveal cards once; never hide content if motion is reduced or unsupported. */
const revealCards=document.querySelectorAll(".profile-card,.project-item,.publication-item,.certificates-post-item,.badge-item,.contact-page-card");
if("IntersectionObserver" in window && !reduceMotion()){
  const revealObserver=new IntersectionObserver(entries=>{
    entries.forEach((entry,index)=>{
      if(!entry.isIntersecting)return;
      entry.target.style.setProperty("--reveal-delay",Math.min(index*35,105)+"ms");
      entry.target.classList.add("is-revealed");
      revealObserver.unobserve(entry.target);
    });
  },{threshold:.05,rootMargin:"0px 0px 25px 0px"});
  revealCards.forEach(card=>{card.classList.add("reveal-card");revealObserver.observe(card);});
}
document.fonts?.ready.then(positionNavPill);
window.addEventListener("resize",()=>requestAnimationFrame(positionNavPill));
navList.addEventListener("scroll",positionNavPill,{passive:true});
const copyEmailButton=document.getElementById("copy-email");
const contactFeedback=document.getElementById("contact-feedback");
copyEmailButton?.addEventListener("click",async()=>{
  try{
    await navigator.clipboard.writeText("stharunraj2002@gmail.com");
    contactFeedback.textContent=document.documentElement.lang==="ta"?"மின்னஞ்சல் நகலெடுக்கப்பட்டது ✓":"Email copied ✓";
  }catch{
    contactFeedback.textContent=document.documentElement.lang==="ta"?"மின்னஞ்சல்: stharunraj2002@gmail.com":"Email: stharunraj2002@gmail.com";
  }
});

function fitDesktopSidebar(){
  if(!sidebar)return;
  if(window.innerWidth<=992){sidebar.style.removeProperty("top");sidebar.style.removeProperty("--sidebar-offset");return;}
  sidebar.style.setProperty("--sidebar-offset",Math.max(16,(window.innerHeight-sidebar.offsetHeight)/2)+"px");
}
if("ResizeObserver" in window)new ResizeObserver(fitDesktopSidebar).observe(sidebar);
window.addEventListener("resize",fitDesktopSidebar);
fitDesktopSidebar();



const xoLines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function xoResult(b){for(const line of xoLines)if(b[line[0]]&&line.every(i=>b[i]===b[line[0]]))return{winner:b[line[0]],line};return b.every(Boolean)?{winner:"draw",line:[]}:null;}
function xoChoose(b){const free=b.map((m,i)=>m?null:i).filter(i=>i!==null);for(const mark of ["O","X"])for(const i of free){const test=[...b];test[i]=mark;if(xoResult(test)?.winner===mark)return i;}if(!b[4])return 4;return free[Math.floor(Math.random()*free.length)];}
const xoCells=[...document.querySelectorAll("[data-xo-cell]")];
let xoBoard=Array(9).fill(""),xoThinking=false,xoOutcome=null,xoTimer,xoPlayer="",xoScores={me:0,you:0};
try{const saved=JSON.parse(localStorage.getItem("portfolio-xo-score")||"{}");xoScores.me=Math.max(0,Number(saved.me)||0);xoScores.you=Math.max(0,Number(saved.you)||0);xoPlayer=(localStorage.getItem("portfolio-xo-name")||"").slice(0,24);}catch{}
function renderXo(){
 const ta=document.documentElement.lang==="ta";
 xoCells.forEach((cell,i)=>{cell.textContent=xoBoard[i];cell.dataset.mark=xoBoard[i];cell.disabled=!!xoBoard[i]||xoThinking||!!xoOutcome;cell.classList.toggle("xo-win",!!xoOutcome?.line.includes(i));cell.setAttribute("aria-label",(ta?"கட்டம் ":"Square ")+(i+1)+": "+(xoBoard[i]||(ta?"காலி":"empty")));});
 const words=ta?{first:"முதல் நகர்வு உங்களுடையது.",turn:"உங்கள் முறை.",thinking:"யோசிக்கிறேன்…",X:"நீங்கள் வென்றீர்கள்! நன்றாக விளையாடினீர்கள்.",O:"இந்தச் சுற்றில் நான் வென்றேன். மீண்டும்?",draw:"ஆட்டம் சமநிலையில் முடிந்தது! இருவரும் விட்டுக்கொடுக்கவில்லை. மீண்டும் விளையாடலாமா?"}:{first:"You go first. Pick a square.",turn:"Your move. I’m watching.",thinking:"Let me think…",X:"You won! I’ll pretend I let that happen.",O:"I win this round. Rematch?",draw:"It’s a draw! Neither of us is giving in. Rematch?"};
 document.getElementById("xo-status").textContent=xoOutcome?words[xoOutcome.winner]:xoThinking?words.thinking:xoBoard.some(Boolean)?words.turn:words.first;
 document.getElementById("xo-my-score").textContent=(ta?"தருண்ராஜ்":"Tharunraj")+" · "+xoScores.me;
 document.getElementById("xo-your-score").textContent=(xoPlayer||(ta?"நீங்கள்":"You"))+" · "+xoScores.you;
 document.querySelector(".xo-eyebrow").textContent=ta?"நீங்கள் vs தருண்ராஜ்":"YOU vs THARUNRAJ";
 document.querySelector(".xo-game h3").textContent=xoOutcome?(xoOutcome.winner==="draw"?(ta?"சமநிலை!":"IT’S A DRAW!"):(ta?"ஆட்டம் முடிந்தது.":"ROUND COMPLETE.")):(ta?"XO விளையாடலாமா?":"Beat me at XO");
 document.getElementById("xo-hint").textContent=ta?"நீங்கள் X. நான் O. புள்ளிகள் இந்தச் சாதனத்தில் மட்டுமே.":"You’re X. I’m O. Scores stay on this device.";
 document.getElementById("xo-restart").textContent=ta?"மீண்டும் விளையாடு ↻":"Play again ↻";
 const form=document.getElementById("xo-name-form");form.hidden=!((xoOutcome?.winner==="X"||xoOutcome?.winner==="draw")&&!xoPlayer);
 form.querySelector("label").textContent=ta?"வணக்கம்! உங்கள் பெயர் என்ன?":"Hi, by the way—what’s your name?";
 form.querySelector("input").placeholder=ta?"உங்கள் பெயர் (விருப்பம்)":"Your name (optional)";
 form.querySelector("button").textContent=ta?"சந்தித்ததில் மகிழ்ச்சி ↗":"Nice to meet you ↗";
}
function finishXo(){xoOutcome=xoResult(xoBoard);if(xoOutcome){if(xoOutcome.winner==="X")xoScores.you++;if(xoOutcome.winner==="O")xoScores.me++;try{localStorage.setItem("portfolio-xo-score",JSON.stringify(xoScores))}catch{}}}
xoCells.forEach((cell,i)=>cell.addEventListener("click",()=>{if(xoThinking||xoOutcome||xoBoard[i])return;xoBoard[i]="X";finishXo();if(xoOutcome){renderXo();return;}xoThinking=true;renderXo();xoTimer=setTimeout(()=>{xoBoard[xoChoose(xoBoard)]="O";xoThinking=false;finishXo();renderXo();},320);}));
document.getElementById("xo-restart").addEventListener("click",()=>{clearTimeout(xoTimer);xoBoard=Array(9).fill("");xoThinking=false;xoOutcome=null;renderXo();});
document.getElementById("xo-name-form").addEventListener("submit",event=>{event.preventDefault();xoPlayer=document.getElementById("xo-player-name").value.trim().slice(0,24);if(!xoPlayer)return;try{localStorage.setItem("portfolio-xo-name",xoPlayer)}catch{}renderXo();});
const runnerCanvas=document.getElementById("runner-canvas"),runnerCtx=runnerCanvas.getContext("2d"),runnerAction=document.getElementById("runner-action"),runnerPause=document.getElementById("runner-pause"),runnerDuck=document.getElementById("runner-duck");
let runnerState="ready",runnerY=0,runnerVelocity=0,runnerDistance=0,runnerObstacles=[],runnerSpawn=1.2,runnerLast=0,runnerFrame=0,runnerBest=0,runnerDucking=false,runnerDuckUntil=0;
try{runnerBest=Math.max(0,Number(localStorage.getItem("portfolio-runner-best"))||0)}catch{}
function runnerLabels(){
 const ta=document.documentElement.lang==="ta",score=Math.floor(runnerDistance/10);
 setGameText("runner-score",(ta?"புள்ளிகள் ":"Score ")+score);setGameText("runner-best",(ta?"சிறந்தது ":"Best ")+runnerBest);
 const status=runnerState==="ready"?(ta?"தடையைத் தாண்டுங்கள். மேலே வரும் தடைக்குக் குனியுங்கள்.":"Jump ground obstacles. Duck under overhead ones."):runnerState==="over"?(ta?"மோதிவிட்டது. மீண்டும் முயலலாம்.":"Radar saw it. The rover didn’t quite dodge it."):runnerState==="paused"?(ta?"இடைநிறுத்தப்பட்டது.":"Paused. Catch your breath."):(ta?"தாவு அல்லது குனி.":"Scan. Jump. Duck. Keep moving.");
 const statusNode=document.getElementById("runner-status");if(statusNode.textContent!==status)statusNode.textContent=status;
 runnerAction.textContent=runnerState==="running"?(ta?"வலது: தாவு ▶":"Jump ▶"):runnerState==="paused"?(ta?"தொடர்க":"Resume"):(ta?runnerState==="over"?"மீண்டும் ஓடு":"ஓடத் தொடங்கு":runnerState==="over"?"Run again":"Start running");
 runnerPause.textContent=ta?"நிறுத்து":"Pause";runnerPause.disabled=runnerState!=="running";
 runnerDuck.textContent=ta?"◀ இடது: குனி":"◀ Duck";runnerDuck.disabled=runnerState!=="running";
 document.querySelector(".runner-top h3").textContent=ta?"ரோவர் ஓட்டம்":"ROVER RUN";
 document.getElementById("runner-help").textContent=ta?"இடது: குனி. வலது / Space: தாவு. கைப்பேசியின் இடப்பகுதி: குனி; வலப்பகுதி: தாவு.":"Left: duck. Right / Space: jump. Touch: left half ducks, right half jumps.";
}
let gamePalette;
function refreshGamePalette(){const style=getComputedStyle(document.body);gamePalette={accent:style.getPropertyValue("--accent-blue").trim(),text:style.getPropertyValue("--text").trim()};}
refreshGamePalette();
function setGameText(id,text){const node=document.getElementById(id);if(node.textContent!==text)node.textContent=text;}
function drawRunner(){
 const ctx=runnerCtx,a=gamePalette.accent,t=gamePalette.text;
 ctx.clearRect(0,0,720,260);ctx.strokeStyle=a;ctx.globalAlpha=.12;
 for(let r=50;r<330;r+=55){ctx.beginPath();ctx.arc(120,220,r,Math.PI,0);ctx.stroke();}
 const angle=-Math.PI+(runnerDistance*.003%Math.PI);ctx.globalAlpha=.22;ctx.beginPath();ctx.moveTo(120,220);ctx.lineTo(120+Math.cos(angle)*310,220+Math.sin(angle)*310);ctx.stroke();
 ctx.globalAlpha=.3;ctx.beginPath();ctx.moveTo(0,220);ctx.lineTo(720,220);ctx.stroke();
 for(let x=-(runnerDistance%70);x<720;x+=70){ctx.fillStyle=a;ctx.fillRect(x,237,18,2)}
 const y=220-runnerY;ctx.globalAlpha=1;ctx.fillStyle=a;ctx.fillRect(72,y-23,48,14);ctx.fillRect(83,y-31,26,8);
 if(!runnerDucking){ctx.fillRect(97,y-47,4,16);ctx.fillRect(89,y-55,20,12);ctx.fillStyle=t;ctx.fillRect(104,y-52,4,5);}
 ctx.fillStyle=t;for(const x of [82,109]){ctx.beginPath();ctx.arc(x,y-8,7,0,Math.PI*2);ctx.fill();ctx.fillStyle=a;ctx.beginPath();ctx.arc(x,y-8,3,0,Math.PI*2);ctx.fill();ctx.fillStyle=t;}
 for(const ob of runnerObstacles){drawArcadeVehicle(ctx,ob,a,t);if(ob.x<400){ctx.strokeStyle=a;ctx.globalAlpha=.3;ctx.strokeRect(ob.x-5,ob.y-5,ob.w+10,ob.h+10);ctx.globalAlpha=1;}}
 if(runnerState!=="running"){ctx.globalAlpha=.6;ctx.font="14px Poppins, sans-serif";ctx.textAlign="center";ctx.fillStyle=t;ctx.fillText(runnerState==="ready"?"ROVER READY":runnerState==="paused"?"PAUSED":"TRY ANOTHER RUN",455,105);ctx.globalAlpha=1;}
}
function runnerCollides(ob,duck,y){const top=220-y-(duck?31:55),bottom=220-y-3;return 116>ob.x+3&&76<ob.x+ob.w-3&&bottom>ob.y+3&&top<ob.y+ob.h-3;}
function runnerTick(now){
 if(runnerState!=="running")return;const dt=Math.min((now-(runnerLast||now))/1000,.035);runnerLast=now;
 if(now>runnerDuckUntil)runnerDucking=false;
 const speed=Math.min(520,255+runnerDistance*.05);runnerDistance+=speed*dt;runnerVelocity-=1600*dt;runnerY=Math.max(0,runnerY+runnerVelocity*dt);if(!runnerY)runnerVelocity=0;
 runnerSpawn-=dt;if(runnerSpawn<=0){const air=runnerDistance>500&&Math.random()<.42;const h=air?20:34;runnerObstacles.push({kind:air?"jet":"truck",x:740,w:air?62:48,h,y:air?170:220-h});runnerSpawn=(420+Math.random()*150)/speed;}
 runnerObstacles.forEach(ob=>ob.x-=speed*dt);runnerObstacles=runnerObstacles.filter(ob=>ob.x+ob.w>0);
 if(runnerObstacles.some(ob=>runnerCollides(ob,runnerDucking,runnerY))){runnerState="over";runnerBest=Math.max(runnerBest,Math.floor(runnerDistance/10));try{localStorage.setItem("portfolio-runner-best",runnerBest)}catch{}}
 runnerLabels();drawRunner();if(runnerState==="running")runnerFrame=requestAnimationFrame(runnerTick);
}
function runnerStart(){cancelAnimationFrame(runnerFrame);runnerState="running";runnerY=0;runnerVelocity=0;runnerDistance=0;runnerObstacles=[];runnerDucking=false;runnerDuckUntil=0;runnerSpawn=1.2;runnerLast=0;runnerLabels();runnerFrame=requestAnimationFrame(runnerTick);}
function runnerInput(){if(runnerState==="ready"||runnerState==="over"){runnerStart();return;}if(runnerState==="paused"){runnerState="running";runnerLast=0;runnerLabels();runnerFrame=requestAnimationFrame(runnerTick);return;}if(!runnerY){runnerDucking=false;runnerDuckUntil=0;runnerVelocity=620;}}
function duckRunner(){if(runnerState!=="running"||runnerY>0)return;runnerDucking=true;runnerDuckUntil=performance.now()+650;}
function pauseRunner(){if(runnerState!=="running")return;runnerState="paused";cancelAnimationFrame(runnerFrame);runnerLabels();drawRunner();}
runnerAction.addEventListener("click",runnerInput);runnerPause.addEventListener("click",pauseRunner);
runnerCanvas.addEventListener("pointerdown",event=>{event.preventDefault();const rect=runnerCanvas.getBoundingClientRect();if(event.clientX-rect.left<rect.width/2){duckRunner();if(runnerDucking){runnerCanvas.setPointerCapture(event.pointerId);runnerDuckUntil=Infinity;}}else runnerInput();});
["pointerup","pointercancel","lostpointercapture"].forEach(type=>runnerCanvas.addEventListener(type,()=>{if(runnerDucking)runnerDuckUntil=performance.now()+100;}));
runnerDuck.addEventListener("pointerdown",event=>{event.preventDefault();runnerDuck.setPointerCapture(event.pointerId);duckRunner();if(runnerDucking)runnerDuckUntil=Infinity;});
["pointerup","pointercancel","lostpointercapture"].forEach(type=>runnerDuck.addEventListener(type,()=>{if(runnerDucking)runnerDuckUntil=performance.now()+500;}));
runnerDuck.addEventListener("click",duckRunner);
document.querySelector(".runner-game").addEventListener("keydown",event=>{if(event.target.tagName==="BUTTON"&&event.code==="Space")return;if(["ArrowDown","ArrowLeft"].includes(event.code)){event.preventDefault();duckRunner();if(runnerDucking)runnerDuckUntil=Infinity;}else if((event.code==="Space"||event.code==="ArrowUp"||event.code==="ArrowRight")&&event.target!==runnerPause&&event.target!==runnerDuck){event.preventDefault();if(!event.repeat)runnerInput();}});
document.querySelector(".runner-game").addEventListener("keyup",event=>{if(["ArrowDown","ArrowLeft"].includes(event.code)){runnerDuckUntil=performance.now()+100;}});
document.addEventListener("visibilitychange",()=>{if(document.hidden)pauseRunner();});
new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)pauseRunner();},{threshold:.05}).observe(runnerCanvas);

function makeRadarTarget(sequence,score){
 const types=[{kind:"jet",w:62,h:20},{kind:"truck",w:48,h:34},{kind:"drone",w:44,h:22},{kind:"car",w:42,h:23},{kind:"helicopter",w:60,h:30},{kind:"rocket",w:46,h:15}];
 const type=types[sequence%types.length],direction=Math.floor(sequence/types.length)%2===0?(sequence%2===0?1:-1):(sequence%2===0?-1:1);
 return {...type,direction,x:direction>0?-type.w-20:740,y:["truck","car"].includes(type.kind)?285-type.h:42+Math.random()*(195-type.h),speed:100+Math.min(180,score*.35)+Math.random()*40};
}
function drawArcadeVehicle(ctx,ob,a,t){
 ctx.save();ctx.translate(ob.x,ob.y);if(ob.direction===1){ctx.translate(ob.w,0);ctx.scale(-1,1);}ctx.fillStyle=a;
 if(ob.kind==="jet"){ctx.beginPath();ctx.moveTo(0,10);ctx.lineTo(20,6);ctx.lineTo(32,0);ctx.lineTo(39,0);ctx.lineTo(35,7);ctx.lineTo(ob.w-10,7);ctx.lineTo(ob.w-3,2);ctx.lineTo(ob.w,2);ctx.lineTo(ob.w-3,14);ctx.lineTo(34,14);ctx.lineTo(40,ob.h);ctx.lineTo(30,ob.h);ctx.lineTo(20,14);ctx.closePath();ctx.fill();ctx.fillStyle=t;ctx.fillRect(10,8,8,3);}
 else if(ob.kind==="drone"){ctx.fillRect(14,8,16,9);ctx.fillRect(3,10,38,3);for(const x of [2,32]){ctx.fillRect(x,2,10,3);ctx.fillRect(x+4,4,2,10);}ctx.fillStyle=t;ctx.fillRect(19,12,5,5);}
 else if(ob.kind==="helicopter"){ctx.fillRect(14,9,25,14);ctx.fillRect(38,14,20,4);ctx.fillRect(55,9,4,8);ctx.fillRect(25,4,3,6);ctx.fillRect(5,2,44,3);ctx.fillRect(12,27,31,2);ctx.fillRect(19,21,3,7);ctx.fillRect(34,21,3,7);ctx.fillStyle=t;ctx.fillRect(16,11,9,7);}
 else if(ob.kind==="rocket"){ctx.beginPath();ctx.moveTo(0,7);ctx.lineTo(10,1);ctx.lineTo(36,1);ctx.lineTo(44,0);ctx.lineTo(40,7);ctx.lineTo(44,15);ctx.lineTo(36,13);ctx.lineTo(10,13);ctx.closePath();ctx.fill();ctx.fillStyle=t;ctx.fillRect(13,5,8,4);ctx.fillRect(42,5,5,4);}
 else if(ob.kind==="car"){ctx.fillRect(1,9,ob.w-2,9);ctx.fillRect(10,2,22,9);ctx.fillStyle=t;ctx.fillRect(13,4,7,5);ctx.fillRect(23,4,6,5);for(const x of [9,ob.w-9]){ctx.beginPath();ctx.arc(x,ob.h-5,5,0,Math.PI*2);ctx.fill();}}
 else{ctx.fillRect(16,0,ob.w-16,ob.h-9);ctx.fillRect(2,8,17,ob.h-17);ctx.fillStyle=t;ctx.fillRect(4,10,10,7);for(const x of [10,ob.w-10]){ctx.beginPath();ctx.arc(x,ob.h-6,6,0,Math.PI*2);ctx.fill();}}
 ctx.restore();
}
const shootCanvas=document.getElementById("shooter-canvas"),shootCtx=shootCanvas.getContext("2d"),shootStart=document.getElementById("shooter-start"),shootFire=document.getElementById("shooter-fire"),shootPause=document.getElementById("shooter-pause");
let shootState="ready",shootScore=0,shootBest=0,shootMisses=0,shootTargets=[],shootSpawn=0,shootLast=0,shootFrame=0,shootAim={x:360,y:150},shootFlash=0,shootSequence=0;
try{shootBest=Number(localStorage.getItem("portfolio-shooter-best"))||0}catch{}
function shootLabels(){
 setGameText("shooter-score","Score "+shootScore+" · Misses "+shootMisses+"/3");
 setGameText("shooter-best","Best "+shootBest);
 shootStart.textContent=shootState==="paused"?"Resume":shootState==="over"?"Play again":"Start game";shootStart.disabled=shootState==="running";shootFire.disabled=shootPause.disabled=shootState!=="running";
 const text=shootState==="over"?"Three slipped through. One more round?":shootState==="paused"?"Paused. Take your time.":shootState==="running"?"Track. Aim. Fire. Keep the radar clear.":"Targets arrive from both sides: jets, drones, helicopters, rockets, cars and trucks. Three escapes end the round.";
 const node=document.getElementById("shooter-status");if(node.textContent!==text)node.textContent=text;
}
function drawShooter(){
 const ctx=shootCtx,a=gamePalette.accent,t=gamePalette.text;
 ctx.clearRect(0,0,720,320);ctx.strokeStyle=a;ctx.globalAlpha=.12;
 for(let r=70;r<400;r+=60){ctx.beginPath();ctx.arc(360,300,r,Math.PI,0);ctx.stroke();}
 ctx.globalAlpha=.35;ctx.beginPath();ctx.moveTo(0,285);ctx.lineTo(720,285);ctx.stroke();ctx.globalAlpha=1;
 for(const ob of shootTargets)drawArcadeVehicle(ctx,ob,a,t);
 ctx.strokeStyle=a;ctx.beginPath();ctx.arc(shootAim.x,shootAim.y,13,0,Math.PI*2);ctx.moveTo(shootAim.x-20,shootAim.y);ctx.lineTo(shootAim.x+20,shootAim.y);ctx.moveTo(shootAim.x,shootAim.y-20);ctx.lineTo(shootAim.x,shootAim.y+20);ctx.stroke();
 ctx.fillStyle=a;ctx.fillRect(345,300,30,12);
 if(performance.now()<shootFlash){ctx.globalAlpha=.7;ctx.beginPath();ctx.moveTo(360,300);ctx.lineTo(shootAim.x,shootAim.y);ctx.stroke();ctx.globalAlpha=1;}
 if(shootState!=="running"){ctx.font="14px Poppins";ctx.fillStyle=t;ctx.textAlign="center";ctx.fillText(shootState==="over"?"ROUND OVER":shootState==="paused"?"PAUSED":"RADAR READY",360,150);}
}
function fireShot(){
 if(shootState!=="running")return;
 shootFlash=performance.now()+100;
 const i=shootTargets.findIndex(ob=>shootAim.x>=ob.x-8&&shootAim.x<=ob.x+ob.w+8&&shootAim.y>=ob.y-8&&shootAim.y<=ob.y+ob.h+8);
 if(i>=0){shootScore+=["truck","car"].includes(shootTargets[i].kind)?10:20;shootTargets.splice(i,1);}shootLabels();drawShooter();
}
function shootTick(now){
 if(shootState!=="running")return;
 const dt=Math.min((now-(shootLast||now))/1000,.04);shootLast=now;shootSpawn-=dt;
 if(shootSpawn<=0){shootTargets.push(makeRadarTarget(shootSequence++,shootScore));shootSpawn=Math.max(.6,1.5-shootScore*.002);}
 shootTargets.forEach(ob=>ob.x+=ob.direction*ob.speed*dt);shootTargets=shootTargets.filter(ob=>{if(ob.direction<0?ob.x+ob.w<0:ob.x>720){shootMisses++;return false;}return true;});
 if(shootMisses>=3){shootMisses=3;shootState="over";shootBest=Math.max(shootBest,shootScore);try{localStorage.setItem("portfolio-shooter-best",shootBest)}catch{}}
 shootLabels();drawShooter();if(shootState==="running")shootFrame=requestAnimationFrame(shootTick);
}
function pauseShooter(){if(shootState==="running"){shootState="paused";cancelAnimationFrame(shootFrame);shootLabels();drawShooter();}}
shootStart.addEventListener("click",()=>{if(shootState!=="paused"){shootScore=0;shootMisses=0;shootTargets=[];shootSequence=0;shootSpawn=.4;}cancelAnimationFrame(shootFrame);shootState="running";shootLast=0;shootLabels();shootFrame=requestAnimationFrame(shootTick);});
shootPause.addEventListener("click",pauseShooter);shootFire.addEventListener("click",fireShot);
shootCanvas.addEventListener("pointerdown",event=>{event.preventDefault();const r=shootCanvas.getBoundingClientRect();shootAim={x:(event.clientX-r.left)*720/r.width,y:(event.clientY-r.top)*320/r.height};fireShot();drawShooter();});
shootCanvas.addEventListener("keydown",event=>{const d={ArrowLeft:[-18,0],ArrowRight:[18,0],ArrowUp:[0,-18],ArrowDown:[0,18]}[event.code];if(d){event.preventDefault();shootAim.x=Math.max(0,Math.min(720,shootAim.x+d[0]));shootAim.y=Math.max(0,Math.min(285,shootAim.y+d[1]));drawShooter();}if(event.code==="Space"){event.preventDefault();if(!event.repeat)fireShot();}});
document.addEventListener("visibilitychange",()=>{if(document.hidden)pauseShooter();});
new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)pauseShooter();},{threshold:.05}).observe(shootCanvas);
function selectGame(game){
 for(const [key,panel] of [["xo","xo-panel"],["runner","runner-panel"],["shooter","shooter-panel"]]){document.getElementById(panel).hidden=key==="xo"?false:game!==key;document.getElementById("choose-"+key).setAttribute("aria-pressed",String(game===key));}
 if(game!=="runner")pauseRunner();else {drawRunner();window.showRunnerGuide?.();}if(game!=="shooter")pauseShooter();else drawShooter();
}
for(const game of ["xo","runner","shooter"])document.getElementById("choose-"+game).addEventListener("click",()=>selectGame(game));
document.addEventListener("portfolio-language-change",()=>{renderXo();runnerLabels();drawRunner();});
themeChoices.forEach(button=>button.addEventListener("click",()=>{refreshGamePalette();drawRunner();drawShooter();}));
renderXo();runnerLabels();drawRunner();shootLabels();drawShooter();selectGame("xo");


function gameResetLabels(){
 const ta=document.documentElement.lang==="ta";
 document.getElementById("games-reset").textContent=ta?"விளையாட்டுகளை மீட்டமை ↻":"Reset games ↻";
 document.getElementById("games-reset-note").textContent=ta?"இந்தச் சாதனத்தில் சேமித்த புள்ளிகள், சாதனைகள் மற்றும் பெயரை அழிக்கும்.":"Clears saved scores, best runs and your name on this device.";
 document.getElementById("games-reset-status").textContent="";
}
function resetGames(){
 
 clearTimeout(xoTimer);cancelAnimationFrame(runnerFrame);cancelAnimationFrame(shootFrame);
 cancelNavigationScroll();
 for(const key of ["portfolio-xo-score","portfolio-xo-name","portfolio-runner-best","portfolio-shooter-best","portfolio-oma-best"]){try{localStorage.removeItem(key);sessionStorage.removeItem(key)}catch{}}
 xoBoard=Array(9).fill("");xoThinking=false;xoOutcome=null;xoPlayer="";xoScores={me:0,you:0};document.getElementById("xo-player-name").value="";
 runnerState="ready";runnerBest=0;runnerY=0;runnerVelocity=0;runnerDistance=0;runnerObstacles=[];runnerDucking=false;runnerDuckUntil=0;runnerSpawn=1.2;runnerLast=0;runnerFrame=0;
 shootSequence=0;shootState="ready";shootScore=0;shootBest=0;shootMisses=0;shootTargets=[];shootSpawn=0;shootLast=0;shootFrame=0;shootAim={x:360,y:150};shootFlash=0;
 renderXo();runnerLabels();drawRunner();shootLabels();drawShooter();
 document.getElementById("games-reset-status").textContent=document.documentElement.lang==="ta"?"விளையாட்டுத் தரவு அழிக்கப்பட்டது. புதிதாகத் தொடங்கலாம் ✓":"Game data cleared. Fresh start ✓";
}
 document.getElementById("games-reset").addEventListener("click",resetGames);
 document.addEventListener("portfolio-language-change",gameResetLabels);
 gameResetLabels();


function nudgeRadar(dx,dy){shootAim.x=Math.max(0,Math.min(720,shootAim.x+dx));shootAim.y=Math.max(0,Math.min(285,shootAim.y+dy));drawShooter();}



/* Compact desktop arcade launcher; preserve the mobile game layout. */
const xoPanel=document.getElementById("xo-panel");
const xoMobileHome=document.createElement("div");
xoMobileHome.className="xo-mobile-home";
document.querySelector(".main-content").append(xoMobileHome);
const xoDock=document.createElement("div");xoDock.className="xo-dock";
xoMobileHome.append(xoDock);xoDock.append(xoPanel);
const xoExpand=document.createElement("button");
xoExpand.type="button";xoExpand.className="xo-expand";xoExpand.textContent="⤢";xoExpand.setAttribute("aria-label","Expand XO game");
xoPanel.querySelector(".xo-game-top").append(xoExpand);
const xoReset=document.createElement("button");xoReset.type="button";xoReset.className="xo-restart";xoReset.textContent="Reset scores ↻";xoReset.addEventListener("click",resetGames);xoPanel.querySelector(".xo-game-bottom").append(xoReset);
const gameLauncher=document.createElement("div");
gameLauncher.className="desktop-game-launcher glass-layer";
const gameInvite=document.createElement("p");gameInvite.className="desktop-game-invite";gameInvite.textContent="Fancy a game?";gameLauncher.append(gameInvite);
gameLauncher.setAttribute("role","group");gameLauncher.setAttribute("aria-label","Play a game");
const gameIcons={
 xo:'<path d="M5 5l6 6m0-6l-6 6M5 17l6 6m0-6l-6 6"/><circle cx="21" cy="8" r="4"/><circle cx="21" cy="20" r="4"/>',
 runner:'<path d="M4 16h24v7H4zM9 12h13v4M17 5v7M12 5h10M4 28h24"/><circle cx="9" cy="24" r="3"/><circle cx="23" cy="24" r="3"/>',
 shooter:'<circle cx="16" cy="16" r="12"/><circle cx="16" cy="16" r="6"/><path d="M16 16l9-9M16 2v4M2 16h4M16 26v4M26 16h4"/>'
};
const gameDialog=document.createElement("dialog");gameDialog.className="desktop-game-dialog";
gameDialog.innerHTML='<div class="desktop-game-header"><strong></strong><button type="button" aria-label="Close game">×</button></div><div class="desktop-game-slot"></div>';
document.body.append(gameDialog);
let dockedGame=null,gameMarker=null,gameOpener=null,gameReturnY=0,gameWasHidden=false,gameOldOverflow="";
function openDockedGame(game,opener){
 if(gameDialog.open)return;
 pauseRunner();pauseShooter();cancelNavigationScroll();
 const panel=document.getElementById(game+"-panel");
 gameReturnY=window.scrollY;gameOldOverflow=document.body.style.overflow;document.body.style.overflow="hidden";gameOpener=opener;gameWasHidden=panel.hidden;dockedGame=panel;
 gameMarker=document.createComment("game home");panel.before(gameMarker);panel.hidden=false;
 gameDialog.querySelector(".desktop-game-slot").append(panel);
 gameDialog.querySelector("strong").textContent={xo:"Beat me at XO",runner:"Rover Run",shooter:"Radar Defence"}[game];
 gameDialog.classList.toggle("is-xo",game==="xo");gameDialog.setAttribute("aria-label",gameDialog.querySelector("strong").textContent);
 gameDialog.showModal();
 if(game==="runner"){drawRunner();window.showRunnerGuide?.();}
 if(game==="shooter")drawShooter();
}
gameDialog.querySelector("button").addEventListener("click",()=>gameDialog.close());
gameDialog.addEventListener("close",()=>{
 pauseRunner();pauseShooter();cancelNavigationScroll();
 if(dockedGame){gameMarker.replaceWith(dockedGame);dockedGame.hidden=gameWasHidden;}
 dockedGame=null;gameMarker=null;
 document.body.style.overflow=gameOldOverflow;
 window.scrollTo({top:gameReturnY,behavior:"instant"});
 gameOpener?.focus({preventScroll:true});
});
gameDialog.addEventListener("click",event=>{if(event.target===gameDialog){const r=gameDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)gameDialog.close();}});
for(const [game,label] of [["xo","XO"],["runner","Rover"],["shooter","Radar"]]){
 const button=document.createElement("button");button.type="button";button.setAttribute("aria-label","Play "+label);button.setAttribute("aria-haspopup","dialog");
 button.innerHTML='<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+gameIcons[game]+'</svg><span>'+label+'</span>';
 button.addEventListener("click",()=>openDockedGame(game,button));gameLauncher.append(button);
}
document.body.append(gameLauncher);
gameLauncher.id="break-game-picker";gameLauncher.hidden=true;
const breakButton=document.createElement("button");breakButton.type="button";breakButton.className="break-game-button";breakButton.textContent="Take a break 🎮";breakButton.setAttribute("aria-controls","break-game-picker");breakButton.setAttribute("aria-expanded","false");document.body.append(breakButton);
function closeBreakPicker(){gameLauncher.hidden=true;breakButton.setAttribute("aria-expanded","false");}
breakButton.addEventListener("click",()=>{gameLauncher.hidden=!gameLauncher.hidden;breakButton.setAttribute("aria-expanded",String(!gameLauncher.hidden));});
gameLauncher.addEventListener("click",event=>{if(event.target.closest("button"))closeBreakPicker();});
document.addEventListener("click",event=>{if(!gameLauncher.contains(event.target)&&!breakButton.contains(event.target))closeBreakPicker();});
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&!gameLauncher.hidden){closeBreakPicker();breakButton.focus({preventScroll:true});}});
const labLink=document.createElement("a");labLink.className="project-lab-link glass-layer";labLink.href="projects.html";
labLink.innerHTML='<span class="lab-link-icon" aria-hidden="true">↗</span><strong>See how I built it</strong><span>Visual walkthroughs, interactive demos & the thinking behind the projects.</span><b>Explore the project lab →</b>';
sidebar.append(labLink);
xoExpand.addEventListener("click",()=>openDockedGame("xo",xoExpand));
function placeDesktopGames(){
 const desktop=matchMedia("(min-width:993px)").matches;
 if(gameDialog.open)gameDialog.close();
 breakButton.hidden=!desktop;
 closeBreakPicker();
 xoMobileHome.hidden=desktop;
 document.querySelector('article[data-page="play"]').classList.toggle("desktop-games-docked",desktop);
}
window.addEventListener("resize",()=>{const desktop=matchMedia("(min-width:993px)").matches;if(desktop!==!breakButton.hidden)placeDesktopGames();});
document.getElementById("choose-xo").hidden=true;
placeDesktopGames();
