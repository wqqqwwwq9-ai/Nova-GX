cmake_minimum_required(VERSION 3.21)

project(NovaGX LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# =========================================================
# CEF
# =========================================================

set(CEF_ROOT "${CMAKE_SOURCE_DIR}/third_party/cef")

if(NOT EXISTS "${CEF_ROOT}/include/cef_app.h")
    message(FATAL_ERROR "CEF headers not found: ${CEF_ROOT}/include")
endif()

if(NOT EXISTS "${CEF_ROOT}/libcef_dll/CMakeLists.txt")
    message(FATAL_ERROR "CEF wrapper not found: ${CEF_ROOT}/libcef_dll")
endif()

# =========================================================
# CEF wrapper
# =========================================================

add_subdirectory(
    "${CEF_ROOT}/libcef_dll"
    "${CMAKE_BINARY_DIR}/libcef_dll_wrapper"
)

# =========================================================
# Nova GX
# =========================================================

add_executable(NovaGX WIN32
    native/main.cpp
    native/nova_app.cpp
    native/nova_app.h
    native/nova_handler.cpp
    native/nova_handler.h
)

target_include_directories(NovaGX PRIVATE
    "${CEF_ROOT}"
    "${CEF_ROOT}/include"
    "${CMAKE_SOURCE_DIR}/native"
)

# =========================================================
# Windows
# =========================================================

if(WIN32)

    target_compile_definitions(NovaGX PRIVATE
        UNICODE
        _UNICODE
        NOMINMAX
        WIN32_LEAN_AND_MEAN
    )

endif()

# =========================================================
# CEF wrapper library
# =========================================================

target_link_libraries(NovaGX PRIVATE
    libcef_dll_wrapper
)

# =========================================================
# Nova GX web files
# =========================================================

add_custom_command(TARGET NovaGX POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
        "${CMAKE_SOURCE_DIR}/web"
        "$<TARGET_FILE_DIR:NovaGX>/web"
)

# =========================================================
# CEF runtime
# =========================================================

if(EXISTS "${CEF_ROOT}/Release/libcef.dll")
    add_custom_command(TARGET NovaGX POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_if_different
            "${CEF_ROOT}/Release/libcef.dll"
            "$<TARGET_FILE_DIR:NovaGX>/libcef.dll"
    )
endif()

if(EXISTS "${CEF_ROOT}/Release/chrome_elf.dll")
    add_custom_command(TARGET NovaGX POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_if_different
            "${CEF_ROOT}/Release/chrome_elf.dll"
            "$<TARGET_FILE_DIR:NovaGX>/chrome_elf.dll"
    )
endif()

if(EXISTS "${CEF_ROOT}/Resources")
    add_custom_command(TARGET NovaGX POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_directory
            "${CEF_ROOT}/Resources"
            "$<TARGET_FILE_DIR:NovaGX>/Resources"
    )
endif()

message(STATUS "====================================")
message(STATUS "Nova GX")
message(STATUS "CEF: ${CEF_ROOT}")
message(STATUS "CEF wrapper enabled")
message(STATUS "C++20 enabled")
message(STATUS "====================================")