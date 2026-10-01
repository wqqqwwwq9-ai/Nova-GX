const {
    app,
    BrowserWindow,
    BrowserView,
    ipcMain,
    session
} = require("electron");

const path = require("path");

let mainWindow = null;

const tabs = new Map();

let activeTabId = null;
let nextTabId = 1;

let showingCredits = false;

const HOME_URL = "https://www.google.com";


/* =========================================
   WINDOW
   ========================================= */

function createWindow() {

    mainWindow = new BrowserWindow({
        width: 1440,
        height: 900,

        minWidth: 1000,
        minHeight: 650,

        backgroundColor: "#090b10",

        webPreferences: {
            preload: path.join(
                __dirname,
                "web",
                "preload.js"
            ),

            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile(
        path.join(
            __dirname,
            "web",
            "index.html"
        )
    );

    mainWindow.on(
        "resize",
        updateBrowserBounds
    );
}


/* =========================================
   CREATE TAB
   ========================================= */

function createTab(url = HOME_URL) {

    const id = nextTabId++;

    const view = new BrowserView({
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            partition: "persist:novagx"
        }
    });

    tabs.set(id, {
        id,
        view,
        url,
        title: "New Tab"
    });


    view.webContents.loadURL(url);


    /* =====================================
       NAVIGATION
       ===================================== */

    view.webContents.on(
        "did-navigate",
        (_, newUrl) => {

            const tab = tabs.get(id);

            if (!tab) {
                return;
            }

            tab.url = newUrl;

            if (id === activeTabId) {
                sendTabUpdate(id);
            }
        }
    );


    view.webContents.on(
        "did-navigate-in-page",
        (_, newUrl) => {

            const tab = tabs.get(id);

            if (!tab) {
                return;
            }

            tab.url = newUrl;

            if (id === activeTabId) {
                sendTabUpdate(id);
            }
        }
    );


    /* =====================================
       TITLE
       ===================================== */

    view.webContents.on(
        "page-title-updated",
        (_, title) => {

            const tab = tabs.get(id);

            if (!tab) {
                return;
            }

            tab.title = title;

            if (id === activeTabId) {
                sendTabUpdate(id);
            }
        }
    );


    /* =====================================
       LOADING
       ===================================== */

    view.webContents.on(
        "did-start-loading",
        () => {

            if (
                id === activeTabId &&
                mainWindow &&
                !showingCredits
            ) {

                mainWindow.webContents.send(
                    "browser-loading",
                    true
                );
            }
        }
    );


    view.webContents.on(
        "did-stop-loading",
        () => {

            if (
                id === activeTabId &&
                mainWindow &&
                !showingCredits
            ) {

                mainWindow.webContents.send(
                    "browser-loading",
                    false
                );

                sendTabUpdate(id);
            }
        }
    );


    /* =====================================
       POPUPS / NEW WINDOWS
       ===================================== */

    view.webContents.setWindowOpenHandler(
        ({ url }) => {

            const newId = createTab(url);

            activateTab(newId);

            return {
                action: "deny"
            };
        }
    );


    return id;
}


/* =========================================
   ACTIVATE TAB
   ========================================= */

function activateTab(id) {

    const tab = tabs.get(id);

    if (!tab || !mainWindow) {
        return;
    }


    /* Remove currently visible BrowserView */

    if (activeTabId !== null) {

        const previous =
            tabs.get(activeTabId);

        if (previous) {

            try {
                mainWindow.removeBrowserView(
                    previous.view
                );
            } catch (error) {
                // Already removed
            }
        }
    }


    activeTabId = id;


    /*
     * Do NOT attach the BrowserView while
     * Credits is being displayed.
     */

    if (!showingCredits) {

        mainWindow.addBrowserView(
            tab.view
        );

        updateBrowserBounds();
    }


    sendTabUpdate(id);
    sendTabs();
}


/* =========================================
   CLOSE TAB
   ========================================= */

function closeTab(id) {

    const tab = tabs.get(id);

    if (!tab) {
        return;
    }

    const wasActive =
        activeTabId === id;


    if (wasActive && mainWindow) {

        try {

            mainWindow.removeBrowserView(
                tab.view
            );

        } catch (error) {
            // Already removed
        }
    }


    if (
        !tab.view.webContents.isDestroyed()
    ) {

        tab.view.webContents.destroy();
    }


    tabs.delete(id);


    /* No tabs left */

    if (tabs.size === 0) {

        const newId = createTab();

        activeTabId = null;

        activateTab(newId);

        return;
    }


    /* Closed active tab */

    if (wasActive) {

        const remaining =
            [...tabs.keys()];

        activateTab(
            remaining[
                remaining.length - 1
            ]
        );

    } else {

        sendTabs();
    }
}


/* =========================================
   BROWSER VIEW SIZE
   ========================================= */

function updateBrowserBounds() {

    if (
        !mainWindow ||
        activeTabId === null ||
        showingCredits
    ) {
        return;
    }


    const tab =
        tabs.get(activeTabId);

    if (!tab) {
        return;
    }


    const bounds =
        mainWindow.getContentBounds();


    tab.view.setBounds({

        x: 60,

        y: 110,

        width: Math.max(
            100,
            bounds.width - 60
        ),

        height: Math.max(
            100,
            bounds.height - 110
        )
    });
}


/* =========================================
   SEND TABS
   ========================================= */

function sendTabs() {

    if (!mainWindow) {
        return;
    }


    const data =
        [...tabs.values()].map(tab => ({

            id: tab.id,

            title:
                tab.title ||
                "New Tab",

            url:
                tab.url ||
                HOME_URL,

            active:
                tab.id === activeTabId
        }));


    mainWindow.webContents.send(
        "tabs-updated",
        data
    );
}


/* =========================================
   SEND TAB UPDATE
   ========================================= */

function sendTabUpdate(id) {

    const tab = tabs.get(id);

    if (!tab || !mainWindow) {
        return;
    }


    const history =
        tab.view.webContents.navigationHistory;


    mainWindow.webContents.send(
        "tab-updated",
        {

            id,

            title:
                tab.title ||
                "New Tab",

            url:
                tab.url ||
                HOME_URL,

            canGoBack:
                history.canGoBack(),

            canGoForward:
                history.canGoForward()
        }
    );
}


/* =========================================
   NAVIGATE
   ========================================= */

function navigate(input) {

    if (activeTabId === null) {
        return;
    }


    const tab =
        tabs.get(activeTabId);

    if (!tab) {
        return;
    }


    let url =
        String(input || "").trim();


    if (!url) {
        return;
    }


    if (
        !url.startsWith("http://") &&
        !url.startsWith("https://") &&
        !url.startsWith("file://")
    ) {

        if (
            url.includes(".") &&
            !url.includes(" ")
        ) {

            url =
                "https://" + url;

        } else {

            url =
                "https://www.google.com/search?q=" +
                encodeURIComponent(url);
        }
    }


    tab.url = url;

    tab.view.webContents.loadURL(url);
}


/* =========================================
   OPEN CREDITS
   ========================================= */

ipcMain.on(
    "open-credits",
    () => {

        if (!mainWindow) {
            return;
        }


        if (showingCredits) {
            return;
        }


        showingCredits = true;


        /*
         * Remove BrowserView so it cannot cover
         * the Credits page.
         */

        if (activeTabId !== null) {

            const tab =
                tabs.get(activeTabId);

            if (tab) {

                try {

                    mainWindow.removeBrowserView(
                        tab.view
                    );

                } catch (error) {
                    // Already removed
                }
            }
        }


        /*
         * Load Credits into the main window.
         */

        mainWindow.loadFile(
            path.join(
                __dirname,
                "web",
                "credits.html"
            )
        );
    }
);


/* =========================================
   RETURN TO BROWSER
   ========================================= */

ipcMain.on(
    "return-to-browser",
    () => {

        if (!mainWindow) {
            return;
        }


        if (!showingCredits) {
            return;
        }


        /*
         * Tell the app we are leaving Credits.
         */

        showingCredits = false;


        /*
         * Wait for index.html to finish loading.
         */

        mainWindow.webContents.once(
            "did-finish-load",
            () => {

                if (
                    !mainWindow ||
                    activeTabId === null
                ) {
                    return;
                }


                const tab =
                    tabs.get(activeTabId);

                if (!tab) {
                    return;
                }


                /*
                 * Put the existing browser tab
                 * back on top.
                 */

                mainWindow.addBrowserView(
                    tab.view
                );


                updateBrowserBounds();


                /*
                 * Restore the tab information.
                 */

                sendTabs();

                sendTabUpdate(
                    activeTabId
                );
            }
        );


        /*
         * Load the Nova GX browser interface.
         */

        mainWindow.loadFile(
            path.join(
                __dirname,
                "web",
                "index.html"
            )
        );
    }
);


/* =========================================
   TAB CONTROLS
   ========================================= */

ipcMain.on(
    "create-tab",
    (_, url) => {

        const id =
            createTab(
                url || HOME_URL
            );

        activateTab(id);
    }
);


ipcMain.on(
    "new-tab",
    (_, url) => {

        const id =
            createTab(
                url || HOME_URL
            );

        activateTab(id);
    }
);


ipcMain.on(
    "close-tab",
    (_, id) => {

        closeTab(
            Number(id)
        );
    }
);


ipcMain.on(
    "activate-tab",
    (_, id) => {

        activateTab(
            Number(id)
        );
    }
);


/* =========================================
   NAVIGATION CONTROLS
   ========================================= */

ipcMain.on(
    "navigate",
    (_, input) => {

        navigate(input);
    }
);


ipcMain.on(
    "back",
    () => {

        const tab =
            tabs.get(activeTabId);

        if (
            tab &&
            tab.view.webContents.navigationHistory.canGoBack()
        ) {

            tab.view.webContents.navigationHistory.goBack();
        }
    }
);


ipcMain.on(
    "forward",
    () => {

        const tab =
            tabs.get(activeTabId);

        if (
            tab &&
            tab.view.webContents.navigationHistory.canGoForward()
        ) {

            tab.view.webContents.navigationHistory.goForward();
        }
    }
);


ipcMain.on(
    "reload",
    () => {

        const tab =
            tabs.get(activeTabId);

        if (tab) {
            tab.view.webContents.reload();
        }
    }
);


/* =========================================
   HOME
   ========================================= */

ipcMain.on(
    "home",
    () => {

        navigate(HOME_URL);
    }
);


/* =========================================
   ADDRESS BAR
   ========================================= */

ipcMain.on(
    "focus-address-bar",
    () => {

        if (mainWindow) {

            mainWindow.webContents.send(
                "focus-address-bar"
            );
        }
    }
);


/* =========================================
   APP STARTUP
   ========================================= */

app.whenReady().then(() => {

    session.defaultSession.setPermissionRequestHandler(
        (_, permission, callback) => {

            const allowed = [
                "fullscreen",
                "clipboard-read",
                "clipboard-sanitized-write"
            ];

            callback(
                allowed.includes(permission)
            );
        }
    );


    createWindow();


    const firstTab =
        createTab();


    activateTab(firstTab);


    mainWindow.webContents.on(
        "did-finish-load",
        () => {

            /*
             * Credits page does not need the
             * browser tab information.
             */

            if (showingCredits) {
                return;
            }


            sendTabs();


            if (activeTabId !== null) {

                sendTabUpdate(
                    activeTabId
                );
            }
        }
    );
});


/* =========================================
   CLOSE APP
   ========================================= */

app.on(
    "window-all-closed",
    () => {

        if (
            process.platform !== "darwin"
        ) {
            app.quit();
        }
    }
);