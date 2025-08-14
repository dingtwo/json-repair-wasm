#!/bin/bash

# Build script for JSON Repair WebAssembly
echo "Building JSON Repair WASM..."

# Change to wasm-build directory
cd wasm-build

# Clean up previous builds
rm -f ../jsonrepair.wasm

# Build the WASM module
GOOS=js GOARCH=wasm go build -o ../jsonrepair.wasm

if [ $? -eq 0 ]; then
    echo "✅ Successfully built jsonrepair.wasm ($(stat -f%z ../jsonrepair.wasm 2>/dev/null || stat -c%s ../jsonrepair.wasm) bytes)"
else
    echo "❌ Build failed"
    exit 1
fi

# Copy wasm_exec.js if not exists
if [ ! -f ../web/wasm_exec.js ]; then
    cp "$(go env GOROOT)/lib/wasm/wasm_exec.js" ../web/
    echo "✅ Copied wasm_exec.js"
fi

echo "🎉 Build complete! You can now:"
echo "1. Open web/index.html in a browser"
echo "2. Or serve the web directory with: cd web && python3 -m http.server 8080"