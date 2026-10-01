const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("novaGX", {

    /* =========================================
       TABS
       ========================================= */

    newTab: () => {
        ipcRenderer.send("new-tab");
    },

    closeTab: (id) => {
        ipcRenderer.send("close-tab", id);
    },

    activateTab: (id) => {
        ipcRenderer.send("activate-tab", id);
    },


    /* =========================================
       NAVIGATION
       ========================================= */

    navigate: (url) => {
        ipcRenderer.send("navigate", url);
    },

    back: () => {
        ipcRenderer.send("back");
    },

    forward: () => {
        ipcRenderer.send("forward");
    },

    reload: () => {
        ipcRenderer.send("reload");
    },

    home: () => {
        ipcRenderer.send("home");
    },


    /* =========================================
       CREDITS
       ========================================= */

    openCredits: () => {
        ipcRenderer.send("open-credits");
    },

    returnToBrowser: () => {
        ipcRenderer.send("return-to-browser");
    },


    /* =========================================
       ADDRESS BAR
       ========================================= */

    focusAddressBar: () => {
        ipcRenderer.send("focus-address-bar");
    },


    /* =========================================
       EVENTS
       ========================================= */

    onTabsUpdated: (callback) => {
        ipcRenderer.on(
            "tabs-updated",
            (_, tabs) => callback(tabs)
        );
    },

    onTabUpdated: (callback) => {
        ipcRenderer.on(
            "tab-updated",
            (_, tab) => callback(tab)
        );
    },

    onLoading: (callback) => {
        ipcRenderer.on(
            "browser-loading",
            (_, state) => callback(state)
        );
    },

    onFocusAddressBar: (callback) => {
        ipcRenderer.on(
            "focus-address-bar",
            callback
        );
    }
});