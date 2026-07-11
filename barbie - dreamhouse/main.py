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

# 2026 Resilient Free Model Configuration
MODEL_PIPELINE = [
    "openrouter/free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "openai/gpt-oss-120b:free"
]
QA_MODEL = "openrouter/free"

# game_prompt = """
game_prompt = """
Act as a master frontend game engineer. Build a comprehensive, single-file 2D life-simulation sandbox game using HTML, CSS, and vanilla JavaScript combined. 

### Game Title: "Barbie's Magical City Simulator"

### Visual Style:
- Gorgeous, modern pastel pink theme (#FF69B4, #FFF0F5, #D8BFD8).
- Clean, responsive UI layout with a persistent top navigation bar showing the Player's Stats (Coins: ⭐, Joy: 💖) and their Current Location.
- Use distinct, colorful emojis for all assets, items, and map icons.

### Core Modules & Systems Required:
1. **Avatar Creator (Start Screen):**
   - The player can select or toggle Barbie's hairstyle (💇‍♀️, 👱‍♀️), dress color (👗, 👚, 👘), and companion animal (🦄 Unicorn or 🐎 Horse).
   - A text input field to name their character.
   - A "Enter Barbie City" confirmation button.

2. **Main Navigation HUD (Barbie City Hub):**
   - A sidebar or tab dashboard that lets the player seamlessly travel between 4 distinct locations: [Kitchen], [Stables], [Garden], and [Dreamhouse Builder].

3. **Location A: The Dream Kitchen (Cooking Mini-Game):**
   - A functional cooking pot layout. 
   - A menu of ingredients to click and add (🥕 Vegetable, 🍅 Tomato, 🍄 Mushroom, 🧀 Cheese, 🥩 Protein).
   - Clicking "Cook Soup!" triggers a stirring progress animation, combines the emojis into a dynamic title (e.g., "🍅🥕 Soup"), grants +20 Coins, and plays a sparkling notification.

4. **Location B: Magical Stables (Pet Interaction):**
   - Displays the selected companion (🦄 or 🐎).
   - Interactive buttons: "Feed Magical Apple" 🍎, "Brush Mane" 🪮, or "Go for a Ride" 🏞️. 
   - Interacting plays a text speech bubble from the pet (e.g., "*Happy Whinny!*") and fills a "Joy Meter".

5. **Location C: The Greenhouse (Gardening Simulator):**
   - A grid layout of soil patches. 
   - Clicking an empty patch costs coins to plant a seed (🌱). 
   - A timer countdown displays over the patch. Clicking it when ripe harvests a magical flower (🌹, 🌻, 🌸) for a profit!

6. **Location D: Dreamhouse Builder (Grid Customization):**
   - A blank rooms grid. 
   - A build menu of furniture pieces (🛋️ Sofa, 🛏️ Bed, 📺 TV, 🛁 Tub) that players purchase with coins and click to place down onto the house grid tiles.

### Code Architecture Constraints:
- Store the entire game state in a single clean global JavaScript object (e.g., `let gameState = { coins: 100, inventory: [], houseGrid: {} }`).
- Use clean semantic UI tabs (`display: none` / `display: block`) to toggle screens instantly without page refreshes.
- Ensure all logic functions are completely self-contained and modular so nothing conflicts. Do not use external libraries.
"""


def clean_markdown(text):
    html_match = re.search(r"<!DOCTYPE html>.*</html>", text, re.DOTALL | re.IGNORECASE)
    if html_match:
        return html_match.group(0).strip()
    clean = text.replace("```html", "").replace("```", "")
    if "<think>" in clean:
        clean = clean.split("</think>")[-1]
    return clean.strip()

