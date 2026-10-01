#pragma once

#include "include/cef_app.h"

class NovaApp : public CefApp,
                public CefBrowserProcessHandler {
public:
    NovaApp();

    // CefApp
    CefRefPtr<CefBrowserProcessHandler> GetBrowserProcessHandler() override {
        return this;
    }

    // CefBrowserProcessHandler
    void OnContextInitialized() override;

private:
    IMPLEMENT_REFCOUNTING(NovaApp);
};