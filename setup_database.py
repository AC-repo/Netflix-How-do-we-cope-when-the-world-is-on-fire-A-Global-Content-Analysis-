import sqlite3

DB_PATH = "netflix_titles.db"

def setup_database():
    """Add necessary columns to the database if they don't exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get existing columns
    cursor.execute("PRAGMA table_info(netflix_titles)")
    existing_columns = [row[1] for row in cursor.fetchall()]
    
    # Define new columns to add
    new_columns = {
        'awards': 'INTEGER DEFAULT 0',
        'political_context_score': 'INTEGER DEFAULT 0',
        'conflict_intensity': 'TEXT',
        'event_keywords': 'TEXT',
        'genre': 'TEXT'
    }
    
    # Add missing columns
    for column, dtype in new_columns.items():
        if column not in existing_columns:
            try:
                cursor.execute(f"ALTER TABLE netflix_titles ADD COLUMN {column} {dtype}")
                print(f"Added column: {column}")
            except sqlite3.OperationalError as e:
                print(f"Error adding column {column}: {e}")
    
    conn.commit()
    conn.close()
    print("Database setup complete!")

if __name__ == "__main__":
    setup_database() 