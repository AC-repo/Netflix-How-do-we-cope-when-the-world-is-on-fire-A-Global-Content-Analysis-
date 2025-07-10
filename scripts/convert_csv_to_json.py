import pandas as pd
import json
import os

# Read the CSV file
df = pd.read_csv('netflix_titles.csv')

# Clean up country data
df['country'] = df['country'].fillna('')

# Convert to JSON
data = df.to_dict('records')

# Create data directory if it doesn't exist
os.makedirs('data', exist_ok=True)

# Save to JSON file
with open('data/netflix_titles.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Conversion complete! Data saved to data/netflix_titles.json") 