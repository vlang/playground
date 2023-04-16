const searchWindow = document.querySelector(".search-window");
const searchWindowOverlay = document.querySelector(".js-search-overlay");
const searchButtons = document.querySelectorAll(".js-search-button");
const searchInput = document.querySelector(".js-search-input");
const searchResults = document.querySelector(".search-results");
const searchResultCaptionElement = searchResults.querySelector(".caption");
const searchResultsList = document.querySelector(".search-results-list");
const searchCloseButton = document.querySelector(".js-close-search-button");
const searchClearButton = document.querySelector(".js-clear-input-button");
const searchPlaceRadioBoxes = document.querySelectorAll(".search-place-item input");

const localSearchCache = {};

const pageIcon = `<svg width="20" height="20" viewBox="0 0 20 20"><path d="M17 6v12c0 .52-.2 1-1 1H4c-.7 0-1-.33-1-1V2c0-.55.42-1 1-1h8l5 5zM14 8h-3.13c-.51 0-.87-.34-.87-.87V4" stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linejoin="round"></path></svg>`
const textIcon = `<svg width="20" height="20" viewBox="0 0 20 20"><path d="M17 5H3h14zm0 5H3h14zm0 5H3h14z" stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linejoin="round"></path></svg>`
const subHeaderIcon = `<svg width="20" height="20" viewBox="0 0 20 20"><path d="M13 13h4-4V8H7v5h6v4-4H7V8H3h4V3v5h6V3v5h4-4v5zm-6 0v4-4H3h4z" stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
const moduleIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.34925 4.24146C1.35394 3.69253 1.80026 3.25 2.34921 3.25H7.34174C7.60696 3.25 7.86131 3.35536 8.04885 3.54289L9.78967 5.28371C9.9772 5.47125 10.2316 5.57661 10.4968 5.57661H16.8767C17.429 5.57661 17.8767 6.02432 17.8767 6.57661V15.8606C17.8767 16.4129 17.429 16.8606 16.8767 16.8606H2.25003C1.69441 16.8606 1.24532 16.4077 1.25007 15.8521L1.34925 4.24146Z" stroke="white" stroke-width="1"/></svg>`

const resetSearch = () => {
    searchInput.value = "";
    searchResults.classList.add("with-caption");
    searchResultsList.innerHTML = "";
    searchResultCaptionElement.textContent = "Type something to search";
    searchClearButton.classList.remove("show");
    searchInput.focus();
}

const closeSearchWindow = () => {
    searchWindow.classList.remove("open");
    resetSearch()
}

const openSearchWindow = () => {
    searchWindow.classList.add("open");
    setTimeout(() => {
        searchInput.focus();
    }, 250)
}

const searchWindowIsOpen = () => {
    return searchWindow.classList.contains("open");
}

const resetPlaceholder = () => {
    searchInput.placeholder = `Search ${getSelectedSearchPlacePresentation()}...`;
}

searchPlaceRadioBoxes.forEach((radioBox) => {
    radioBox.addEventListener("change", () => {
        runSearch();
        searchInput.focus();

        resetPlaceholder();
    });
})

const getSelectedSearchPlace = () => {
    const selectedSearchPlace = document.querySelector(".search-place-item input:checked");
    return selectedSearchPlace.value ?? "All";
}

const getSelectedSearchPlacePresentation = () => {
    const selectedSearchPlace = document.querySelector(".search-place-item input:checked");
    let presentation = "";
    switch (selectedSearchPlace.value) {
        case "all":
            presentation = "everywhere";
            break;
        case "documentation":
            presentation = "in documentation";
            break;
        case "blog":
            presentation = "in blog";
            break;
        case "modules":
            presentation = "in modules";
            break;
        default:
            presentation = "everywhere";
            break;
    }
    return presentation
}

function clearResults() {
    searchResultsList.innerHTML = "";
}

function setResults(place, hits) {
    hits.forEach((result) => {
        if (place === "modules") {
            renderModuleResult(result);
        } else {
            renderResult(result);
        }
    });
}

function renderModuleResult(result) {
    const formatted = result['_formatted']
    const icon = moduleIcon

    const searchResult = document.createElement("li");
    searchResult.classList.add("search-result");
    searchResult.setAttribute("role", "option");
    searchResult.setAttribute("aria-selected", "false");

    const link = document.createElement("a");
    link.classList.add("search-result-content");
    link.setAttribute("href", result.url);
    link.innerHTML = `
                        <div class="content-icon">
                            ${icon}
                        </div>
                        <div class="content-wrapper">
                            <span class="title">${formatted.fqn}</span>
                            <span class="description">${formatted.description}</span>
                        </div>
                    `;
    searchResult.appendChild(link);
    searchResultsList.appendChild(searchResult);
}

function renderResult(result) {
    const formatted = result['_formatted']
    const icon = formatted.title.includes("search-highlight") ? pageIcon : (result.parent !== "" ? subHeaderIcon : textIcon);

    const searchResult = document.createElement("li");
    searchResult.classList.add("search-result");
    searchResult.setAttribute("role", "option");
    searchResult.setAttribute("aria-selected", "false");

    const link = document.createElement("a");
    link.classList.add("search-result-content");
    link.setAttribute("href", result.url.replace(".md", ".html"));
    link.innerHTML = `
                        <div class="content-icon">
                            ${icon}
                        </div>
                        <div class="content-wrapper">
                            <span class="title">${formatted.title}</span>
                            <span class="description">${formatted.body}</span>
                        </div>
                    `;
    searchResult.appendChild(link);
    searchResultsList.appendChild(searchResult);
}

