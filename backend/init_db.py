import pandas as pd
import json
import os
import re

def clean_and_process():
    csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'raw_schemes.csv')
    json_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'schemes.json')
    
    if not os.path.exists(csv_path):
        print("CSV not found. skipping...")
        return

    print("Processing real dataset...")
    df = pd.read_csv(csv_path)
    
    # Keyword extraction for states
    states_list = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir"]

    def extract_state(text):
        if not isinstance(text, str): return "All"
        for s in states_list:
            if s.lower() in text.lower():
                return s
        return "All"

    df['state'] = df['details'].apply(extract_state)
    df['is_portable'] = df['level'].apply(lambda x: True if str(x).lower() == 'central' else False)
    df['id'] = range(len(df))
    
    # Fake income limit for logic (if not in dataset)
    df['income_limit'] = 300000 

    data = df.to_dict(orient='records')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    print(f"Success! {len(data)} schemes processed.")

if __name__ == "__main__":
    clean_and_process()
