"""
Daily Positive - FastAPI backend + static frontend
- Serves the beautiful GUI at /
- /api/boost returns a positive quote/message/boost
- Prefers live results from X (Twitter) if X_BEARER_TOKEN is provided
- Falls back gracefully to a rich local curated list
"""

import os
import random
import time
from typing import Optional, List, Dict, Any

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(
    title="Daily Positive",
    description="Random positive quotes, messages, notes & boosts. Live from X when possible.",
    version="2.0.0",
)

# Allow same-origin only in practice; this is harmless for our use case
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static assets (the HTML/JS/CSS lives here)
app.mount("/static", StaticFiles(directory="static"), name="static")

X_BEARER_TOKEN: Optional[str] = os.getenv("X_BEARER_TOKEN")
CACHE_TTL_SECONDS = 180  # 3 minutes - keeps us well under free tier rate limits
_last_fetch_time: float = 0.0
_cached_boosts: List[Dict[str, Any]] = []

# High-quality local fallback list (expanded for more variety when offline or as backup)
LOCAL_QUOTES: List[str] = [
    "I am enough just as I am.",
    "I am worthy of love, joy, and happiness.",
    "I am capable of achieving my goals.",
    "Every day is a fresh start filled with new possibilities.",
    "I choose joy and gratitude today.",
    "I am strong, resilient, and brave.",
    "I trust that I am exactly where I need to be.",
    "I radiate love and positivity.",
    "I am at peace with what is.",
    "Asking for help is a sign of self-respect.",
    "I am allowed to feel good and enjoy life.",
    "I am growing at my own perfect pace.",
    "I am safe, supported, and loved.",
    "I belong here and deserve to take up space.",
    "I practice gratitude for all that I have.",
    "I let go of what I cannot control.",
    "I choose peace over worry.",
    "One small positive thought can change your whole day.",
    "Start each day with a positive thought and a grateful heart.",
    "You are braver than you believe, stronger than you seem, and smarter than you think. — A.A. Milne",
    "The happiness of your life depends upon the quality of your thoughts. — Marcus Aurelius",
    "We become what we think about. — Earl Nightingale",
    "I am the architect of my own destiny.",
    "I release self-doubt and embrace confidence.",
    "You've got this. One step at a time.",
    "Progress, not perfection.",
    "Breathe. This moment is yours.",
    "Your potential is endless. Go shine.",
    "Today I choose to see the good.",
    "I am becoming the best version of myself.",
    "Kindness to yourself is never wasted.",
    "Small steps lead to big changes.",
    "You make the world brighter just by being in it.",
    "Everything I need is already within me.",
    "I am open to wonderful surprises today.",
    "My heart is open and my spirit is light.",
    # Expanded additions for more variety
    "Every day may not be good, but there is something good in every day.",
    "You have survived 100% of your worst days.",
    "The best is yet to come.",
    "I am becoming stronger every day.",
    "I choose to focus on what I can control.",
    "My thoughts create my reality.",
    "I am a magnet for positive energy.",
    "I release what no longer serves me.",
    "I am exactly where I am meant to be.",
    "Challenges are opportunities in disguise.",
    "I am worthy of all the good things coming my way.",
    "I trust the timing of my life.",
    "I am surrounded by abundance.",
    "My smile is my superpower.",
    "I am learning and growing every single day.",
    "Happiness is a choice I make every morning.",
    "I am the author of my own story.",
    "Today is a great day to have a great day.",
    "I attract people and situations that uplift me.",
    "I am at home in my own skin.",
    "The universe is conspiring in my favor.",
    "I forgive myself and others easily.",
    "I am full of creative ideas.",
    "My energy is contagious in the best way.",
    "I celebrate small wins.",
    "I am resilient like a tree in the wind.",
    "Peace begins with me.",
    "I am open to receiving love in all forms.",
    "My future is bright and full of promise.",
    "I speak kindly to myself.",
    "I am a work in progress and that's beautiful.",
    "Gratitude turns what we have into enough.",
    "I choose courage over comfort.",
    "I am the calm in the storm.",
    "Every breath is a new beginning.",
    "I am enough, I have enough, I do enough.",
    "Positivity is my default setting.",
    "I create space for joy in my life.",
    "I am a light for others.",
    "The only limit is the one I set myself.",
    "I am grateful for the lessons and the blessings.",
    "My heart is full of hope.",
    "I move forward with confidence.",
    "I am a masterpiece in the making.",
    "Life is happening for me, not to me.",
    "I embrace the present moment fully.",
    "I am powerful beyond measure.",
    "Good things are unfolding for me right now.",
    "I trust myself completely.",
    "I am a source of positivity in the world.",
]

