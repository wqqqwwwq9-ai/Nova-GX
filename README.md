# Nova GX — Native Chromium Edition

Nova GX is a gaming-focused browser shell built around **C++ + Chromium/CEF + JavaScript + HTML + CSS**, with WebAssembly available for optional high-performance modules.

## What is included

- C++ application process
- CEF/Chromium browser creation
- Native window lifecycle
- Native browser/client callbacks
- Browser navigation callbacks
- Local Nova GX home page
- Gaming-oriented UI
- Keyboard shortcuts
- Tab-management architecture
- CMake build configuration

## Technology

```text
C++                 Native application / browser process
Chromium / CEF      Web rendering engine
JavaScript          Nova GX interface behavior
HTML                Interface structure
CSS                 Gaming visual system
WebAssembly         Optional future performance modules
```

## Build prerequisites

Install:

- CMake 3.20+
- A C++17 compiler
- A matching CEF binary distribution

CEF is deliberately not bundled in this repository because its runtime is large and platform-specific.

Place the extracted CEF distribution here:

```text
third_party/cef/
```

Then:

```bash
cmake -S . -B build
cmake --build build --config Release
```

For production distribution, copy the CEF runtime files, resources, locales, subprocess/helper executable, and Nova GX `web/` directory beside the application according to the CEF distribution's platform instructions.

## Notes

This is a real native browser architecture scaffold. It is not a claim that a small repository contains the entire Chromium source tree. Chromium itself is a very large upstream project.
