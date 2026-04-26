import os
import time
from flask import Flask
import google.generativeai as genai
from dotenv import load_dotenv

try:
    from .database import db, Scheme
    from .init_db import initialize_database
except ImportError:
    from database import db, Scheme
    from init_db import initialize_database

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_embeddings():
    app = Flask(__name__)
    db_path = os.path.join(os.path.dirname(__file__), 'haqdar.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    initialize_database(app)

    with app.app_context():
        # Get schemes that don't have embeddings yet
        schemes = Scheme.query.filter(Scheme.embedding == None).all()
        print(f"Found {len(schemes)} schemes needing embeddings.")
        
        batch_size = 50
        for i in range(0, len(schemes), batch_size):
            batch = schemes[i:i+batch_size]
            print(f"Processing batch {i//batch_size + 1}...")
            
            for scheme in batch:
                try:
                    # Create a rich text for embedding
                    text = f"Name: {scheme.scheme_name}. Category: {scheme.schemeCategory}. Details: {scheme.details}. Eligibility: {scheme.eligibility}"
                    
                    result = genai.embed_content(
                        model="models/gemini-embedding-001",
                        content=text,
                        task_type="retrieval_document",
                        title=scheme.scheme_name
                    )
                    
                    scheme.embedding = result['embedding']
                except Exception as e:
                    print(f"Error embedding scheme {scheme.id}: {e}")
                    time.sleep(2) # Backoff
            
            db.session.commit()
            print(f"Committed batch {i//batch_size + 1}")
            time.sleep(1) # Rate limit protection

if __name__ == '__main__':
    generate_embeddings()
