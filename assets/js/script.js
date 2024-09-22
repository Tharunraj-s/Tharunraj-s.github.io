'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });



// projects variables
const projectsItem = document.querySelectorAll("[data-projects-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const projectsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}

// add click event to all modal items
for (let i = 0; i < projectsItem.length; i++) {

  projectsItem[i].addEventListener("click", function () {

    modalImg.src = this.querySelector("[data-projects-avatar]").src;
    modalImg.alt = this.querySelector("[data-projects-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-projects-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-projects-text]").innerHTML;

    projectsModalFunc();

  });

}

// add click event to modal close button
modalCloseBtn.addEventListener("click", projectsModalFunc);
overlay.addEventListener("click", projectsModalFunc);



// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);

  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;

  });

}



// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });
}



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }

  });
}
window.addEventListener("load", function() {
  const form = document.getElementById('my-form');
  form.addEventListener("submit", function(e) {
    e.preventDefault();

    // Create a blurred overlay for the background
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black
    overlay.style.backdropFilter = 'blur(8px)'; // Blur the background
    overlay.style.zIndex = '1000'; // Ensure it's on top
    document.body.appendChild(overlay);

    // Create the loading message
    const loadingMessage = document.createElement('div');
    loadingMessage.innerText = 'Sending...';
    loadingMessage.style.position = 'fixed';
    loadingMessage.style.top = '50%';
    loadingMessage.style.left = '50%';
    loadingMessage.style.transform = 'translate(-50%, -50%)'; // Center the text
    loadingMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // Semi-transparent black background for the text
    loadingMessage.style.color = 'gold'; // Gold text
    loadingMessage.style.fontSize = '24px'; // Font size for readability
    loadingMessage.style.padding = '20px';
    loadingMessage.style.borderRadius = '10px';
    loadingMessage.style.textAlign = 'center';
    loadingMessage.style.zIndex = '1001'; // Ensure it's above the overlay
    document.body.appendChild(loadingMessage);

    const data = new FormData(form);
    const action = e.target.action;

    fetch(action, {
      method: 'POST',
      body: data,
    })
    .then(() => {
      // Remove loading message and overlay
      document.body.removeChild(loadingMessage);
      document.body.removeChild(overlay);

      // Show success message
      const successMessage = document.createElement('div');
      successMessage.innerText = 'Message sent!';
      successMessage.style.position = 'fixed';
      successMessage.style.top = '50%';
      successMessage.style.left = '50%';
      successMessage.style.transform = 'translate(-50%, -50%)';
      successMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      successMessage.style.color = 'gold';
      successMessage.style.fontSize = '24px';
      successMessage.style.padding = '20px';
      successMessage.style.borderRadius = '10px';
      successMessage.style.textAlign = 'center';
      successMessage.style.zIndex = '1001';
      document.body.appendChild(successMessage);

      // Hide success message after 2 seconds
      setTimeout(() => {
        document.body.removeChild(successMessage);
        location.reload(); // Redirect to home page
      }, 2000);
    })
    .catch((error) => {
      // Handle error
      document.body.removeChild(loadingMessage);
      document.body.removeChild(overlay);
      alert("Error: " + error.message); // You can also use a custom error message
    });
  });
});