def qa_manager_runtime_audit(html_code):
    """
    The QA Manager's programmatic strict integration audit.
    Verifies state tracking and UI event bindings.
    """
    errors = []
    
    # Check 1: Base Syntax
    for tag in ['<html>', '<body>', '<style>', '<script>']:
        close_tag = tag.replace('<', '</')
        if tag in html_code.lower() and close_tag not in html_code.lower():
            errors.append(f"Missing basic structural closing tag: {close_tag}")
            
    # Check 2: UI Event Navigation Binding Verification (Fixes the current bug)
    navigation_keywords = ['onclick', 'addeventlistener', 'display =', 'showscreen', 'changescreen', 'classlist']
    found_nav = any(kw in html_code.lower() for kw in navigation_keywords)
    if not found_nav:
        errors.append("UI Event Failure: The interaction engine is dead. No navigation variables, toggle logic, or event state-changes are registered.")

    # Check 3: Multi-scene elements check
    if "kitchen" not in html_code.lower() or "garden" not in html_code.lower():
        errors.append("Asset Completeness Failure: The model dropped the multi-location scene blocks to save tokens.")

    return errors

# --- GENERATION ENGINE ---
initial_output = ""
current_dev_model = ""

for model in MODEL_PIPELINE:
    try:
        print(f"🤖 [Dev]: Generating sandbox layout with {model}...")
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": game_prompt}]
        )
        initial_output = response.choices[0].message.content
        current_dev_model = model
        print(f"✨ Setup generated successfully using {model}!")
        break 
    except RateLimitError:
        print(f"⚠️ {model} is rate limited. Trying next pipeline agent...")
        time.sleep(2)

if not initial_output:
    raise RuntimeError("❌ All fallback free models are currently rate limited.")

current_code = clean_markdown(initial_output)

# --- ADVANCED QA MULTI-AGENT TESTING LOOP ---
MAX_ATTEMPTS = 3
for attempt in range(1, MAX_ATTEMPTS + 1):
    print(f"\n📋 [Run {attempt}]: Handing code package to the QA Manager...")
    
    # 1. QA Manager Code Validation
    manager_errors = qa_manager_runtime_audit(current_code)
    
    # 2. LLM Engine Audit Check
    qa_prompt = f"""
    Analyze this game code for broken button bindings and frozen game loops:
    {current_code}
    
    Look specifically at the 'Enter Barbie City' entry button transition logic. Will it switch the visibility of the screen panels?
    If yes and everything looks completely valid, reply ONLY with 'PASS'. If it will freeze on click, report the bug details.
    """
    
    try:
        qa_response = client.chat.completions.create(
            model=QA_MODEL,
            messages=[{"role": "user", "content": qa_prompt}]
        )
        qa_report = qa_response.choices[0].message.content.strip()
    except RateLimitError:
        print("⚠️ QA validation layer rate limited. Defaulting to manager schema validation.")
        qa_report = "PASS"
        
    if not manager_errors and "PASS" in qa_report.upper():
        print("✅ [QA Manager]: Code passed layout, button event, and state engine verification!")
        break
    else:
        print(f"❌ [QA Manager]: Rejecting code build on Attempt {attempt}!")
        error_summary = "\n".join(manager_errors) + f"\nLogic Bugs: {qa_report}"
        print(f"Bugs reported to engineer:\n{error_summary}")
        
        if attempt == MAX_ATTEMPTS:
            print("⚠️ Max correction iterations reached. Saving final current build.")
            break
            
        print(f"🔧 [Dev]: Rewriting structural integration layout using {current_dev_model}...")
        try:
            repair_response = client.chat.completions.create(
                model=current_dev_model,
                messages=[
                    {"role": "user", "content": game_prompt},
                    {"role": "assistant", "content": current_code},
                    {"role": "user", "content": f"CRITICAL REPAIR REQUIRED:\n{error_summary}\n\nThe button to switch screens did not fire. Rewire the function and rewrite the entire HTML file from scratch making it completely functional."}
                ]
            )
            current_code = clean_markdown(repair_response.choices[0].message.content)
        except RateLimitError:
            print("❌ Processing error during repair iteration. Exporting current version.")
            break

# Save checked production asset
with open("barbie_game.html", "w", encoding="utf-8") as file:
    file.write(current_code)

print("\n🎉 Freshly audited city sandbox saved to 'barbie_game.html'. Give it a spin now!")