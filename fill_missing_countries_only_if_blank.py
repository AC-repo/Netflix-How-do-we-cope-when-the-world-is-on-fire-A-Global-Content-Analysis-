import sqlite3
from imdb import IMDb
import time

# Update this to your actual DB path
DB_PATH = "/Users/ac/Documents/netflix/netflix_titles.db"

# Connect to SQLite DB
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Initialize IMDbPY API
ia = IMDb()

# Select titles with missing country data
cursor.execute("SELECT show_id, title FROM netflix_titles WHERE country IS NULL OR TRIM(country) = ''")
missing_entries = cursor.fetchall()

print(f"Found {len(missing_entries)} titles with missing countries.")

for show_id, title in missing_entries:
    try:
        results = ia.search_movie(title)
        if results:
            movie = results[0]
            ia.update(movie)
            countries = movie.get('countries')

            if countries:
                # Only take the first country
                primary_country = countries[0]
                print(f"Updating: {title} → {primary_country}")
                cursor.execute("UPDATE netflix_titles SET country = ? WHERE show_id = ?", (primary_country, show_id))
                conn.commit()
            else:
                print(f"No country found for: {title}")
        else:
            print(f"No results for: {title}")
    except Exception as e:
        print(f"Error with {title}: {e}")
    
    time.sleep(1)  # Pause to respect IMDb’s rate limits

conn.close()
print("Finished filling missing countries.")
