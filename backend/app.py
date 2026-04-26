from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import json
import os
import google.generativeai as genai
from dotenv import load_dotenv
import requests
import random

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = Flask(__name__)
CORS(app)

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'schemes.json')

@app.route('/')
def health_check():
    return jsonify({"status": "healthy", "message": "HaqDaar Backend is running"}), 200

def load_data():
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        return pd.DataFrame(json.load(f))

@app.route('/state-stats', methods=['GET'])
def get_state_stats():
    df = load_data()
    # Count schemes per state
    stats = df['state'].value_counts().to_dict()
    # Include 'All' (Central) schemes for every state
    central_count = stats.get('All', 0)
    final_stats = {k: v + central_count for k, v in stats.items() if k != 'All'}
    return jsonify(final_stats)

@app.route('/schemes', methods=['POST'])
def get_schemes():
    data = request.json
    user_state = data.get('state', 'All')
    user_income = float(data.get('income', 0))
    user_category = data.get('category', 'All')
    user_gender = data.get('gender', 'All')
    user_occupation = data.get('occupation', '')
    query = data.get('query', '').lower()

    df = load_data()

    # 1. State Filter
    df = df[(df['state'] == 'All') | (df['state'].str.lower() == user_state.lower())]

    # 2. Category Filter
    if user_category and user_category != 'All':
        df = df[df['schemeCategory'].str.lower().str.contains(user_category.lower())]

    # 3. Income Filter
    df['income_match'] = df['income_limit'].apply(lambda x: 1 if user_income <= x else 0)

    # 4. Gender Filter (Heuristic)
    if user_gender.lower() == 'female':
        # Prioritize schemes for women
        df['gender_match'] = df['details'].str.lower().str.contains('woman|female|girl|mother').astype(int)
    else:
        df['gender_match'] = 1

    # 5. Occupation Filter
    if user_occupation:
        df['occ_match'] = df['details'].str.lower().str.contains(user_occupation.lower()).astype(int)
    else:
        df['occ_match'] = 0

    # 6. Search Query
    if query:
        df = df[df['details'].str.lower().str.contains(query) | 
                df['eligibility'].str.lower().str.contains(query) |
                df['scheme_name'].str.lower().str.contains(query)]

    # Scoring for "Welfare Match"
    df['score'] = (df['income_match'] * 40) + (df['gender_match'] * 30) + (df['occ_match'] * 30)
    
    # Sort and limit
    df = df.sort_values(by='score', ascending=False)
    
    results = df.head(20).to_dict(orient='records')
    return jsonify(results)

@app.route('/portable', methods=['POST'])
def get_portable():
    data = request.json
    old_state = data.get('old_state', 'All')
    new_state = data.get('new_state', 'All')
    user_occupation = data.get('occupation', '').lower()

    df = load_data()

    # Find portable schemes that match occupation or category
    portable_df = df[df['is_portable'] == True]
    
    if user_occupation:
        portable_df = portable_df[portable_df['details'].str.lower().str.contains(user_occupation) | 
                                  portable_df['eligibility'].str.lower().str.contains(user_occupation)]

    # If too few matches, just get top portable schemes
    if len(portable_df) < 5:
        portable_df = df[df['is_portable'] == True].head(20)

    portable_results = portable_df.head(20).to_dict(orient='records')
    
    # Also return state-specific schemes for the new state
    new_state_df = df[df['state'].str.lower() == new_state.lower()]
    new_state_results = new_state_df.head(20).to_dict(orient='records')

    return jsonify({
        "portable_schemes": portable_results,
        "new_state_schemes": new_state_results
    })

@app.route('/extract-roadmap', methods=['POST'])
def extract_roadmap():
    data = request.json
    scheme_text = data.get('application', '')
    
    if not scheme_text or len(scheme_text) < 20:
        return jsonify({"roadmap": ["1. Visit the nearest government office", "2. Submit application form", "3. Collect acknowledgement receipt"]})

    if not os.getenv("GEMINI_API_KEY"):
         return jsonify({"roadmap": ["1. Check official portal", "2. Submit documents", "3. Wait for approval"]})

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"Convert this government scheme application process into a simple 3-step numbered list for a common citizen. Be very concise. Raw text: {scheme_text}"
        response = model.generate_content(prompt)
        
        # Clean up response to get a list
        steps = [s.strip() for s in response.text.split('\n') if s.strip() and (s[0].isdigit() or s.startswith('-'))]
        return jsonify({"roadmap": steps[:3]})
    except Exception as e:
        print(f"Roadmap Error: {e}")
        return jsonify({"roadmap": ["1. Visit local ward office", "2. Provide ID proof", "3. Complete registration"]})

@app.route('/chat', methods=['POST'])
def chat_with_ai():
    data = request.json
    messages = data.get('messages', [])
    
    if not os.getenv("GEMINI_API_KEY"):
        return jsonify({"reply": "AI Chat is currently unavailable."})

    try:
        model = genai.GenerativeModel(
            model_name='gemini-1.5-flash',
            system_instruction="You are 'HaqDaar AI', a helpful assistant. Use simple, empathetic English. Help users understand government schemes."
        )
        history = []
        for msg in messages[:-1]:
            role = "user" if msg['role'] == 'user' else "model"
            history.append({"role": role, "parts": [msg['content']]})
        
        chat = model.start_chat(history=history)
        user_input = messages[-1]['content']
        response = chat.send_message(user_input)
        
        return jsonify({"reply": response.text})
    except Exception as e:
        print(f"Chat Error: {e}")
        mock_replies = [
            "I'm here to help! Although my AI brain is currently disconnected, I can tell you that HaqDaar is designed to help you find government schemes.",
            "That's a great question. Once my AI services are back online, I'll be able to give you a detailed answer.",
            "Namaste! I'm HaqDaar AI. I'm currently in 'offline' mode, but I can still chat with you!"
        ]
        return jsonify({"reply": random.choice(mock_replies), "error": str(e)})

@app.route('/google-login', methods=['POST'])
def google_login():
    data = request.json
    credential = data.get('credential')
    access_token = data.get('token')
    
    user_info = None

    try:
        if credential:
            # Verify ID Token (JWT)
            res = requests.get(f'https://oauth2.googleapis.com/tokeninfo?id_token={credential}')
            user_info = res.json()
        elif access_token:
            # Get user info using Access Token
            res = requests.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {access_token}'}
            )
            user_info = res.json()
        
        if not user_info or 'error' in user_info:
            return jsonify({"error": "Invalid token or credential", "details": user_info}), 401

        return jsonify({
            "message": "Login successful",
            "user": {
                "email": user_info.get('email'),
                "name": user_info.get('name'),
                "picture": user_info.get('picture')
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
