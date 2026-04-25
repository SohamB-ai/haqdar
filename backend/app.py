from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import json
import os
import google.generativeai as genai
from dotenv import load_dotenv
import requests

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = Flask(__name__)
CORS(app)

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'schemes.json')

def load_data():
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        return pd.DataFrame(json.load(f))

@app.route('/schemes', methods=['POST'])
def get_schemes():
    data = request.json
    user_state = data.get('state', 'All')
    user_income = float(data.get('income', 0))
    user_category = data.get('category', 'All')
    query = data.get('query', '').lower()

    df = load_data()

    # Filter by state
    df = df[(df['state'] == 'All') | (df['state'].str.lower() == user_state.lower())]

    # Filter by category
    if user_category and user_category != 'All':
        df = df[df['schemeCategory'].str.lower().str.contains(user_category.lower())]

    # Filter by keyword (details + eligibility)
    if query:
        df = df[df['details'].str.lower().str.contains(query) | 
                df['eligibility'].str.lower().str.contains(query) |
                df['scheme_name'].str.lower().str.contains(query)]

    # Basic Eligibility Logic: Income matching
    # We prioritize schemes where user_income <= income_limit
    df['eligible'] = df['income_limit'].apply(lambda x: 1 if user_income <= x else 0)
    
    # Sort: prioritized by eligibility, then limited to top 10
    df = df.sort_values(by='eligible', ascending=False)
    
    results = df.head(10).to_dict(orient='records')
    return jsonify(results)

@app.route('/portable', methods=['POST'])
def get_portable():
    data = request.json
    old_state = data.get('old_state', '')
    new_state = data.get('new_state', '')

    df = load_data()

    portable_schemes = df[df['is_portable'] == True].head(20).to_dict(orient='records')
    new_state_schemes = df[df['state'].str.lower() == new_state.lower()].head(20).to_dict(orient='records')

    return jsonify({
        "portable_schemes": portable_schemes,
        "new_state_schemes": new_state_schemes
    })

@app.route('/scheme/<int:scheme_id>', methods=['GET'])
def get_scheme_details(scheme_id):
    df = load_data()
    scheme = df[df['id'] == scheme_id].to_dict(orient='records')
    if scheme:
        return jsonify(scheme[0])
    return jsonify({"error": "Scheme not found"}), 404

@app.route('/search', methods=['POST'])
def search_schemes():
    data = request.json
    query = data.get('query', '').lower()

    df = load_data()
    
    results = df[df['details'].str.lower().str.contains(query) | 
                df['eligibility'].str.lower().str.contains(query) |
                df['schemeCategory'].str.lower().str.contains(query) |
                df['scheme_name'].str.lower().str.contains(query)].head(15).to_dict(orient='records')
    
    return jsonify(results)

@app.route('/simplify', methods=['POST'])
def simplify_scheme():
    data = request.json
    scheme_text = data.get('text', '')
    
    if not os.getenv("GEMINI_API_KEY"):
        return jsonify({"summary": "Please provide a GEMINI_API_KEY to see AI summaries. " + (scheme_text[:150] if scheme_text else "") + "..."})

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"Summarize this Indian government scheme in 2 very simple sentences for a person with low literacy. Use extremely simple English: {scheme_text}"
        response = model.generate_content(prompt)
        return jsonify({"summary": response.text})
    except Exception as e:
        return jsonify({"summary": "Could not simplify at this moment.", "error": str(e)})

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
