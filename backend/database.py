from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.sqlite import JSON

db = SQLAlchemy()

class Scheme(db.Model):
    __tablename__ = 'schemes'
    
    id = db.Column(db.Integer, primary_key=True)
    scheme_name = db.Column(db.String(255), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    schemeCategory = db.Column(db.String(255))
    details = db.Column(db.Text)
    eligibility = db.Column(db.Text)
    application = db.Column(db.Text)
    documents = db.Column(db.Text) # Stored as JSON string or comma-separated
    income_limit = db.Column(db.Float, default=0.0)
    is_portable = db.Column(db.Boolean, default=False)
    embedding = db.Column(JSON) # To be used for semantic search later

    def to_dict(self):
        return {
            "id": self.id,
            "scheme_name": self.scheme_name,
            "state": self.state,
            "schemeCategory": self.schemeCategory,
            "details": self.details,
            "eligibility": self.eligibility,
            "application": self.application,
            "documents": self.documents,
            "income_limit": self.income_limit,
            "is_portable": self.is_portable
        }
