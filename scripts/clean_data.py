import sqlite3
import json
from datetime import datetime
import os

def clean_netflix_data():
    print("Starting data cleanup process...")
    
    # Connect to SQLite database
    conn = sqlite3.connect('../netflix_titles.db')
    cursor = conn.cursor()
    
    # Get all titles
    cursor.execute("SELECT * FROM netflix_titles")
    
    records = cursor.fetchall()
    total_records = len(records)
    print(f"Found {total_records} records to process")
    
    # Drop existing table if exists
    cursor.execute("DROP TABLE IF EXISTS netflix_titles_cleaned")
    
    # Create a temporary table for cleaned data
    cursor.execute("""
        CREATE TABLE netflix_titles_cleaned (
            show_id TEXT PRIMARY KEY,
            type TEXT,
            title TEXT,
            director TEXT,
            cast TEXT,
            country TEXT,
            date_added TEXT,
            release_year INTEGER,
            rating TEXT,
            duration TEXT,
            listed_in TEXT,
            description TEXT,
            awards INTEGER DEFAULT 0,
            political_context_score INTEGER DEFAULT 0,
            event_keywords TEXT,
            genre TEXT
        )
    """)
    
    # Process each record
    cleaned_data = []
    for i, record in enumerate(records, 1):
        # Extract data
        data = {
            'show_id': record[0],
            'type': record[1],
            'title': record[2],
            'director': record[3],
            'cast': record[4],
            'country': record[5],
            'date_added': record[6],
            'release_year': record[7],
            'rating': record[8],
            'duration': record[9],
            'listed_in': record[10],
            'description': record[11],
            'awards': record[12] or 0,
            'political_context_score': record[13] or 0,
            'event_keywords': record[14],
            'genre': record[15] if len(record) > 15 else None
        }
        
        # Clean country (take only first country)
        if data['country']:
            data['country'] = data['country'].split(',')[0].strip()
            
        # Clean genres (ensure consistent format)
        if data['listed_in']:
            genres = [g.strip() for g in data['listed_in'].split(',')]
            data['listed_in'] = genres[0]  # Take only primary genre
            
        # Clean date format
        if data['date_added']:
            try:
                # Try different date formats
                date_formats = ['%B %d, %Y', '%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y']
                date_str = str(data['date_added']).strip()
                
                for date_format in date_formats:
                    try:
                        date_obj = datetime.strptime(date_str, date_format)
                        data['date_added'] = date_obj.strftime('%Y-%m-%d')
                        break
                    except ValueError:
                        continue
            except Exception as e:
                print(f"Warning: Could not parse date '{data['date_added']}' for title '{data['title']}'")
                data['date_added'] = None
        
        # Insert cleaned record
        cursor.execute("""
            INSERT INTO netflix_titles_cleaned
            (show_id, type, title, director, cast, country, date_added, 
             release_year, rating, duration, listed_in, description,
             awards, political_context_score, event_keywords, genre)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data['show_id'], data['type'], data['title'], data['director'],
            data['cast'], data['country'], data['date_added'], data['release_year'],
            data['rating'], data['duration'], data['listed_in'], data['description'],
            data['awards'], data['political_context_score'], data['event_keywords'],
            data['genre']
        ))
        
        cleaned_data.append(data)
        
        if i % 100 == 0:
            print(f"Processed {i}/{total_records} records")
            conn.commit()
    
    # Final commit
    conn.commit()
    
    # Create data directory if it doesn't exist
    os.makedirs('../data', exist_ok=True)
    
    # Write to JSON file
    with open('../data/netflix_titles.json', 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, ensure_ascii=False, indent=2)
    
    print("\nData cleanup complete!")
    print(f"Cleaned data exported to netflix_titles.json")
    
    # Print some statistics
    cursor.execute("SELECT COUNT(DISTINCT country) FROM netflix_titles_cleaned WHERE country IS NOT NULL")
    unique_countries = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(DISTINCT listed_in) FROM netflix_titles_cleaned WHERE listed_in IS NOT NULL")
    unique_genres = cursor.fetchone()[0]
    
    print(f"\nStatistics:")
    print(f"Total records: {total_records}")
    print(f"Unique countries: {unique_countries}")
    print(f"Unique primary genres: {unique_genres}")
    
    conn.close()

if __name__ == '__main__':
    clean_netflix_data() 