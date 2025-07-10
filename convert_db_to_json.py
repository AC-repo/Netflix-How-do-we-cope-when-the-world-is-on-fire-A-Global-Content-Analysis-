import sqlite3
import json

# Connect to the database
conn = sqlite3.connect('netflix_titles.db')
cursor = conn.cursor()

# Get all records
cursor.execute('SELECT * FROM netflix_titles')
columns = [description[0] for description in cursor.description]
rows = cursor.fetchall()

# Convert to list of dictionaries
data = []
for row in rows:
    data.append(dict(zip(columns, row)))

# Write to JSON file
with open('data/netflix_titles.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Successfully converted database to JSON!")
conn.close() 