# Build the WASM package for Borrow Dino

Write-Host "Building WASM package..." -ForegroundColor Green
wasm-pack build --target web --release

Write-Host "Copying to web directory..." -ForegroundColor Green
if (Test-Path "web\pkg") {
    Remove-Item "web\pkg" -Recurse -Force
}
New-Item -ItemType Directory -Path "web\pkg" | Out-Null
Copy-Item "pkg\*" "web\pkg\" -Recurse

Write-Host ""
Write-Host "Build complete!" -ForegroundColor Green
Write-Host "Output: web/pkg/"
Write-Host ""
Write-Host "To serve the game locally:" -ForegroundColor Yellow
Write-Host "  cd web"
Write-Host "  python -m http.server 8080"
Write-Host "Then open http://localhost:8080"
