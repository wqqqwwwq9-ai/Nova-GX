#include "nova_handler.h"

#include "include/cef_browser.h"
#include "include/cef_frame.h"

NovaHandler::NovaHandler() = default;

NovaHandler::~NovaHandler() = default;

void NovaHandler::OnAfterCreated(
    CefRefPtr<CefBrowser> browser) {

    browser_ = browser;
}

void NovaHandler::OnBeforeClose(
    CefRefPtr<CefBrowser> browser) {

    if (browser_ && browser_->IsSame(browser)) {
        browser_ = nullptr;
    }
}

void NovaHandler::OnLoadError(
    CefRefPtr<CefBrowser> browser,
    CefRefPtr<CefFrame> frame,
    ErrorCode errorCode,
    const CefString& errorText,
    const CefString& failedUrl) {

    // Chromium will handle the error page normally.
}