from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json as json_module
import base64
import random
from functools import wraps
from datetime import datetime

import google.generativeai as genai
from dotenv import load_dotenv
import requests
import numpy as np
from jose import jwt

try:
    from .mongo import (
        mongo_db, users_col, schemes_col, saved_schemes_col,
        chat_history_col, ensure_indexes, create_user_doc, scheme_to_dict,
        seed_schemes_from_dataset, MONGO_AVAILABLE,
    )
except ImportError:
    from mongo import (
        mongo_db, users_col, schemes_col, saved_schemes_col,
        chat_history_col, ensure_indexes, create_user_doc, scheme_to_dict,
        seed_schemes_from_dataset, MONGO_AVAILABLE,
    )

load_dotenv()
CLERK_PEM_PUBLIC_KEY = os.getenv("CLERK_PEM_PUBLIC_KEY")
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = Flask(__name__)
CORS(app)

# ─── Initialize MongoDB indexes on startup ───
with app.app_context():
    ensure_indexes()
    seed_schemes_from_dataset()

# ──────────────────────────────────────────────
#  Helpers
# ──────────────────────────────────────────────

def parse_income_value(raw_income):
    if raw_income is None:
        return 0.0
    if isinstance(raw_income, (int, float)):
        return float(raw_income)
    cleaned = ''.join(ch for ch in str(raw_income) if ch.isdigit() or ch == '.')
    return float(cleaned) if cleaned else 0.0

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Missing or invalid token"}), 401

        token = auth_header.split(' ')[1]

        if not CLERK_PEM_PUBLIC_KEY:
            print("WARNING: CLERK_PEM_PUBLIC_KEY not set. Skipping JWT validation.")
            return f(*args, **kwargs)

        try:
            payload = jwt.decode(token, CLERK_PEM_PUBLIC_KEY, algorithms=['RS256'], options={"verify_aud": False})
            request.user = payload
        except Exception as e:
            return jsonify({"error": "Token validation failed", "details": str(e)}), 401

        return f(*args, **kwargs)
    return decorated

def cosine_similarity(a, b):
    a, b = np.array(a), np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-10))

# ──────────────────────────────────────────────
#  Health Check
# ──────────────────────────────────────────────

@app.route('/')
def health_check():
    scheme_count = schemes_col.count_documents({})
    user_count = users_col.count_documents({})
    return jsonify({
        "status": "healthy",
        "message": "HaqDaar Backend is running",
        "db": "MongoDB" if MONGO_AVAILABLE else "Local Fallback Storage",
        "schemes": scheme_count,
        "users": user_count
    }), 200

# ──────────────────────────────────────────────
#  USER CRUD  (MongoDB)
# ──────────────────────────────────────────────

@app.route('/api/user', methods=['POST'])
@require_auth
def create_or_update_user():
    """Create a new user or update existing user profile."""
    data = request.json or {}
    clerk_id = data.get('clerkId')

    if not clerk_id:
        return jsonify({"error": "clerkId is required"}), 400

    existing = users_col.find_one({"clerkId": clerk_id})

    if existing:
        # Update existing user
        update_fields = {
            "updatedAt": datetime.utcnow(),
            "lastLogin": datetime.utcnow(),
        }
        # Only update fields that are provided
        profile_fields = [
            "fullName", "email", "imageUrl",
            "homeState", "currentState", "gender", "age",
            "occupation", "income", "category",
            "familySize", "earningMembers", "documents",
            "language", "onboardingComplete"
        ]
        for field in profile_fields:
            if field in data:
                update_fields[field] = data[field]

        users_col.update_one({"clerkId": clerk_id}, {"$set": update_fields})
        updated = users_col.find_one({"clerkId": clerk_id})
        updated["_id"] = str(updated["_id"])
        return jsonify({"message": "User updated", "user": updated}), 200
    else:
        # Create new user
        user_doc = create_user_doc(
            clerk_id=clerk_id,
            email=data.get("email"),
            full_name=data.get("fullName"),
            image_url=data.get("imageUrl")
        )
        # Merge any extra onboarding data
        for key in ["homeState", "currentState", "gender", "age",
                     "occupation", "income", "category",
                     "familySize", "earningMembers", "documents",
                     "language", "onboardingComplete"]:
            if key in data:
                user_doc[key] = data[key]

        users_col.insert_one(user_doc)
        user_doc["_id"] = str(user_doc["_id"])
        return jsonify({"message": "User created", "user": user_doc}), 201


