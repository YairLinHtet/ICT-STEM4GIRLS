document.addEventListener("DOMContentLoaded", () => {
  initHeader();
});

//Components add function for header and footer as function for both
function initHeader() {
  loadComponent("components/header.html", "header", navbarLink);
}

function loadComponent(filePath, selector, callback) {
  const targetElement = document.querySelector(selector);

  if (!targetElement) {
    console.warn("Warning: <${selector}> not found!");
    return;
  }

  fetch(filePath)
    .then((response) => {
      // file not found or network error
      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} - file not found`,
        );
      }
      return response.text();
    })
    .then((htmlContent) => {
      // add target tag
      targetElement.innerHTML = htmlContent;
      if (callback) callback(targetElement);
    })
    .catch((error) => {
      // error in console
      console.error(`${filePath} error loading :`, error);
    });
}

// Navbar function

function navbarLink(headerElement) {
  //get id of html
  const navbar = headerElement.querySelector("#navbar");
  const openBtn = headerElement.querySelector("#open-navbar-btn");
  const closeBtn = headerElement.querySelector("#close-navbar-btn");

  //Error btn
  if (!navbar || !openBtn || !closeBtn) return;

  openBtn.addEventListener("click", (event) => {
    openNavbar();
    event.stopPropagation();
  });

  closeBtn.addEventListener("click", () => {
    closeNavbar();
  });

  window.addEventListener("click", (event) => {
    if (navbar.classList.contains("show") && !navbar.contains(event.target)) {
      closeNavbar();
    }
  });

  function openNavbar() {
    navbar.classList.add("show");
    openBtn.setAttribute("aria-expanded", "true");
  }

  function closeNavbar() {
    navbar.classList.remove("show");
    openBtn.setAttribute("aria-expanded", "false");
  }
}
