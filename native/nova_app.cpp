#include "nova_app.h"
#include "nova_handler.h"

#include "include/cef_browser.h"

NovaApp::NovaApp() = default;

void NovaApp::OnContextInitialized() {
    CefWindowInfo window_info;

#if defined(OS_WIN)
    window_info.SetAsPopup(nullptr, "Nova GX");
#endif

    CefBrowserSettings browser_settings;

    CefRefPtr<NovaHandler> handler = new NovaHandler();

    CefBrowserHost::CreateBrowser(
        window_info,
        handler,
        "https://www.google.com",
        browser_settings,
        nullptr,
        nullptr
    );
}