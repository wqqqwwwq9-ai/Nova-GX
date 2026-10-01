#include "nova_app.h"

#include "include/cef_app.h"

int APIENTRY wWinMain(
    HINSTANCE hInstance,
    HINSTANCE hPrevInstance,
    wchar_t* lpCmdLine,
    int nCmdShow) {

    CefMainArgs main_args(hInstance);

    CefRefPtr<NovaApp> app = new NovaApp();

    // CEF subprocesses enter here before the main browser process.
    int exit_code = CefExecuteProcess(main_args, app, nullptr);

    if (exit_code >= 0) {
        return exit_code;
    }

    CefSettings settings;

    // Development build: sandbox disabled.
    settings.no_sandbox = true;

    settings.windowless_rendering_enabled = false;
    settings.multi_threaded_message_loop = true;

    if (!CefInitialize(main_args, settings, app, nullptr)) {
        return 1;
    }

    CefRunMessageLoop();

    CefShutdown();

    return 0;
}