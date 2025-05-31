DB_PATH = "/Users/ac/Documents/netflix/netflix_titles.db"
API_KEY = "c798360b"  # Replace with your real API key
import sqlite3
import requests
import time

# CONFIG
DB_PATH = "netflix_titles.db"  # your actual .db file path
API_KEY = "your_omdb_api_key_here"
OMDB_API_URL = "http://www.omdbapi.com/"

# Connect to the SQLite DB
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Get rows with NULL country
cursor.execute("SELECT show_id, title FROM netflix_titles WHERE country IS NULL OR TRIM(country) = ''")
rows = cursor.fetchall()

print(f"Found {len(rows)} titles missing country data.\n")

def get_country_from_omdb(title):
    params = {
        't': title,
        'apikey': API_KEY
    }
    try:
        response = requests.get(OMDB_API_URL, params=params)
        data = response.json()
        if data.get('Response') == 'True':
            return data.get('Country')
        return None
    except Exception as e:
        print(f"Error for '{title}': {e}")
        return None

for show_id, title in rows:
    print(f"Searching for '{title}'...")
    country = get_country_from_omdb(title)
    if country:
        cursor.execute("UPDATE netflix_titles SET country = ? WHERE show_id = ?", (country, show_id))
        print(f"✅ Updated '{title}' with country: {country}")
    else:
        print(f"❌ No result for '{title}'")
    time.sleep(1)  # Avoid API rate limits

# Commit changes and close connection
conn.commit()
conn.close()
print("\nAll done! ✅")
