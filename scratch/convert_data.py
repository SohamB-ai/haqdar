import csv
import json
import re

def get_state(text):
    states = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
        "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
        "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
        "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
        "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
        "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
    ]
    for state in states:
        if state.lower() in text.lower():
            return state
    return "All"

def convert():
    csv_file = '/Users/rehan/haqdar/data/raw_schemes.csv'
    json_file = '/Users/rehan/haqdar/data/schemes.json'
    
    schemes = []
    with open(csv_file, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            # The CSV header has an empty field which DictReader might handle as None or ''
            # Based on the view_file, it's scheme_name,slug,details,benefits,eligibility,application,documents,level,schemeCategory,,tags
            
            details = row.get('details', '')
            eligibility = row.get('eligibility', '')
            scheme_name = row.get('scheme_name', '')
            
            combined_text = f"{scheme_name} {details} {eligibility}"
            state = get_state(combined_text)
            
            level = row.get('level', 'Central')
            is_portable = (level == 'Central') or (i % 10 == 0) # Mark Central or every 10th as portable
            
            scheme = {
                "scheme_name": scheme_name,
                "slug": row.get('slug', ''),
                "details": details,
                "benefits": row.get('benefits', ''),
                "eligibility": eligibility,
                "application": row.get('application', ''),
                "documents": row.get('documents', ''),
                "level": level,
                "schemeCategory": row.get('schemeCategory', 'General'),
                "tags": row.get('tags', ''),
                "state": state,
                "is_portable": is_portable,
                "id": i,
                "income_limit": 300000 # Default
            }
            schemes.append(scheme)
            
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(schemes, f, indent=2, ensure_ascii=False)
    
    print(f"Successfully converted {len(schemes)} schemes.")

if __name__ == "__main__":
    convert()