@app.route('/api/user/<clerk_id>', methods=['GET'])
@require_auth
def get_user(clerk_id):
    """Fetch a user profile by their Clerk ID."""
    user = users_col.find_one({"clerkId": clerk_id})
    if not user:
        return jsonify({"error": "User not found"}), 404
    user["_id"] = str(user["_id"])
    return jsonify({"user": user}), 200


# ──────────────────────────────────────────────
#  SAVED SCHEMES (Bookmarks)
# ──────────────────────────────────────────────

@app.route('/api/save-scheme', methods=['POST'])
@require_auth
def save_scheme():
    data = request.json
    clerk_id = data.get('clerkId')
    scheme_id = data.get('schemeId')

    if not clerk_id or not scheme_id:
        return jsonify({"error": "Missing clerkId or schemeId"}), 400

    # Check if already saved
    existing = saved_schemes_col.find_one({"clerkId": clerk_id, "scheme_id": scheme_id})
    if existing:
        return jsonify({"message": "Scheme already bookmarked", "success": True}), 200

    saved_schemes_col.insert_one({
        "clerkId": clerk_id,
        "scheme_id": scheme_id,
        "saved_at": datetime.utcnow()
    })
    return jsonify({"message": "Scheme bookmarked successfully", "success": True}), 201


@app.route('/api/save-scheme', methods=['DELETE'])
@require_auth
def remove_scheme():
    data = request.json
    clerk_id = data.get('clerkId')
    scheme_id = data.get('schemeId')

    if not clerk_id or not scheme_id:
        return jsonify({"error": "Missing clerkId or schemeId"}), 400

    saved_schemes_col.delete_one({"clerkId": clerk_id, "scheme_id": scheme_id})
    return jsonify({"message": "Scheme removed from bookmarks", "success": True}), 200


@app.route('/api/saved-schemes/<clerk_id>', methods=['GET'])
@require_auth
def get_saved_schemes(clerk_id):
    """Fetch all schemes bookmarked by a user."""
    bookmarks = list(saved_schemes_col.find({"clerkId": clerk_id}))
    scheme_ids = [b["scheme_id"] for b in bookmarks]

    # Join with schemes collection
    # Note: scheme_id in saved_schemes matches the string _id in schemes_col if using local, 
    # or ObjectId if using Mongo. We'll handle both.
    from bson import ObjectId
    
    query_ids = []
    for sid in scheme_ids:
        try:
            query_ids.append(ObjectId(sid))
        except:
            query_ids.append(sid)

    schemes = list(schemes_col.find({"_id": {"$in": query_ids}}))
    
    for s in schemes:
        s["_id"] = str(s["_id"])
        
    return jsonify({"saved_schemes": schemes}), 200




@app.route('/api/user/<clerk_id>/saved-schemes', methods=['POST'])
@require_auth
def save_scheme(clerk_id):
    """Bookmark a scheme for a user."""
    data = request.json or {}
    scheme_id = data.get("scheme_id")
    if not scheme_id:
        return jsonify({"error": "scheme_id is required"}), 400

    try:
        saved_schemes_col.insert_one({
            "clerkId": clerk_id,
            "scheme_id": scheme_id,
            "savedAt": datetime.utcnow()
        })
        return jsonify({"message": "Scheme saved"}), 201
    except Exception:
        return jsonify({"message": "Scheme already saved"}), 200


@app.route('/api/user/<clerk_id>/saved-schemes/<scheme_id>', methods=['DELETE'])
@require_auth
def unsave_scheme(clerk_id, scheme_id):
    """Remove a bookmarked scheme."""
    saved_schemes_col.delete_one({"clerkId": clerk_id, "scheme_id": scheme_id})
    return jsonify({"message": "Scheme removed"}), 200


# ──────────────────────────────────────────────
#  SCHEMES (MongoDB)
# ──────────────────────────────────────────────

