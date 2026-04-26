"""
Generate vector embeddings for all schemes in MongoDB.
Run: python backend/generate_embeddings_mongo.py
"""
import os
import time
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

from mongo import schemes_col

def generate_embeddings():
    # Get schemes without embeddings
    total = schemes_col.count_documents({"embedding": {"$exists": False}})
    print(f"Found {total} schemes needing embeddings.")

    if total == 0:
        print("All schemes already have embeddings.")
        return

    cursor = schemes_col.find({"embedding": {"$exists": False}})
    done = 0
    errors = 0

    for scheme in cursor:
        retries = 3
        while retries > 0:
            try:
                text = f"Name: {scheme.get('scheme_name','')}. Category: {scheme.get('schemeCategory','')}. Details: {scheme.get('details','')}. Eligibility: {scheme.get('eligibility','')}"

                result = genai.embed_content(
                    model="models/gemini-embedding-001",
                    content=text,
                    task_type="retrieval_document",
                    title=scheme.get("scheme_name", "")
                )

                schemes_col.update_one(
                    {"_id": scheme["_id"]},
                    {"$set": {"embedding": result["embedding"]}}
                )
                done += 1

                if done % 50 == 0:
                    print(f"  Progress: {done}/{total} embedded...")
                
                time.sleep(0.5)  # Steady pace
                break # Success
            except Exception as e:
                retries -= 1
                if retries == 0:
                    errors += 1
                    print(f"  Error on scheme {scheme.get('scheme_name','?')}: {e}")
                else:
                    print(f"  Transient error on {scheme.get('scheme_name','?')}, retrying...")
                    time.sleep(2)

    print(f"\n✅ Done! Embedded: {done}, Errors: {errors}")

if __name__ == '__main__':
    generate_embeddings()
