import os
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import json
import traceback
import sys

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

load_dotenv()

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
    schemes_df = pd.read_csv(CSV_PATH)
    schemes_df = schemes_df.fillna('')
    print(f"[OK] Loaded {len(schemes_df)} schemes from CSV")
    print(f"     Columns: {list(schemes_df.columns)}")
except Exception as e:
    print(f"[ERROR] Error loading CSV: {e}")


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
            # New google.genai SDK
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
    
    # Filter by Level (Central or matching State)
    central_mask = df['level'].str.contains('Central', case=False, na=False)
    
    state_mask = pd.Series(False, index=df.index)
    if state and state != 'All':
        state_mask = (
            df['level'].str.contains('State', case=False, na=False)
        ) & (
            df['details'].str.contains(state, case=False, na=False) | 
            df['scheme_name'].str.contains(state, case=False, na=False) |
            df['eligibility'].str.contains(state, case=False, na=False)
        )
    
    df = df[central_mask | state_mask]
    
    # Filter by Category if specified
    if category and category != 'All':
        cat_mask = df['schemeCategory'].str.contains(category, case=False, na=False)
        if cat_mask.any():
            df = df[cat_mask]
    
    # Score-based ranking
    def calculate_score(row):
        score = 0
        text = (
            str(row.get('scheme_name', '')) + " " + 
            str(row.get('details', '')) + " " + 
            str(row.get('eligibility', '')) + " " +
            str(row.get('benefits', ''))
        ).lower()
        
        # Occupation match
        if occupation:
            occ_lower = str(occupation).lower()
            occ_keywords = occ_lower.split()
            for kw in occ_keywords:
                if len(kw) > 2 and kw in text:
                    score += 8
        
        # Gender match
        if gender:
            g = str(gender).lower()
            if g in text:
                score += 5
            if g == 'female' and ('women' in text or 'mahila' in text or 'girl' in text):
                score += 8
            if g == 'male' and ('men' in text or 'male' in text):
                score += 3
        
        # State-specific bonus
        if state and state != 'All' and state.lower() in text:
            score += 5
        
        # Bonus for having benefits/eligibility info
        if str(row.get('benefits', '')).strip():
            score += 2
        if str(row.get('eligibility', '')).strip():
            score += 1
            
        return score

    df = df.copy()
    df['score'] = df.apply(calculate_score, axis=1)
    df = df.sort_values(by='score', ascending=False)
    
    results = df.head(limit).to_dict('records')
    
    # Clean up the score field
    for r in results:
        r.pop('score', None)
    
    return results


def rank_with_gemini(user_profile, schemes):
    """Use Gemini to intelligently rank schemes for user relevance."""
    if genai_client is None or not schemes:
        return schemes
    
    # Prepare compact scheme data for Gemini
    schemes_text = ""
    max_schemes = min(len(schemes), 10)
    for i in range(max_schemes):
        s = schemes[i]
        schemes_text += (
            f"{i}. {s.get('scheme_name', 'N/A')}\n"
            f"   Category: {s.get('schemeCategory', 'N/A')}\n"
            f"   Level: {s.get('level', 'N/A')}\n"
            f"   Eligibility: {str(s.get('eligibility', ''))[:200]}\n"
            f"   Details: {str(s.get('details', ''))[:200]}\n\n"
        )
    
    prompt = f"""You are an expert on Indian government welfare schemes.

User Profile:
- Home State: {user_profile.get('homeState', 'Not specified')}
- Current State: {user_profile.get('currentState', 'Not specified')}
- Occupation: {user_profile.get('occupation', 'Not specified')}
- Gender: {user_profile.get('gender', 'Not specified')}
- Category: {user_profile.get('category', 'Not specified')}
- Income: {user_profile.get('income', 'Not specified')}

Below are {max_schemes} government welfare schemes. Rank them by relevance to this user.
Consider: occupation match, gender eligibility, income brackets, state applicability, and category reservation benefits.

Return ONLY a JSON array of indices like [0, 3, 1, 2, ...] in order of most relevant to least relevant. No explanation.

Schemes:
{schemes_text}"""

    try:
        text = call_gemini(prompt)
        if text and '[' in text and ']' in text:
            start = text.find('[')
            end = text.rfind(']') + 1
            indices = json.loads(text[start:end])
            
            ranked = []
            seen = set()
            for i in indices:
                if isinstance(i, int) and 0 <= i < len(schemes) and i not in seen:
                    ranked.append(schemes[i])
                    seen.add(i)
            
            # Add any remaining
            for i in range(len(schemes)):
                if i not in seen:
                    ranked.append(schemes[i])
            
            return ranked
    except Exception as e:
        print(f"[WARN] Gemini ranking error: {e}")
    
    return schemes


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "ok",
        "schemes_loaded": len(schemes_df),
        "gemini_available": genai_client is not None,
        "columns": list(schemes_df.columns) if not schemes_df.empty else []
    })


