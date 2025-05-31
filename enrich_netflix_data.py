import sqlite3
from imdb import IMDb
import pandas as pd
from datetime import datetime
import requests
import json

# Configuration
DB_PATH = "netflix_titles.db"
GDELT_BASE_URL = "https://api.gdeltproject.org/api/v2/doc/doc"

# Major events database (you'll need to expand this)
MAJOR_EVENTS = {
    'USA': {
        2016: {'events': ['Presidential Election', 'Political Polarization'], 'intensity': 'High', 'keywords': 'election,polarization'},
        2020: {'events': ['COVID-19 Pandemic', 'BLM Protests', 'Presidential Election'], 'intensity': 'High', 'keywords': 'pandemic,protests,election'},
        2021: {'events': ['Capitol Insurrection', 'COVID-19 Continued'], 'intensity': 'High', 'keywords': 'insurrection,pandemic'},
    },
    'India': {
        2016: {'events': ['Demonetization'], 'intensity': 'High', 'keywords': 'economic,reform'},
        2019: {'events': ['Article 370 Revocation'], 'intensity': 'High', 'keywords': 'kashmir,politics'},
        2020: {'events': ['COVID-19 Pandemic', 'Farmer Protests'], 'intensity': 'High', 'keywords': 'pandemic,protests'},
    },
    # Add more countries and events as needed
}

def calculate_political_context_score(country, year, events_dict=MAJOR_EVENTS):
    """Calculate political context score based on events."""
    if not country or not year:
        return 0
    
    country_events = events_dict.get(country, {}).get(year, {})
    if not country_events:
        return 1  # baseline score
    
    # Score based on intensity and number of events
    intensity_scores = {'Low': 1, 'Moderate': 2, 'High': 3}
    base_score = intensity_scores.get(country_events.get('intensity', 'Low'), 1)
    event_count = len(country_events.get('events', []))
    
    return base_score * (1 + (event_count * 0.5))

def get_awards_count(imdb, title):
    """Get awards count from IMDb."""
    try:
        results = imdb.search_movie(title)
        if results:
            movie = imdb.get_movie(results[0].movieID)
            if 'awards' in movie.keys():
                awards_text = movie.get('awards', '')
                # Count nominations and wins
                nominations = awards_text.count('nominat')
                wins = awards_text.count('win') + awards_text.count('won')
                return nominations + wins
    except Exception as e:
        print(f"Error getting awards for {title}: {e}")
    return 0

def extract_primary_genre(listed_in):
    """Extract primary genre from listed_in field."""
    if not listed_in:
        return None
    genres = [g.strip() for g in listed_in.split(',')]
    return genres[0] if genres else None

def main():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    ia = IMDb()

    # Get all titles
    cursor.execute("SELECT show_id, title, country, release_year, listed_in FROM netflix_titles")
    rows = cursor.fetchall()

    for show_id, title, country, release_year, listed_in in rows:
        # Update awards
        awards_count = get_awards_count(ia, title)
        
        # Calculate political context score
        if country and release_year:
            # Handle multiple countries
            countries = [c.strip() for c in country.split(',')] if country else []
            max_score = 0
            for c in countries:
                score = calculate_political_context_score(c, release_year)
                max_score = max(max_score, score)
        else:
            max_score = 0

        # Extract primary genre
        primary_genre = extract_primary_genre(listed_in)
        
        # Update database
        cursor.execute("""
            UPDATE netflix_titles 
            SET awards = ?,
                political_context_score = ?,
                genre = ?
            WHERE show_id = ?
        """, (awards_count, max_score, primary_genre, show_id))
        
        print(f"Updated {title}: Awards={awards_count}, Political Score={max_score}, Genre={primary_genre}")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    main() 