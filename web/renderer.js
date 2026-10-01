const tabsEl = document.getElementById("tabs");
const addressBar = document.getElementById("address");

const backButton = document.getElementById("back");
const forwardButton = document.getElementById("forward");
const reloadButton = document.getElementById("reload");
const newTabButton = document.getElementById("newTab");
const homeButton = document.getElementById("home");

const tabsButton = document.getElementById("tabsBtn");
const accentButton = document.getElementById("accentBtn");
const settingsButton = document.getElementById("settingsBtn");


/* =========================================
   TABS
   ========================================= */

function renderTabs(tabs) {
    tabsEl.innerHTML = "";

    for (const tab of tabs) {
        const element = document.createElement("div");

        element.className =
            "tab" + (tab.active ? " active" : "");

        element.dataset.id = tab.id;

        const dot = document.createElement("span");
        dot.className = "dot";

        const title = document.createElement("span");
        title.className = "tab-title";
        title.textContent = tab.title || "New Tab";

        const close = document.createElement("button");
        close.className = "tab-close";
        close.type = "button";
        close.textContent = "×";
        close.title = "Close tab";

        close.addEventListener("click", (event) => {
            event.stopPropagation();
            window.novaGX.closeTab(tab.id);
        });

        element.appendChild(dot);
        element.appendChild(title);
        element.appendChild(close);

        element.addEventListener("click", () => {
            window.novaGX.activateTab(tab.id);
        });

        tabsEl.appendChild(element);
    }
}


function getActiveTabId() {
    const active = document.querySelector(".tab.active");

    if (!active) {
        return null;
    }

    return Number(active.dataset.id);
}


function updateTab(tab) {
    if (tab.id === getActiveTabId()) {
        addressBar.value = tab.url || "";

        backButton.disabled = !tab.canGoBack;
        forwardButton.disabled = !tab.canGoForward;
    }

    const element = document.querySelector(
        `.tab[data-id="${tab.id}"]`
    );

    if (!element) {
        return;
    }

    const title = element.querySelector(".tab-title");

    if (title) {
        title.textContent = tab.title || "New Tab";
    }
}


/* =========================================
   ELECTRON EVENTS
   ========================================= */

window.novaGX.onTabsUpdated((tabs) => {
    renderTabs(tabs);
});


window.novaGX.onTabUpdated((tab) => {
    updateTab(tab);
});


window.novaGX.onLoading((loading) => {
    reloadButton.textContent = loading ? "×" : "↻";
});


window.novaGX.onFocusAddressBar(() => {
    addressBar.focus();
    addressBar.select();
});


/* =========================================
   TOP NAVIGATION
   ========================================= */

newTabButton.addEventListener("click", () => {
    window.novaGX.newTab();
});


backButton.addEventListener("click", () => {
    window.novaGX.back();
});


forwardButton.addEventListener("click", () => {
    window.novaGX.forward();
});


reloadButton.addEventListener("click", () => {
    window.novaGX.reload();
});


homeButton.addEventListener("click", () => {
    window.novaGX.home();
});


/* =========================================
   ADDRESS BAR
   ========================================= */

addressBar.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();

        window.novaGX.navigate(
            addressBar.value
        );
    }
});


/* =========================================
   SIDEBAR HOME
   ========================================= */

const sidebarHome = document.querySelector(
    ".rail-btn.active"
);

if (sidebarHome) {
    sidebarHome.addEventListener("click", (event) => {
        event.preventDefault();

        window.novaGX.home();
    });
}


/* =========================================
   SIDEBAR TABS
   ========================================= */

if (tabsButton) {
    tabsButton.addEventListener("click", (event) => {
        event.preventDefault();

        window.novaGX.newTab();
    });
}


/* =========================================
   SIDEBAR ACCENT
   ========================================= */

if (accentButton) {
    accentButton.addEventListener("click", (event) => {
        event.preventDefault();

        document.body.classList.toggle("cyan");
    });
}


/* =========================================
   SIDEBAR CREDITS
   ========================================= */

if (settingsButton) {
    settingsButton.addEventListener("click", (event) => {
        event.preventDefault();

        window.novaGX.openCredits();
    });
}


/* =========================================
   KEYBOARD SHORTCUTS
   ========================================= */

window.addEventListener("keydown", (event) => {

    if (
        event.ctrlKey &&
        event.key.toLowerCase() === "l"
    ) {
        event.preventDefault();

        addressBar.focus();
        addressBar.select();

        return;
    }


    if (
        event.ctrlKey &&
        event.key.toLowerCase() === "t"
    ) {
        event.preventDefault();

        window.novaGX.newTab();

        return;
    }


    if (
        event.ctrlKey &&
        event.key.toLowerCase() === "w"
    ) {
        event.preventDefault();

        const id = getActiveTabId();

        if (id !== null) {
            window.novaGX.closeTab(id);
        }

        return;
    }


    if (
        event.ctrlKey &&
        event.key.toLowerCase() === "r"
    ) {
        event.preventDefault();

        window.novaGX.reload();

        return;
    }


    if (
        event.altKey &&
        event.key === "ArrowLeft"
    ) {
        event.preventDefault();

        window.novaGX.back();

        return;
    }


    if (
        event.altKey &&
        event.key === "ArrowRight"
    ) {
        event.preventDefault();

        window.novaGX.forward();
    }
});