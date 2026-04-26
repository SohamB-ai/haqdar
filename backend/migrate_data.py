from flask import Flask
from dotenv import load_dotenv

try:
    from .database import db
    from .init_db import initialize_database
except ImportError:
    from database import db
    from init_db import initialize_database


load_dotenv()


def migrate(force_rebuild=False):
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///haqdar.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    return initialize_database(app, force_rebuild=force_rebuild)


if __name__ == '__main__':
    migrate()
