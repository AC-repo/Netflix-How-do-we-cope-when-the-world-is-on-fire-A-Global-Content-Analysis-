from imdb import IMDb
import sqlite3

# Connect to your database
conn = sqlite3.connect("netflix_titles.db")
cursor = conn.cursor()

# Set up IMDbPY
ia = IMDb()

# Find rows where country is missing
cursor.execute("SELECT show_id, title FROM netflix_titles WHERE country IS NULL OR TRIM(country) = ''")
rows = cursor.fetchall()

for show_id, title in rows:
    try:
        search_results = ia.search_movie(title)
        if search_results:
            movie = ia.get_movie(search_results[0].movieID)
            country = movie.get('countries', [None])[0]
            if country:
                print(f"Updating: {title} → {country}")
                cursor.execute("UPDATE netflix_titles SET country = ? WHERE show_id = ?", (country, show_id))
    except Exception as e:
        print(f"Error with {title}: {e}")

conn.commit()
conn.close()