# Carefully chosen queries for genuinely positive / uplifting / good-news content
POSITIVE_QUERIES: List[str] = [
    "from:goodnewsnetwork",
    "from:Upworthy",
    "from:PositiveNewsUK",
    '("heartwarming" OR "made my day" OR "uplifting story" OR "good news") min_faves:5 lang:en -is:retweet',
    '("I am grateful" OR "so thankful" OR "today I am" OR "gratitude") min_faves:3 lang:en -is:retweet',
    '("positive news" OR "good news" OR kindness) (science OR environment OR health OR community) min_faves:4 lang:en -is:retweet',
]


def _normalize_x_tweet(tweet: Dict[str, Any], user: Dict[str, Any]) -> Dict[str, Any]:
    text = (tweet.get("text") or "").strip()
    # Remove common trailing t.co link if the whole tweet is just a link + text (keep text)
    username = user.get("username", "")
    name = user.get("name", "Someone on X")
    tweet_id = tweet.get("id", "")

    url = f"https://x.com/{username}/status/{tweet_id}" if username and tweet_id else None

    attribution = f"{name}"
    if username:
        attribution += f" (@{username})"

    return {
        "text": text,
        "attribution": attribution,
        "source": "X",
        "url": url,
        "fetched_at": time.time(),
    }


async def _search_x_once(query: str, max_results: int = 6) -> List[Dict[str, Any]]:
    """Perform one recent search against X API v2."""
    if not X_BEARER_TOKEN:
        return []

    url = "https://api.twitter.com/2/tweets/search/recent"
    params = {
        "query": query,
        "max_results": max_results,
        "tweet.fields": "id,text,created_at,author_id,public_metrics",
        "expansions": "author_id",
        "user.fields": "id,username,name",
    }
    headers = {"Authorization": f"Bearer {X_BEARER_TOKEN}"}

    try:
        async with httpx.AsyncClient(timeout=12.0, follow_redirects=True) as client:
            resp = await client.get(url, params=params, headers=headers)
            if resp.status_code == 429:
                print("X API rate limit hit")
                return []
            resp.raise_for_status()
            payload = resp.json()
    except Exception as exc:
        print(f"X search error for '{query}': {exc}")
        return []

    users = {u["id"]: u for u in payload.get("includes", {}).get("users", [])}
    results: List[Dict[str, Any]] = []

    for t in payload.get("data", []):
        user = users.get(str(t.get("author_id")), {})
        normalized = _normalize_x_tweet(t, user)
        # Basic quality filter: skip very short or empty
        if len(normalized["text"]) > 12:
            results.append(normalized)

    return results


async def fetch_live_boosts() -> List[Dict[str, Any]]:
    """
    Try to fetch fresh positive content from X.
    Uses a small set of queries and returns a list we can pick from.
    """
    global _last_fetch_time, _cached_boosts

    now = time.time()
    if _cached_boosts and (now - _last_fetch_time) < CACHE_TTL_SECONDS:
        return _cached_boosts

    all_results: List[Dict[str, Any]] = []
    # Shuffle and try several queries so we get variety without burning rate limit
    queries = POSITIVE_QUERIES.copy()
    random.shuffle(queries)

    for q in queries[:4]:  # at most 4 calls per refresh
        batch = await _search_x_once(q, max_results=5)
        all_results.extend(batch)
        if len(all_results) >= 6:
            break

    if all_results:
        _cached_boosts = all_results
        _last_fetch_time = now
        print(f"Fetched {len(all_results)} live boosts from X")
        return all_results

    return []


async def fetch_free_quote() -> Optional[Dict[str, Any]]:
    """Fetch a fresh random inspirational/positive quote from a free public API (no key needed)."""
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            # ZenQuotes - simple, reliable, no key, focused on positive/inspirational
            resp = await client.get("https://zenquotes.io/api/random")
            resp.raise_for_status()
            data = resp.json()
            if data and isinstance(data, list) and len(data) > 0:
                item = data[0]
                quote = (item.get("q") or "").strip()
                author = (item.get("a") or "Unknown").strip()
                if quote:
                    return {
                        "text": quote,
                        "attribution": author,
                        "source": "ZenQuotes",
                        "url": "https://zenquotes.io/",
                    }
    except Exception as exc:
        print(f"Free quote API error: {exc}")
    return None


