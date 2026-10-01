#pragma once

#include "include/cef_client.h"
#include "include/cef_life_span_handler.h"
#include "include/cef_load_handler.h"

class NovaHandler : public CefClient,
                    public CefLifeSpanHandler,
                    public CefLoadHandler {
public:
    NovaHandler();
    ~NovaHandler() override;

    CefRefPtr<CefLifeSpanHandler> GetLifeSpanHandler() override {
        return this;
    }

    CefRefPtr<CefLoadHandler> GetLoadHandler() override {
        return this;
    }

    void OnAfterCreated(
        CefRefPtr<CefBrowser> browser) override;

    void OnBeforeClose(
        CefRefPtr<CefBrowser> browser) override;

    void OnLoadError(
        CefRefPtr<CefBrowser> browser,
        CefRefPtr<CefFrame> frame,
        ErrorCode errorCode,
        const CefString& errorText,
        const CefString& failedUrl) override;

private:
    CefRefPtr<CefBrowser> browser_;

    IMPLEMENT_REFCOUNTING(NovaHandler);
};