function doSearch(searchQuery) {
    const place = getSelectedSearchPlace();
    const localSearchCacheElement = localSearchCache[searchQuery + place];
    if (localSearchCacheElement && localSearchCacheElement.length > 0) {
        setWithResults();
        clearResults();
        setResults(place, localSearchCacheElement);
        setSearchElementsListeners();
        return
    }

    const searchEndpoint = "https://vosca.dev/search"

    fetch(searchEndpoint + "?" + new URLSearchParams({
        place: place,
        q: searchQuery,
    }))
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            console.log(data);
            console.log(data[0]);
            clearResults();

            let hits = [];
            data.forEach((result) => {
                hits = hits.concat(result.hits);
            })

            if (hits.length > 0) {
                setWithResults();
                setResults(place, hits);
                setSearchElementsListeners();

                localSearchCache[searchQuery + place] = hits;
            } else {
                setNoResults();
            }
        })
        .catch((error) => {
            console.log(error);
            setNoResults();
        });
}

function runSearch() {
    const searchQuery = searchInput.value;

    if (searchQuery === "") {
        resetSearch()
        return
    }

    doSearch(searchQuery);
}

searchInput.addEventListener("input", () => {
    if (searchInput.value.length > 0) {
        searchClearButton.classList.add("show");
    } else {
        searchClearButton.classList.remove("show");
    }

    runSearch();
})

searchClearButton.addEventListener("click", () => {
    resetSearch();
})

searchCloseButton.addEventListener("click", () => {
    closeSearchWindow();
})

searchButtons.forEach((searchButton) => {
    searchButton.addEventListener("click", () => {
        openSearchWindow();
    });
})

searchWindowOverlay.addEventListener("click", () => {
    closeSearchWindow();
});

const selectSearchResultElement = (element, scroll = true) => {
    const searchResultsElements = document.querySelectorAll(".search-result");
    searchResultsElements.forEach((searchResultElement) => {
        searchResultElement.setAttribute("aria-selected", "false");
    });
    element.setAttribute("aria-selected", "true");

    if (scroll) {
        element.scrollIntoView({block: "nearest", inline: "nearest"})
    }
}

const setSearchElementsListeners = () => {
    const searchResultsElements = document.querySelectorAll(".search-result");
    searchResultsElements.forEach((searchResultElement) => {
        // on hover set aria-selected to true and remove from other elements
        searchResultElement.addEventListener("mouseenter", () => {
            selectSearchResultElement(searchResultElement, false);
        })

        // on touch set aria-selected to true and remove from other elements
        searchResultElement.addEventListener("touchstart", () => {
            selectSearchResultElement(searchResultElement, false);
        })
    })
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeSearchWindow();
        return
    }

    if (!searchWindowIsOpen) {
        return;
    }

    const searchResultActiveElement = document.querySelector(".search-result[aria-selected='true']");
    if (searchResultActiveElement) {
        if (event.key === "ArrowUp") {
            const previousElement = searchResultActiveElement.previousElementSibling;
            if (previousElement) {
                selectSearchResultElement(previousElement)
            } else {
                selectSearchResultElement(searchResultsList.lastElementChild)
            }

            event.preventDefault()
        }

        if (event.key === "ArrowDown") {
            const nextElement = searchResultActiveElement.nextElementSibling;
            if (nextElement) {
                selectSearchResultElement(nextElement)
            } else {
                selectSearchResultElement(searchResultsList.firstElementChild)
            }

            event.preventDefault()
        }
    } else {
        if (event.key === "ArrowUp") {
            selectSearchResultElement(searchResultsList.lastElementChild)
            event.preventDefault()
        }

        if (event.key === "ArrowDown") {
            selectSearchResultElement(searchResultsList.firstElementChild)
            event.preventDefault()
        }
    }

    if (event.key === "Enter" && searchResultActiveElement) {
        searchResultActiveElement.querySelector("a").click();
    }

    const value = searchInput.value;
    if (value === "") {
        setEmptySearch();
    }
})

const setEmptySearch = () => {
    searchResults.classList.add("with-caption");
    searchResultCaptionElement.textContent = "Type something to search";
}

const removeEmptySearch = () => {
    searchResults.classList.remove("with-caption");
}

const setNoResults = () => {
    let inputValue = searchInput.value;
    if (inputValue === "") {
        setEmptySearch();
        return
    }

    searchResults.classList.add("with-caption");
    searchResultCaptionElement.textContent = `No results for "${inputValue}"`;
}

const setWithResults = () => {
    searchResults.classList.remove("with-caption");
}

document.addEventListener("keydown", (event) => {
    if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        openSearchWindow();
    }
})

document.addEventListener("DOMContentLoaded", () => {
    const ctrlKey = document.querySelector(".ctrl-key");
    const platform = navigator.platform.toLowerCase();
    if (platform.includes("mac") || platform.includes("ios")) {
        ctrlKey.textContent = "⌘";
    }
});

(function () {
    const place = searchInput.getAttribute("data-place");
    if (place) {
        const radioBox = document.querySelector(`.search-place-item input[value="${place}"]`);
        radioBox.checked = true;

        resetPlaceholder();
    }
})()