@app.route('/compare', methods=['POST'])
def compare_schemes():
    """Compare welfare schemes between home and current state."""
    try:
        data = request.json or {}
        home_state = data.get('homeState', 'All')
        current_state = data.get('currentState', 'All')
        occupation = data.get('occupation', '')
        gender = data.get('gender', '')
        category = data.get('category', 'All')
        
        print(f"[COMPARE] Home={home_state}, Current={current_state}, Occ={occupation}, Gender={gender}, Cat={category}")
        
        # Get matches for Home State
        home_matches = get_matches(home_state, occupation, gender, category)
        
        # Get matches for Current State
        current_matches = get_matches(current_state, occupation, gender, category)
        
        print(f"  Found {len(home_matches)} home matches, {len(current_matches)} current matches")
        
        # Use Gemini to rank if available
        if genai_client is not None:
            try:
                home_matches = rank_with_gemini(data, home_matches)
                current_matches = rank_with_gemini(data, current_matches)
                print("  [OK] Gemini ranking applied")
            except Exception as e:
                print(f"  [WARN] Gemini ranking skipped: {e}")
        
        return jsonify({
            "home_schemes": home_matches,
            "current_schemes": current_matches
        })
    except Exception as e:
        print(f"[ERROR] in /compare: {e}")
        traceback.print_exc()
        return jsonify({
            "error": str(e),
            "home_schemes": [],
            "current_schemes": []
        }), 500


@app.route('/schemes', methods=['GET'])
def get_all_schemes():
    """Return a sample of all schemes."""
    try:
        limit = int(request.args.get('limit', 50))
        return jsonify(schemes_df.head(limit).to_dict('records'))
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/categories', methods=['GET'])
def get_categories():
    """Return unique scheme categories."""
    if schemes_df.empty:
        return jsonify([])
    
    categories = set()
    for cat_str in schemes_df['schemeCategory'].dropna().unique():
        for cat in str(cat_str).split(','):
            cat = cat.strip()
            if cat:
                categories.add(cat)
    
    return jsonify(sorted(list(categories)))


@app.route('/chat', methods=['POST'])
def chat():
    """AI-powered chat about welfare schemes."""
    if genai_client is None:
        return jsonify({"reply": "AI assistant is not available. Please check the API key configuration."}), 503
    
    try:
        data = request.json or {}
        message = data.get('message', '')
        user_profile = data.get('userProfile', {})
        
        # Build compact context
        context_lines = []
        for _, row in schemes_df.head(50).iterrows():
            name = str(row.get('scheme_name', ''))
            level = str(row.get('level', ''))
            category = str(row.get('schemeCategory', ''))
            context_lines.append(f"- {name} ({level}, {category})")
        context = "\n".join(context_lines)
        
        prompt = f"""You are HaqDaar AI, an expert assistant on Indian government welfare schemes.

User Profile: {json.dumps(user_profile) if user_profile else "Not provided"}

Some available schemes:
{context[:3000]}

User Question: {message}

Provide a helpful, concise response about relevant government welfare schemes.
Keep responses under 300 words. Be warm and helpful."""

        reply = call_gemini(prompt)
        if reply:
            return jsonify({"reply": reply})
        else:
            return jsonify({"reply": "Sorry, I could not process your question right now."}), 500
    except Exception as e:
        print(f"[ERROR] Chat: {e}")
        return jsonify({"reply": f"Sorry, I encountered an error: {str(e)}"}), 500


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))
    print(f"\n=== Starting HaqDaar Backend on port {port} ===")
    print(f"    Schemes loaded: {len(schemes_df)}")
    print(f"    Gemini AI: {'Available' if genai_client else 'Not configured'}")
    if not schemes_df.empty:
        print(f"    CSV columns: {list(schemes_df.columns)}")
    print()
    app.run(host='0.0.0.0', port=port, debug=True)