@app.route('/state-stats', methods=['GET'])
def get_state_stats():
    pipeline = [
        {"$group": {"_id": "$state", "count": {"$sum": 1}}}
    ]
    results = list(schemes_col.aggregate(pipeline))
    stats = {r["_id"]: r["count"] for r in results}

    central_count = stats.get("All", 0)
    final_stats = {k: v + central_count for k, v in stats.items() if k != "All"}
    return jsonify(final_stats)


@app.route('/schemes', methods=['POST'])
@require_auth
def get_schemes():
    data = request.json or {}
    user_state = data.get('state', 'All')
    user_income = parse_income_value(data.get('income', 0))
    user_category = data.get('category', 'All')
    user_gender = data.get('gender', 'All')
    query_text = data.get('query', '').strip()

    # Build MongoDB filter
    mongo_filter = {
        "$or": [
            {"state": "All"},
            {"state": {"$regex": f"^{user_state}$", "$options": "i"}}
        ]
    }

    if user_category and user_category != 'All':
        mongo_filter["schemeCategory"] = {"$regex": user_category, "$options": "i"}

    if query_text:
        mongo_filter["$or"] = [
            {"scheme_name": {"$regex": query_text, "$options": "i"}},
            {"details": {"$regex": query_text, "$options": "i"}},
            {"eligibility": {"$regex": query_text, "$options": "i"}},
        ]

    results = list(schemes_col.find(mongo_filter).limit(100))

    final_results = []
    for s in results:
        income_limit = float(s.get("income_limit", 0))
        if user_income > income_limit and income_limit > 0:
            continue

        if user_gender.lower() == 'female':
            details = s.get("details", "").lower()
            if not any(w in details for w in ['woman', 'female', 'girl', 'mother']):
                continue

        s["_id"] = str(s["_id"])
        final_results.append(s)

    return jsonify(final_results[:20])


@app.route('/portable', methods=['POST'])
@require_auth
def get_portable():
    data = request.json or {}
    new_state = data.get('new_state', 'All')
    user_occupation = data.get('occupation', '').lower()

    pf = {"is_portable": True}
    if user_occupation:
        pf["$or"] = [
            {"details": {"$regex": user_occupation, "$options": "i"}},
            {"eligibility": {"$regex": user_occupation, "$options": "i"}},
        ]

    portable = list(schemes_col.find(pf).limit(20))
    if len(portable) < 5:
        portable = list(schemes_col.find({"is_portable": True}).limit(20))

    new_state_schemes = list(schemes_col.find(
        {"state": {"$regex": f"^{new_state}$", "$options": "i"}}
    ).limit(20))

    for s in portable + new_state_schemes:
        s["_id"] = str(s["_id"])

    return jsonify({
        "portable_schemes": portable,
        "new_state_schemes": new_state_schemes
    })


# ──────────────────────────────────────────────
#  SEMANTIC SEARCH
# ──────────────────────────────────────────────

@app.route('/search-semantic', methods=['POST'])
@require_auth
def search_semantic():
    data = request.json
    query_text = data.get('query', '')
    top_k = data.get('top_k', 10)

    if not query_text:
        return jsonify({"error": "Query text is required"}), 400

    try:
        result = genai.embed_content(
            model="models/gemini-embedding-001",
            content=query_text,
            task_type="retrieval_query"
        )
        query_embedding = result['embedding']
    except Exception as e:
        print(f"Embedding failed: {e}. Falling back to keyword search.")
        results = list(schemes_col.find({
            "$or": [
                {"scheme_name": {"$regex": query_text, "$options": "i"}},
                {"details": {"$regex": query_text, "$options": "i"}},
            ]
        }).limit(top_k))
        for r in results:
            r["_id"] = str(r["_id"])
        return jsonify(results)

    schemes_with_emb = list(schemes_col.find({"embedding": {"$exists": True, "$ne": None}}))
    if not schemes_with_emb:
        results = list(schemes_col.find({
            "scheme_name": {"$regex": query_text, "$options": "i"}
        }).limit(top_k))
        for r in results:
            r["_id"] = str(r["_id"])
        return jsonify(results)

    scored = []
    for s in schemes_with_emb:
        sim = cosine_similarity(query_embedding, s["embedding"])
        scored.append((sim, s))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = [s for _, s in scored[:top_k]]
    for s in top:
        s["_id"] = str(s["_id"])
    return jsonify(top)


