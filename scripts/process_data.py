import sqlite3
import json
from datetime import datetime
import os

def process_netflix_data():
    print("Starting data processing...")
    
    # Connect to SQLite database
    try:
        conn = sqlite3.connect('../netflix_titles.db')
        cursor = conn.cursor()
        
        # Get table schema
        cursor.execute("SELECT * FROM sqlite_master WHERE type='table' AND name='netflix_titles'")
        if not cursor.fetchone():
            print("Error: netflix_titles table not found in database")
            return
            
        # Get all Netflix content
        cursor.execute("""
            SELECT *
            FROM netflix_titles
        """)
        
        # Get column names
        columns = [description[0] for description in cursor.description]
        netflix_data = []
        
        print("Processing records...")
        for row in cursor.fetchall():
            item = dict(zip(columns, row))
            
            # Handle multiple countries
            if item.get('country'):
                countries = [c.strip() for c in str(item['country']).split(',') if c.strip()]
                item['countries'] = countries
            else:
                item['countries'] = []
                
            # Handle genres
            if item.get('listed_in'):
                genres = [g.strip() for g in str(item['listed_in']).split(',') if g.strip()]
                item['genres'] = genres
            else:
                item['genres'] = []
                
            # Ensure date format is consistent
            if item.get('date_added'):
                try:
                    # Try different date formats
                    date_formats = ['%B %d, %Y', '%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y']
                    date_str = str(item['date_added']).strip()
                    
                    for date_format in date_formats:
                        try:
                            date_obj = datetime.strptime(date_str, date_format)
                            item['date_added'] = date_obj.strftime('%Y-%m-%d')
                            break
                        except ValueError:
                            continue
                            
                except Exception as e:
                    print(f"Warning: Could not parse date '{item['date_added']}': {str(e)}")
                    item['date_added'] = None
                    
            # Clean up duration field
            if item.get('duration'):
                duration = str(item['duration'])
                if 'Season' in duration or 'season' in duration:
                    item['duration_type'] = 'Seasons'
                    item['duration_value'] = int(''.join(filter(str.isdigit, duration)))
                elif 'min' in duration:
                    item['duration_type'] = 'Minutes'
                    item['duration_value'] = int(''.join(filter(str.isdigit, duration)))
                else:
                    item['duration_type'] = None
                    item['duration_value'] = None
                    
            netflix_data.append(item)
        
        # Create data directory if it doesn't exist
        os.makedirs('../data', exist_ok=True)
        
        # Write to JSON file
        output_file = '../data/netflix_titles.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(netflix_data, f, ensure_ascii=False, indent=2)
        
        # Print statistics
        total_titles = len(netflix_data)
        unique_countries = set()
        for item in netflix_data:
            unique_countries.update(item['countries'])
            
        print(f"\nProcessing complete!")
        print(f"Total titles processed: {total_titles}")
        print(f"Unique countries found: {len(unique_countries)}")
        print(f"Data saved to: {output_file}")
        
        # Create a summary of content by country
        country_summary = {}
        for item in netflix_data:
            for country in item['countries']:
                if country not in country_summary:
                    country_summary[country] = {'movies': 0, 'shows': 0}
                if item['type'] == 'Movie':
                    country_summary[country]['movies'] += 1
                elif item['type'] == 'TV Show':
                    country_summary[country]['shows'] += 1
        
        print("\nTop 10 countries by content volume:")
        sorted_countries = sorted(country_summary.items(), 
                                key=lambda x: x[1]['movies'] + x[1]['shows'], 
                                reverse=True)[:10]
        for country, counts in sorted_countries:
            total = counts['movies'] + counts['shows']
            print(f"{country}: {total} titles ({counts['movies']} movies, {counts['shows']} shows)")
            
    except sqlite3.Error as e:
        print(f"Database error: {str(e)}")
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    process_netflix_data() 