import pandas as pd

try:
    df = pd.read_csv('data/raw_schemes.csv', nrows=1, on_bad_lines='skip')
    print("Columns:", df.columns.tolist())
except Exception as e:
    print("Error:", e)
