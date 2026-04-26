import os
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import json
import traceback
import sys
import requests
import random
from functools import wraps

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

env_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
load_dotenv(env_path)

app = Flask(__name__)
CORS(app)

# Configure Gemini using the new google.genai SDK
api_key = os.getenv("GEMINI_API_KEY")
genai_client = None

if api_key:
    try:
        from google import genai
        genai_client = genai.Client(api_key=api_key)
        print("[OK] Gemini API configured successfully with google.genai SDK")
    except ImportError:
        # Fallback to old SDK
        try:
            import google.generativeai as genai_old
            genai_old.configure(api_key=api_key)
            genai_client = "legacy"
            print("[OK] Gemini API configured with legacy SDK")
        except Exception as e:
            print(f"[ERROR] Failed to configure Gemini: {e}")
    except Exception as e:
        print(f"[ERROR] Failed to configure Gemini: {e}")
else:
    print("[WARN] No GEMINI_API_KEY found in environment")

# Load dataset
CSV_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'raw_schemes.csv')
schemes_df = pd.DataFrame()

try:
    if os.path.exists(CSV_PATH):
        schemes_df = pd.read_csv(CSV_PATH)
        schemes_df = schemes_df.fillna('')
        print(f"[OK] Loaded {len(schemes_df)} schemes from CSV")
    else:
        print(f"[WARN] CSV not found at {CSV_PATH}")
except Exception as e:
    print(f"[ERROR] Error loading CSV: {e}")

def clean_json_response(text):
    """Remove markdown formatting from AI JSON response."""
    text = text.strip()
    if text.startswith('```'):
        # Remove starting ```json or ```
        text = text.split('\n', 1)[1]
        # Remove ending ```
        if text.endswith('```'):
            text = text.rsplit('```', 1)[0]
    return text.strip()

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # Simplistic auth for development/demo
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Missing token"}), 401
        return f(*args, **kwargs)
    return decorated

def call_gemini(prompt):
    """Call Gemini API using available SDK."""
    global genai_client
    if genai_client is None:
        return None
    try:
        if genai_client == "legacy":
            import google.generativeai as genai_old
            model = genai_old.GenerativeModel('gemini-2.0-flash')
            response = model.generate_content(prompt)
            return response.text
        else:
            response = genai_client.models.generate_content(
                model='gemini-2.0-flash',
                contents=prompt
            )
            return response.text
    except Exception as e:
        print(f"[WARN] Gemini API call failed: {e}")
        return None

def get_matches(state, occupation, gender, category, limit=15):
    """Filter and score schemes based on user profile."""
    if schemes_df.empty:
        return []
    df = schemes_df.copy()
    central_mask = df['level'].str.contains('Central', case=False, na=False)
    state_mask = pd.Series(False, index=df.index)
    if state and state != 'All':
        state_mask = (df['level'].str.contains('State', case=False, na=False)) & (
            df['details'].str.contains(state, case=False, na=False) | 
            df['scheme_name'].str.contains(state, case=False, na=False) |
            df['eligibility'].str.contains(state, case=False, na=False)
        )
    df = df[central_mask | state_mask]
    if category and category != 'All':
        cat_mask = df['schemeCategory'].str.contains(category, case=False, na=False)
        if cat_mask.any():
            df = df[cat_mask]
    
    def calculate_score(row):
        score = 0
        text = (str(row.get('scheme_name', '')) + " " + str(row.get('details', '')) + " " + str(row.get('eligibility', '')) + " " + str(row.get('benefits', ''))).lower()
        if occupation:
            for kw in str(occupation).lower().split():
                if len(kw) > 2 and kw in text: score += 8
        if gender:
            g = str(gender).lower()
            if g in text: score += 5
            if g == 'female' and ('women' in text or 'mahila' in text or 'girl' in text): score += 8
        if state and state != 'All' and state.lower() in text: score += 5
        if str(row.get('benefits', '')).strip(): score += 2
        return score

    df['score'] = df.apply(calculate_score, axis=1)
    df = df.sort_values(by='score', ascending=False)
    
    if limit:
        results = df.head(limit).to_dict('records')
    else:
        results = df.to_dict('records')
        
    for r in results: r.pop('score', None)
    return results

