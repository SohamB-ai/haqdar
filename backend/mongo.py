"""
Mongo-style storage layer for HaqDaar.

If MongoDB is available, this module uses the configured database.
If MongoDB is unavailable, it falls back to local in-memory collections so
the app can still run against the bundled dataset during local development.
"""
from __future__ import annotations

from copy import deepcopy
from datetime import datetime
import json
import os
from pathlib import Path
import re
from types import SimpleNamespace
from uuid import uuid4

from pymongo import ASCENDING, MongoClient


MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("MONGO_DB_NAME", "haqdar")
DATASET_PATH = Path(__file__).resolve().parent.parent / "data" / "schemes.json"


class FallbackCursor(list):
    def limit(self, n):
        return FallbackCursor(self[:n])


class FallbackInsertResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class FallbackCollection:
    def __init__(self, initial_docs=None):
        self.docs = []
        for doc in initial_docs or []:
            self.insert_one(doc)

    def create_index(self, *args, **kwargs):
        return None

    def count_documents(self, filter_doc):
        return len(self._filter_docs(filter_doc))

    def find_one(self, filter_doc):
        matches = self._filter_docs(filter_doc)
        return deepcopy(matches[0]) if matches else None

    def find(self, filter_doc=None):
        return FallbackCursor(deepcopy(self._filter_docs(filter_doc or {})))

    def insert_one(self, doc):
        stored = deepcopy(doc)
        stored.setdefault("_id", str(uuid4()))
        self.docs.append(stored)
        return FallbackInsertResult(stored["_id"])

    def insert_many(self, docs):
        for doc in docs:
            self.insert_one(doc)

    def update_one(self, filter_doc, update_doc):
        for doc in self.docs:
            if self._matches(doc, filter_doc):
                for key, value in update_doc.get("$set", {}).items():
                    doc[key] = value
                return

    def delete_one(self, filter_doc):
        for idx, doc in enumerate(self.docs):
            if self._matches(doc, filter_doc):
                del self.docs[idx]
                return

    def aggregate(self, pipeline):
        if len(pipeline) == 1 and "$group" in pipeline[0]:
            group = pipeline[0]["$group"]
            if group.get("_id") == "$state":
                counts = {}
                for doc in self.docs:
                    state = doc.get("state")
                    counts[state] = counts.get(state, 0) + 1
                return [{"_id": state, "count": count} for state, count in counts.items()]
        raise NotImplementedError("Fallback aggregate only supports state grouping")

    def _filter_docs(self, filter_doc):
        return [doc for doc in self.docs if self._matches(doc, filter_doc)]

    def _matches(self, doc, filter_doc):
        if not filter_doc:
            return True

        for key, condition in filter_doc.items():
            if key == "$or":
                if not any(self._matches(doc, subfilter) for subfilter in condition):
                    return False
                continue

            value = doc.get(key)
            if isinstance(condition, dict):
                if "$regex" in condition:
                    flags = re.IGNORECASE if "i" in condition.get("$options", "") else 0
                    if not re.search(condition["$regex"], str(value or ""), flags):
                        return False
                    continue
                if "$in" in condition:
                    if value not in condition["$in"]:
                        return False
                    continue
            if value != condition:
                return False

        return True


def _load_dataset_docs():
    if not DATASET_PATH.exists():
        return []
    with DATASET_PATH.open("r", encoding="utf-8") as file:
        raw = json.load(file)
    docs = []
    for item in raw:
        docs.append({
            "_id": str(uuid4()),
            "scheme_name": item.get("scheme_name", ""),
            "state": item.get("state", "All"),
            "schemeCategory": item.get("schemeCategory", ""),
            "details": item.get("details", ""),
            "eligibility": item.get("eligibility", ""),
            "application": item.get("application", ""),
            "documents": item.get("documents", ""),
            "benefits": item.get("benefits", ""),
            "income_limit": float(item.get("income_limit", 0) or 0),
            "is_portable": bool(item.get("is_portable", False)),
            "embedding": item.get("embedding"),
        })
    return docs


def _build_fallback_db():
    return SimpleNamespace(
        users=FallbackCollection(),
        schemes=FallbackCollection(_load_dataset_docs()),
        saved_schemes=FallbackCollection(),
        chat_history=FallbackCollection(),
    )


MONGO_AVAILABLE = True
client = None
mongo_db = None

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command("ping")
    mongo_db = client[DB_NAME]
except Exception as exc:
    print(f"⚠️ MongoDB unavailable, using local fallback storage. Details: {exc}")
    MONGO_AVAILABLE = False
    fallback_db = _build_fallback_db()
    mongo_db = fallback_db


users_col = mongo_db["users"] if MONGO_AVAILABLE else mongo_db.users
schemes_col = mongo_db["schemes"] if MONGO_AVAILABLE else mongo_db.schemes
saved_schemes_col = mongo_db["saved_schemes"] if MONGO_AVAILABLE else mongo_db.saved_schemes
chat_history_col = mongo_db["chat_history"] if MONGO_AVAILABLE else mongo_db.chat_history


def ensure_indexes():
    users_col.create_index("clerkId", unique=True)
    users_col.create_index("email", unique=True, sparse=True)
    schemes_col.create_index("state")
    schemes_col.create_index("schemeCategory")
    schemes_col.create_index("is_portable")
    schemes_col.create_index([("scheme_name", ASCENDING)])
    saved_schemes_col.create_index([("clerkId", ASCENDING), ("scheme_id", ASCENDING)], unique=True)
    chat_history_col.create_index("clerkId")
    chat_history_col.create_index("created_at")
    print("✅ Storage indexes ready.")


def seed_schemes_from_dataset():
    """Populate the schemes collection from the dataset when empty."""
    if schemes_col.count_documents({}) > 0:
        return 0

    docs = _load_dataset_docs()
    if not docs:
        print(f"⚠️ Dataset not found at {DATASET_PATH}. Skipping scheme seed.")
        return 0

    schemes_col.insert_many(docs)
    print(f"✅ Seeded storage with {len(docs)} schemes from dataset.")
    return len(docs)


def create_user_doc(clerk_id, email=None, full_name=None, image_url=None):
    return {
        "_id": str(uuid4()),
        "clerkId": clerk_id,
        "email": email,
        "fullName": full_name,
        "imageUrl": image_url,
        "homeState": None,
        "currentState": None,
        "gender": None,
        "age": None,
        "occupation": None,
        "income": None,
        "category": None,
        "familySize": 1,
        "earningMembers": 1,
        "documents": [],
        "language": "en",
        "onboardingComplete": False,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "lastLogin": datetime.utcnow(),
    }


def scheme_to_dict(doc):
    safe_doc = deepcopy(doc)
    safe_doc["_id"] = str(safe_doc["_id"])
    return safe_doc
