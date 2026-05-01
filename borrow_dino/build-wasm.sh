#!/bin/bash
# Build the WASM package for Borrow Dino

set -e

echo "Building WASM package..."
wasm-pack build --target web --release

echo "Copying to web directory..."
cp -r pkg/* web/pkg/

echo "Build complete!"
echo "Output: web/pkg/"
echo ""
echo "To serve the game locally:"
echo "  cd web"
echo "  python -m http.server 8080"
echo "Then open http://localhost:8080"
