const mobileHeader = document.querySelector(".mobile-header-aside");
const closeButton = mobileHeader.querySelector(".js-close-header-aside-button");
const overlay = document.querySelector(".js-header-mobile-overlay");
const openButton = document.querySelector(".js-open-mobile-menu");

const closeMobileHeader = () => {
    mobileHeader.classList.remove("open");
}

const openMobileHeader = () => {
    mobileHeader.classList.add("open");
}

openButton.addEventListener("click", () => {
    openMobileHeader();
})

closeButton.addEventListener("click", () => {
    closeMobileHeader();
});

overlay.addEventListener("click", () => {
    closeMobileHeader();
});

const openMenuButtons = document.querySelectorAll(".js-open-menu");
openMenuButtons.forEach(button => {
    const menuElement = button.nextElementSibling
    button.addEventListener("click", () => {
        menuElement.classList.toggle("open");
    })
})
