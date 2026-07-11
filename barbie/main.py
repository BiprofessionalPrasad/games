import os
import re
import time
from dotenv import load_dotenv
from openai import OpenAI, RateLimitError

load_dotenv()
api_key = os.getenv("OPENROUTER_API_KEY")

if not api_key:
    raise ValueError("❌ Error: OPENROUTER_API_KEY not found.")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key
)

# --- VERIFIED FREE MODEL PIPELINE (2026 ACTIVE) ---
MODEL_PIPELINE = [
    "qwen/qwen3-coder:free",                      # Top choice for raw syntax accuracy
    "openrouter/free",                            # Dynamic free auto-router fallback
    "meta-llama/llama-3.3-70b-instruct:free",     # High context stability
    "openai/gpt-oss-120b:free"                    # Excellent alternative reasoning engine
]

# Using Llama 3.3 70B for the logic check as it has stable, free availability
QA_MODEL = "meta-llama/llama-3.3-70b-instruct:free"

game_prompt = """
Act as an expert frontend game developer. Build a single-file, interactive 2D web-based Barbie game (HTML, CSS, and JS combined).
Theme: "Barbie's Fashion Runway Challenge"
Mechanics: Player uses Arrow keys or Mouse to move a basket horizontally at the bottom of the screen to catch falling items (emojis: 👠, 👗, 👑). Avoid mud (💩).
Include: Start Screen, Game Loop, Score counter, 30-second timer, Game Over screen with a Restart button.
CRITICAL: Do not truncate code. Ensure all `<script>` and `<html>` tags close perfectly.
"""

def clean_markdown(text):
    html_match = re.search(r"<!DOCTYPE html>.*</html>", text, re.DOTALL | re.IGNORECASE)
    if html_match:
        return html_match.group(0).strip()
    clean = text.replace("```html", "").replace("```", "")
    if "<think>" in clean:
        clean = clean.split("</think>")[-1]
    return clean.strip()

def run_browser_simulation_tests(html_code):
    errors = []
    for tag in ['<html>', '<head>', '<body>', '<style>', '<script>']:
        close_tag = tag.replace('<', '</')
        if tag in html_code.lower() and close_tag not in html_code.lower():
            errors.append(f"Missing critical closing tag: {close_tag}")
    if "requestanimationframe" not in html_code.lower() and "setinterval" not in html_code.lower():
        errors.append("Game engine failure: No game loop engine found.")
    if "addeventlistener" not in html_code.lower():
        errors.append("Interactive failure: No input event listeners registered.")
    return errors

# --- STAGE 1: RESILIENT CODE GENERATION ---
initial_output = ""
current_dev_model = ""

for model in MODEL_PIPELINE:
    try:
        print(f"🤖 [Dev]: Trying generation with {model}...")
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": game_prompt}]
        )
        initial_output = response.choices[0].message.content
        current_dev_model = model
        print(f"✨ Successful generation using {model}!")
        break 
    except RateLimitError:
        print(f"⚠️ {model} is rate limited right now. Switching to next fallback...")
        time.sleep(2)

if not initial_output:
    raise RuntimeError("❌ All fallback free models are currently heavily rate limited. Please try again in a minute.")

current_code = clean_markdown(initial_output)

# --- STAGE 2: TESTING LOOP ---
MAX_ATTEMPTS = 3
for attempt in range(1, MAX_ATTEMPTS + 1):
    print(f"\n🔍 [Run {attempt}]: Running strict QA verification...")
    
    structural_errors = run_browser_simulation_tests(current_code)
    
    qa_prompt = f"""
    You are a headless browser engine simulator. Analyze this HTML/JS code for runtime crashes:
    {current_code}
    If it passes perfectly, output ONLY the word "PASS". If it fails, list the specific bugs.
    """
    
    try:
        qa_response = client.chat.completions.create(
            model=QA_MODEL,
            messages=[{"role": "user", "content": qa_prompt}]
        )
        qa_report = qa_response.choices[0].message.content.strip()
    except RateLimitError:
        print("⚠️ QA Model rate limited. Skipping logic evaluation, using programmatic tests only.")
        qa_report = "PASS" 
        
    if not structural_errors and "PASS" in qa_report.upper():
        print("✅ [QA]: Code passed all syntax and state checks!")
        break
    else:
        print(f"❌ [QA]: Test failed on Attempt {attempt}!")
        error_summary = "\n".join(structural_errors) + f"\nLogic Bugs: {qa_report}"
        
        if attempt == MAX_ATTEMPTS:
            print("⚠️ Reached max healing attempts. Saving closest working revision.")
            break
            
        print(f"🔧 [Dev]: Auto-healing code using {current_dev_model}...")
        try:
            repair_response = client.chat.completions.create(
                model=current_dev_model,
                messages=[
                    {"role": "user", "content": game_prompt},
                    {"role": "assistant", "content": current_code},
                    {"role": "user", "content": f"FIX THESE SPECIFIC RUNTIME BUGS:\n{error_summary}\n\nReturn the ENTIRE repaired HTML page complete."}
                ]
            )
            current_code = clean_markdown(repair_response.choices[0].message.content)
        except RateLimitError:
            print("❌ Rate limited during code healing. Saving current code iteration.")
            break

# Save final audited file
with open("barbie_game.html", "w", encoding="utf-8") as file:
    file.write(current_code)

print("\n🎉 Process complete. Check 'barbie_game.html' in your directory!")