async def fetch_quotable() -> Optional[Dict[str, Any]]:
    """Fetch from Quotable.io - free, no key, filter for positive/inspirational tags."""
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            # Use tags to keep things positive and uplifting
            url = "https://api.quotable.io/random?tags=inspirational,happiness,life,wisdom"
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
            content = (data.get("content") or "").strip()
            author = (data.get("author") or "Unknown").strip()
            if content:
                return {
                    "text": content,
                    "attribution": author,
                    "source": "Quotable",
                    "url": "https://api.quotable.io",
                }
    except Exception as exc:
        print(f"Quotable API error: {exc}")
    return None


async def fetch_positive_news() -> Optional[Dict[str, Any]]:
    """Fetch latest positive/good news from a public RSS feed (no key, simple XML parse)."""
    feeds = [
        "https://www.goodnewsnetwork.org/feed/",
    ]
    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            resp = await client.get(feeds[0])
            resp.raise_for_status()
            import xml.etree.ElementTree as ET
            import re

            root = ET.fromstring(resp.content)
            # RSS items are usually under channel/item
            items = root.findall(".//item") or root.findall(".//{http://www.w3.org/2005/Atom}entry")
            if items:
                item = random.choice(items[:8])  # pick from recent ones
                title = (item.findtext("title") or item.findtext("{http://www.w3.org/2005/Atom}title") or "").strip()
                desc = (item.findtext("description") or item.findtext("{http://www.w3.org/2005/Atom}summary") or "").strip()
                link = (item.findtext("link") or item.findtext("{http://www.w3.org/2005/Atom}link") or "").strip()

                # Clean HTML from description
                desc = re.sub(r"<[^>]+>", " ", desc).strip()
                desc = re.sub(r"\s+", " ", desc)[:220]  # keep short

                if title:
                    text = f"{title}"
                    if desc and len(desc) > 10:
                        text += f" — {desc}"
                    return {
                        "text": text,
                        "attribution": "Good News Network",
                        "source": "Good News",
                        "url": link or "https://www.goodnewsnetwork.org",
                    }
    except Exception as exc:
        print(f"Positive news RSS error: {exc}")
    return None


async def get_random_boost() -> Dict[str, Any]:
    """Main logic - tiered live sources for "latest positives, news etc.":
    1. X (if Bearer Token configured) - real recent posts & good news from trusted accounts
    2. Free public APIs (always available, no keys):
       - ZenQuotes (inspirational)
       - Quotable (tagged positive quotes)
       - Good News RSS (actual recent uplifting news stories)
    3. Large local curated list (ultimate offline fallback)
    """
    # 1. Live from X if token is set (real tweets / good news)
    if X_BEARER_TOKEN:
        live_x = await fetch_live_boosts()
        if live_x:
            return random.choice(live_x).copy()

    # 2. Try free live sources (no account or token needed)
    # Shuffle to get nice variety across calls
    live_fetchers = [fetch_free_quote, fetch_quotable, fetch_positive_news]
    random.shuffle(live_fetchers)

    for fetcher in live_fetchers[:2]:  # try up to 2 different live sources per click
        result = await fetcher()
        if result and result.get("text"):
            return result

    # 3. Local curated fallback (always available, works fully offline)
    text = random.choice(LOCAL_QUOTES)
    return {
        "text": text,
        "attribution": None,
        "source": "curated",
        "url": None,
    }


# ------------------ Routes ------------------

@app.get("/", include_in_schema=False)
async def serve_gui():
    """Serve the main GUI (single HTML file with Tailwind + JS)."""
    return FileResponse("static/index.html")


@app.get("/api/boost")
async def api_boost(request: Request):
    """Return one positive boost. JSON shape:
    {
      "text": "...",
      "attribution": "Name (@handle)" or null,
      "source": "X" | "curated",
      "url": "https://x.com/..." or null
    }
    """
    boost = await get_random_boost()
    # Add a small cache-bust hint for debugging if wanted
    boost["server_time"] = int(time.time())
    return JSONResponse(boost)


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "has_x_token": bool(X_BEARER_TOKEN),
        "cached_items": len(_cached_boosts),
        "cache_age_seconds": int(time.time() - _last_fetch_time) if _last_fetch_time else 0,
    }


@app.get("/api/local")
async def api_local():
    """Debug / fallback endpoint returning a local-only boost."""
    text = random.choice(LOCAL_QUOTES)
    return {
        "text": text,
        "attribution": None,
        "source": "curated",
        "url": None,
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8080"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
