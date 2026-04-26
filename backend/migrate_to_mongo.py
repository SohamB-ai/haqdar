"""
Migrate schemes.json into MongoDB 'schemes' collection.
Run once: python backend/migrate_to_mongo.py
"""
import json
import os
from dotenv import load_dotenv

load_dotenv()

try:
    from .mongo import schemes_col, ensure_indexes, seed_schemes_from_dataset
except ImportError:
    from mongo import schemes_col, ensure_indexes, seed_schemes_from_dataset

def migrate():
    ensure_indexes()
    existing = schemes_col.count_documents({})
    if existing > 0:
        print(f"MongoDB already has {existing} schemes. Skipping migration.")
        print("To force re-migration, drop the 'schemes' collection first.")
        return existing

    inserted = seed_schemes_from_dataset()
    print(f"✅ Successfully migrated {inserted} schemes to MongoDB.")
    return inserted

if __name__ == '__main__':
    migrate()
