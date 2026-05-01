# Borrow Dino - Web Build

## Building for Web (WASM)

### Prerequisites

Install `wasm-pack` if you haven't already:

```bash
cargo install wasm-pack
```

### Build Commands

**Windows (PowerShell):**
```powershell
.\build-wasm.ps1
```

**Linux/Mac:**
```bash
./build-wasm.sh
```

This will create the `pkg/` directory with the WASM module and JavaScript bindings.

### Running Locally

After building, serve the `web/` directory with any static file server:

```bash
cd web
python -m http.server 8080
```

Then open http://localhost:8080 in your browser.

Or use another server:
- `npx http-server .` (Node.js)
- `php -S localhost:8080` (PHP)
- `cargo install basic-http-server && basic-http-server .` (Rust)

### Troubleshooting

**"Failed to load game" error:** Make sure you've run the build script first and the `pkg/` directory exists inside `web/`.

**CORS errors:** You must serve the files via HTTP(S), not open `file://` directly. Browsers block WASM loading from local files.