def rank_with_gemini(user_profile, schemes):
    if genai_client is None or not schemes: return schemes
    schemes_text = ""
    for i, s in enumerate(schemes[:10]):
        schemes_text += f"{i}. {s.get('scheme_name', 'N/A')}\n   Category: {s.get('schemeCategory', 'N/A')}\n   Eligibility: {str(s.get('eligibility', ''))[:200]}\n\n"
    prompt = f"Rank these schemes for user profile: {json.dumps(user_profile)}. Return ONLY a JSON array of indices.\n\nSchemes:\n{schemes_text}"
    try:
        text = call_gemini(prompt)
        if text and '[' in text:
            indices = json.loads(text[text.find('['):text.rfind(']')+1])
            ranked = [schemes[i] for i in indices if 0 <= i < len(schemes)]
            seen = {id(s) for s in ranked}
            for s in schemes:
                if id(s) not in seen: ranked.append(s)
            return ranked
    except: pass
    return schemes

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "schemes_loaded": len(schemes_df),
        "gemini_available": genai_client is not None
    })

@app.route('/compare', methods=['POST'])
def compare_schemes():
    try:
        data = request.json or {}
        home_state = data.get('homeState', 'All')
        current_state = data.get('currentState', 'All')
        occupation = data.get('occupation', '')
        gender = data.get('gender', '')
        category = data.get('category', 'All')
        
        # Get specific matches for the requested category
        home_matches = get_matches(home_state, occupation, gender, category)
        current_matches = get_matches(current_state, occupation, gender, category)
        
        # Calculate category counts across all categories (no category filter, no limit)
        all_home = get_matches(home_state, occupation, gender, 'All', limit=None)
        all_current = get_matches(current_state, occupation, gender, 'All', limit=None)
        
        # Calculate exactly how many schemes the frontend will show for each category
        # The frontend uses: Math.max(home_schemes.length, current_schemes.length)
        # where each is capped at 15 by the get_matches limit.
        home_cat_counts = {}
        for scheme in all_home:
            cats = str(scheme.get('schemeCategory', 'All')).split(',')
            for cat in cats:
                c = cat.strip()
                if c: home_cat_counts[c] = home_cat_counts.get(c, 0) + 1
                
        current_cat_counts = {}
        for scheme in all_current:
            cats = str(scheme.get('schemeCategory', 'All')).split(',')
            for cat in cats:
                c = cat.strip()
                if c: current_cat_counts[c] = current_cat_counts.get(c, 0) + 1
                
        category_counts = {}
        all_categories = set(home_cat_counts.keys()).union(set(current_cat_counts.keys()))
        for c in all_categories:
            h_count = min(home_cat_counts.get(c, 0), 15)
            c_count = min(current_cat_counts.get(c, 0), 15)
            category_counts[c] = max(h_count, c_count)
        
        if genai_client:
            home_matches = rank_with_gemini(data, home_matches)
            current_matches = rank_with_gemini(data, current_matches)
            
        return jsonify({
            "home_schemes": home_matches, 
            "current_schemes": current_matches,
            "category_counts": category_counts
        })
    except Exception as e:
        return jsonify({"error": str(e), "home_schemes": [], "current_schemes": [], "category_counts": {}}), 500

@app.route('/categories', methods=['GET'])
def get_categories():
    if schemes_df.empty: return jsonify([])
    categories = set()
    for cat_str in schemes_df['schemeCategory'].dropna().unique():
        for cat in str(cat_str).split(','):
            if cat.strip(): categories.add(cat.strip())
    return jsonify(sorted(list(categories)))

@app.route('/state-stats', methods=['GET'])
def get_state_stats():
    if schemes_df.empty: return jsonify({})
    if 'state' in schemes_df.columns:
        stats = schemes_df['state'].value_counts().to_dict()
        return jsonify(stats)
    return jsonify({"Maharashtra": 150, "Kerala": 120, "Bihar": 200})