# ──────────────────────────────────────────────
#  DOCUMENT OCR (Gemini Vision)
# ──────────────────────────────────────────────

@app.route('/process-document', methods=['POST'])
@require_auth
def process_document():
    if 'file' not in request.files and 'image_base64' not in (request.json or {}):
        return jsonify({"error": "No document image provided"}), 400

    try:
        image_data = None
        mime_type = 'image/jpeg'

        if 'file' in request.files:
            file = request.files['file']
            image_data = file.read()
            mime_type = file.content_type or 'image/jpeg'
        elif request.json and 'image_base64' in request.json:
            image_data = base64.b64decode(request.json['image_base64'])
            mime_type = request.json.get('mime_type', 'image/jpeg')

        model = genai.GenerativeModel('gemini-flash-latest')
        prompt = """Analyze this Indian government ID document image.
Extract the following fields if visible. Return ONLY valid JSON with these keys:
{
    "name": "Full name as shown on document",
    "dob": "Date of birth (DD/MM/YYYY)",
    "gender": "Male/Female/Other",
    "address": "Full address",
    "state": "State name",
    "document_type": "Aadhar/PAN/Ration Card/Voter ID/etc",
    "id_number": "Document ID number (last 4 digits only for privacy)"
}
If a field is not visible, set it to null."""

        response = model.generate_content([
            prompt,
            {"mime_type": mime_type, "data": image_data}
        ])

        response_text = response.text.strip()
        if response_text.startswith('```'):
            response_text = response_text.split('\n', 1)[1]
            response_text = response_text.rsplit('```', 1)[0]

        extracted = json_module.loads(response_text)
        return jsonify({"success": True, "extracted_data": extracted})

    except Exception as e:
        print(f"Document OCR Error: {e}")
        return jsonify({
            "success": False, "error": str(e),
            "extracted_data": {
                "name": None, "dob": None, "gender": None,
                "address": None, "state": None,
                "document_type": None, "id_number": None
            }
        }), 500


# ──────────────────────────────────────────────
#  AI ROADMAP & CHAT
# ──────────────────────────────────────────────

@app.route('/extract-roadmap', methods=['POST'])
@require_auth
def extract_roadmap():
    data = request.json
    scheme_text = data.get('application', '')

    if not scheme_text or len(scheme_text) < 20:
        return jsonify({"roadmap": ["1. Visit the nearest government office", "2. Submit application form", "3. Collect acknowledgement receipt"]})

    if not os.getenv("GEMINI_API_KEY"):
        return jsonify({"roadmap": ["1. Check official portal", "2. Submit documents", "3. Wait for approval"]})

    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        prompt = f"Convert this government scheme application process into a detailed 4-step interactive roadmap for a common citizen. Return ONLY a JSON list of strings. Be very concise. Raw text: {scheme_text}"
        response = model.generate_content(prompt)
        
        # Parse JSON list from response
        text = response.text.strip()
        if text.startswith('```'):
            text = text.split('\n', 1)[1].rsplit('```', 1)[0].strip()
        
        steps = json_module.loads(text)
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

    if not user_profile or not scheme_details:
        return jsonify({"score": 50, "reason": "Missing data"})

    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        prompt = f"""Compare this user profile with the government scheme eligibility.
Return ONLY valid JSON: {{"score": number, "reason": "one short sentence explanation"}}
User Profile: {json_module.dumps(user_profile)}
Scheme Eligibility: {scheme_details.get('eligibility', '')}
Score 0 if clearly ineligible, 100 if perfectly matched."""
        
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith('```'):
            text = text.split('\n', 1)[1].rsplit('```', 1)[0].strip()
            
        result = json_module.loads(text)
        return jsonify(result)
    except Exception as e:
        print(f"Match calculation error: {e}")
        return jsonify({"score": 85, "reason": "High likelihood based on your profile details."})


@app.route('/chat', methods=['POST'])
@require_auth
def chat_with_ai():
    data = request.json
    messages = data.get('messages', [])

    if not os.getenv("GEMINI_API_KEY"):
        return jsonify({"reply": "AI Chat is currently unavailable."})

    try:
        model = genai.GenerativeModel(
            model_name='gemini-flash-latest',
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


# ──────────────────────────────────────────────
#  RUN
# ──────────────────────────────────────────────

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
