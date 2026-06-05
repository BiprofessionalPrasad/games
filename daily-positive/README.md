# Daily Positive

A simple, beautiful GUI app that delivers a random positive quote, affirmation, message, or boost every time you click **"Give me"**.

Runs entirely in a Docker container. Zero dependencies on the host besides Docker.

## Features

- Clean, calming positive-themed interface
- 36+ hand-curated uplifting quotes & affirmations
- One big friendly **"Give me"** button
- Smooth pop-in animation + emoji decoration
- Copy to clipboard
- "Another one" button + keyboard support (`G` key or `Space`)
- Fully static — served by nginx inside the container
- Tiny Docker image (~20 MB)

## Quick Start

### Using Docker Compose (recommended)

```bash
docker compose up -d --build
```

Then open **http://localhost:8080**

Stop later with `docker compose down`.

### Using plain Docker

```bash
docker build -t daily-positive .
docker run -d --name daily-positive -p 8080:80 daily-positive
```

Visit **http://localhost:8080** and click the big **"Give me"** button.

Stop the container:

```bash
docker stop daily-positive && docker rm daily-positive
```

## Development (without Docker)

Just open `index.html` directly in any browser. No build step needed.

## Why this stack?

- Single HTML file = trivial to containerize and maintain
- nginx:alpine = minimal attack surface + fast startup
- All quotes are embedded (no external data sources or API calls)

## License

MIT — spread positivity freely.