@app.route('/google-login', methods=['POST'])
def google_login():
    data = request.json
    credential = data.get('credential')
    try:
        res = requests.get(f'https://oauth2.googleapis.com/tokeninfo?id_token={credential}')
        return jsonify(res.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 401

# ──────────────────────────────────────────────
#  SAVED SCHEMES (Bookmarks)
# ──────────────────────────────────────────────
# In-memory storage for bookmarks (for demo purposes)
USER_BOOKMARKS = {}

@app.route('/api/saved-schemes/<clerk_id>', methods=['GET'])
def get_saved_schemes(clerk_id):
    scheme_ids = USER_BOOKMARKS.get(clerk_id, [])
    # Since we are using pandas, filter the dataframe by these IDs
    saved = []
    for sid in scheme_ids:
        # Find scheme by matching scheme_name to sid
        matches = schemes_df[schemes_df['scheme_name'] == sid]
        if not matches.empty:
            scheme_dict = matches.iloc[0].to_dict()
            scheme_dict['_id'] = sid
            saved.append(scheme_dict)
    return jsonify({"saved_schemes": saved})

@app.route('/api/save-scheme', methods=['POST'])
def save_scheme():
    data = request.json or {}
    clerk_id = data.get('clerkId')
    scheme_id = data.get('schemeId')
    if not clerk_id or not scheme_id:
        return jsonify({"error": "Missing clerkId or schemeId"}), 400

    if clerk_id not in USER_BOOKMARKS:
        USER_BOOKMARKS[clerk_id] = []
    if scheme_id not in USER_BOOKMARKS[clerk_id]:
        USER_BOOKMARKS[clerk_id].append(scheme_id)
        
    return jsonify({"message": "Scheme bookmarked successfully", "success": True}), 201

@app.route('/api/save-scheme', methods=['DELETE'])
def remove_scheme():
    data = request.json or {}
    clerk_id = data.get('clerkId')
    scheme_id = data.get('schemeId')
    if not clerk_id or not scheme_id:
        return jsonify({"error": "Missing clerkId or schemeId"}), 400

    if clerk_id in USER_BOOKMARKS and scheme_id in USER_BOOKMARKS[clerk_id]:
        USER_BOOKMARKS[clerk_id].remove(scheme_id)
        
    return jsonify({"message": "Scheme removed from bookmarks", "success": True}), 200

# ──────────────────────────────────────────────
#  AI ROADMAP & CHAT
# ──────────────────────────────────────────────

@app.route('/extract-roadmap', methods=['POST'])
@require_auth
def extract_roadmap():
    data = request.json
    scheme_text = data.get('application', '')
    lang = data.get('language', 'English')

    if not scheme_text or len(scheme_text) < 20:
        return jsonify({"roadmap": ["1. Visit the nearest government office", "2. Submit application form", "3. Collect acknowledgement receipt"]})

    try:
        prompt = f"Convert this government scheme application process into a detailed 4-step interactive roadmap for a common citizen. Return ONLY a JSON list of strings. Be very concise. Respond in {lang}. Raw text: {scheme_text}"
        
        if genai_client:
            response = genai_client.models.generate_content(model='gemini-2.0-flash', contents=prompt)
            text = clean_json_response(response.text)
        else:
            text = '["Check official portal", "Submit documents", "Wait for approval"]'
            
        steps = json.loads(text)
        return jsonify({"roadmap": steps[:5]})
    except Exception as e:
        print(f"Roadmap Error: {e}")
        return jsonify({"roadmap": ["1. Visit local ward office", "2. Provide ID proof", "3. Complete registration", "4. Collect acknowledgement"]})

@app.route('/calculate-match', methods=['POST'])
@require_auth
def calculate_match():
    """Calculate an eligibility score (0-100) using Gemini."""
    data = request.json
    user_profile = data.get('profile', {})
    scheme_details = data.get('scheme', {})
    lang = data.get('language', 'English')

    if not user_profile or not scheme_details:
        return jsonify({"score": 50, "reason": "Missing data"})

    try:
        prompt = f"""Compare this user profile with the government scheme eligibility.
Return ONLY valid JSON: {{"score": number, "reason": "one short sentence explanation in {lang}"}}
User Profile: {json.dumps(user_profile)}
Scheme Eligibility: {scheme_details.get('eligibility', '') or scheme_details.get('details', '')}
Score 0 if clearly ineligible, 100 if perfectly matched."""
        
        if genai_client:
            response = genai_client.models.generate_content(model='gemini-2.0-flash', contents=prompt)
            text = clean_json_response(response.text)
        else:
            text = '{"score": 85, "reason": "Match looks good"}'
            
        result = json.loads(text)
        return jsonify(result)
    except Exception as e:
        print(f"Match calculation error: {e}")
        return jsonify({"score": 85, "reason": "High likelihood based on your profile details."})

@app.route('/chat', methods=['POST'])
@require_auth
def chat_with_ai():
    data = request.json
    messages = data.get('messages', [])

    try:
        if not genai_client:
             return jsonify({"reply": "AI Chat is currently unavailable."})

        # Simple conversion of messages to Gemini format
        last_msg = messages[-1]['content']
        response = genai_client.models.generate_content(
            model='gemini-2.0-flash',
            contents=last_msg,
            config={'system_instruction': "You are 'HaqDaar AI', a helpful assistant. Use simple, empathetic language. Help users understand government schemes."}
        )
        return jsonify({"reply": response.text})
    except Exception as e:
        print(f"Chat Error: {e}")
        return jsonify({"reply": "I'm having trouble connecting right now. Please try again later."})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
