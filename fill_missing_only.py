import sqlite3
from imdb import IMDb

DB_PATH = "netflix_titles.db"

conn = sqlite3.connect(DB_PATH, timeout=15)
cursor = conn.cursor()
ia = IMDb()

cursor.execute("SELECT show_id, title FROM netflix_titles WHERE country IS NULL OR TRIM(country) = ''")
rows = cursor.fetchall()

for show_id, title in rows:
    try:
        results = ia.search_movie(title)
        if results:
            movie = ia.get_movie(results[0].movieID)
            countries = movie.get('countries')
            if countries:
                country = countries[0]
                cursor.execute("UPDATE netflix_titles SET country = ? WHERE show_id = ?", (country, show_id))
                print(f"Updated: {title} → {country}")
    except Exception as e:
        print(f"Error with {title}: {e}")

conn.commit()
conn.close()
