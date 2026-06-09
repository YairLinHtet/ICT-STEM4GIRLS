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

/**
 * Daily Limits Check Function
 * @param {string} flagKey - LocalStorage တွင် သိမ်းမည့် Key နာမည်
 * @param {string} containerSelector - Error ပြသမည့် နေရာ၏ CSS Selector
 * @param {string} errorMessage - ပြသရမည့် စာသား
 * @param {boolean} testMode - true ဆိုပါက အကန့်အသတ်မရှိ စမ်းသပ်ခွင့်ပေးမည်
 */
function checkSharedDailyLimit(
  flagKey,
  containerSelector,
  errorMessage,
  testMode = false,
) {
  if (testMode) return true;

  const today = new Date().toDateString();
  let savedDate = localStorage.getItem("stem_app_date");
  let isDone = localStorage.getItem(flagKey) === "true";

  if (savedDate !== today) {
    localStorage.setItem("stem_app_date", today);
    localStorage.setItem(flagKey, "false");
    isDone = false;
  }

  if (isDone) {
    showSharedSystemError(containerSelector, errorMessage);
    return false;
  }
  return true;
}

/**
 * Error Function
 * @param {string} containerSelector - Error Card ထည့်သွင်းမည့် နေရာ
 * @param {string} message - ပြသမည့် စာသား
 */
function showSharedSystemError(containerSelector, message) {
  const resultSection = document.querySelector(containerSelector);
  if (!resultSection) return;

  resultSection.innerHTML = `
    <div class="error-card" style="padding: 20px; background-color: #ffebee; border: 1px solid #ffcdd2; border-radius: 8px; color: #c62828; font-family: sans-serif; margin-top: 15px;">
      <h3 style="margin-top: 0;">⚠️ စနစ်အတွင်း အချက်ပြမှု</h3>
      <p>${message}</p>
    </div>
  `;
  resultSection.scrollIntoView({ behavior: "smooth" });
}
