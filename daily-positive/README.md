# Daily Positive

A beautiful GUI app that gives you a random positive quote, affirmation, message, note or boost when you click **"Give me"**.

It can now **pull the latest positives and good news directly from X (Twitter)** when you provide a (free) API token. Otherwise it falls back to a rich curated list.

Runs in a single Docker container.

## Features

- Gorgeous calm positive UI with smooth animations
- Big friendly **"Give me"** button
- **Live from X**: real recent uplifting posts & good-news stories (when configured)
- 36+ high-quality curated affirmations as instant fallback
- Random fresh emoji + nice pop animation on every boost
- Copy button (includes attribution + X link when available)
- "Another one" + full keyboard support (`G` / `Space`)
- Source badge ("𝕏 LIVE" vs "CURATED")
- "View on 𝕏" link for live posts
- Works completely offline / as a single HTML file when opened directly

## Quick Start (Docker)

### 1. Start the app

```powershell
# From the daily-positive folder
docker compose up -d --build
```

Open **http://localhost:8080**

### 2. (Optional but recommended) Enable live pulls from X

1. Go to https://developer.x.com/
2. Sign in / create a free developer account.
3. Create a Project + App (choose **Essential** access tier — it's free).
4. In your app settings → **Keys and tokens**, generate a **Bearer Token**.
5. Start the container with the token:

```powershell
$env:X_BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAA...your_token_here..."
docker compose up -d --build
```

Or use a `.env` file next to `docker-compose.yml`:

```env
X_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAA...your_token_here...
```

Then:

```powershell
docker compose up -d --build
```

Without the token you still get excellent curated boosts instantly.

Stop with:

```powershell
docker compose down
```

### Plain Docker (no compose)

```powershell
docker build -t daily-positive .
docker run -d --name daily-positive -p 8080:8080 `
  -e X_BEARER_TOKEN="your_bearer_token_here" `
  daily-positive
```

## Development / Testing without Docker

- Double-click `index.html` (or `Start-Process index.html`) — works fully with the local list.
- For backend development:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python main.py
# or
uvicorn main:app --reload --port 8080
```

Visit http://localhost:8080

Useful debug endpoints:
- `/api/health` — shows whether an X token is configured and cache status
- `/api/local` — forces a local curated boost

## How the "crawl X" part works

- The backend (FastAPI) calls X's official recent search API with carefully tuned queries targeting:
  - Trusted positive/good-news accounts (`@goodnewsnetwork`, `@Upworthy`, `@PositiveNewsUK`)
  - Heartwarming stories, gratitude posts, community wins, environmental/science good news, etc.
- Results are cached for ~3 minutes to stay well under free-tier rate limits.
- If the X call fails (no token, rate limit, network), it instantly falls back to the local list.
- You get real, recent positives and good news mixed with timeless affirmations.

## Architecture (v2)

- FastAPI (Python) serves both the GUI and the `/api/boost` JSON endpoint
- Static beautiful single-file frontend (Tailwind via CDN)
- One Docker image
- Optional X Bearer Token via environment variable

## License

MIT — share the positivity.
## New in this version: More free live sources + expanded list

The app now pulls **fresh content** from multiple keyless public sources (no X token required):

- **ZenQuotes** – random inspirational quotes
- **Quotable** – positive/inspirational quotes filtered by uplifting tags
- **Good News Network RSS** – real recent positive news stories and uplifting headlines

These are tried automatically when you click "Give me". X integration remains optional for even more real-time posts from accounts like @goodnewsnetwork.

The local curated list has been expanded to ~85 high-quality affirmations, quotes, and boosts for excellent offline / fallback experience.

Rebuild with docker compose up -d --build to get the updates.

**Note on README top sections:** The live sources now work without X (ZenQuotes + Quotable + Good News RSS). The X parts are now clearly marked as optional/advanced.
