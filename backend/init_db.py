import json
import os
from pathlib import Path

import pandas as pd

try:
    from .database import db, Scheme
except ImportError:
    from database import db, Scheme


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_CSV_PATH = DATA_DIR / "raw_schemes.csv"
SCHEMES_JSON_PATH = DATA_DIR / "schemes.json"

STATES_LIST = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
]


def _extract_state(text):
    if not isinstance(text, str):
        return "All"

    lowered = text.lower()
    for state in STATES_LIST:
        if state.lower() in lowered:
            return state
    return "All"


def build_schemes_json(force=False):
    if SCHEMES_JSON_PATH.exists() and not force:
        return SCHEMES_JSON_PATH

    if not RAW_CSV_PATH.exists():
        if SCHEMES_JSON_PATH.exists():
            return SCHEMES_JSON_PATH
        raise FileNotFoundError(
            f"Neither {RAW_CSV_PATH} nor {SCHEMES_JSON_PATH} is available for bootstrapping."
        )

    print("Processing raw scheme dataset...")
    df = pd.read_csv(RAW_CSV_PATH)

    details_series = df["details"] if "details" in df.columns else pd.Series([""] * len(df))
    level_series = df["level"] if "level" in df.columns else pd.Series([""] * len(df))
    income_series = (
        df["income_limit"] if "income_limit" in df.columns else pd.Series([300000] * len(df))
    )

    df["state"] = details_series.apply(_extract_state)
    df["is_portable"] = level_series.apply(
        lambda value: str(value).strip().lower() == "central"
    )
    df["income_limit"] = pd.to_numeric(income_series, errors="coerce").fillna(300000)

    if "scheme_name" not in df.columns:
        raise ValueError("raw_schemes.csv must include a 'scheme_name' column")

    # Normalize optional columns expected by the app.
    defaults = {
        "schemeCategory": "",
        "details": "",
        "eligibility": "",
        "application": "",
        "documents": "",
        "benefits": "",
        "slug": "",
        "tags": "",
    }
    for column, default in defaults.items():
        if column not in df.columns:
            df[column] = default
        df[column] = df[column].fillna(default)

    records = df.to_dict(orient="records")
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    SCHEMES_JSON_PATH.write_text(json.dumps(records, indent=2), encoding="utf-8")
    print(f"Generated {SCHEMES_JSON_PATH} with {len(records)} records.")
    return SCHEMES_JSON_PATH


def load_scheme_records(force_rebuild=False):
    json_path = build_schemes_json(force=force_rebuild)
    with json_path.open("r", encoding="utf-8") as file:
        return json.load(file)


def seed_database(app, force_rebuild=False):
    with app.app_context():
        db.create_all()

        if Scheme.query.count() > 0:
            return 0

        records = load_scheme_records(force_rebuild=force_rebuild)
        schemes_to_add = []
        for item in records:
            schemes_to_add.append(
                Scheme(
                    scheme_name=item.get("scheme_name") or "Untitled Scheme",
                    state=item.get("state") or "All",
                    schemeCategory=item.get("schemeCategory") or "",
                    details=item.get("details") or "",
                    eligibility=item.get("eligibility") or "",
                    application=item.get("application") or "",
                    documents=item.get("documents") or "",
                    income_limit=float(item.get("income_limit") or 0),
                    is_portable=bool(item.get("is_portable", False)),
                    embedding=item.get("embedding"),
                )
            )

        db.session.bulk_save_objects(schemes_to_add)
        db.session.commit()
        return len(schemes_to_add)


def initialize_database(app, force_rebuild=False):
    inserted = seed_database(app, force_rebuild=force_rebuild)
    if inserted:
        print(f"Seeded database with {inserted} schemes.")
    else:
        print("Database already populated. Skipping seed.")
    return inserted


if __name__ == "__main__":
    from flask import Flask

    flask_app = Flask(__name__)
    flask_app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///haqdar.db"
    flask_app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(flask_app)
    initialize_database(flask_app)
