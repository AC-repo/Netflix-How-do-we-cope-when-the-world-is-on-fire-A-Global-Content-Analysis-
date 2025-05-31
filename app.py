from flask import Flask, render_template, jsonify
import json
import pandas as pd
import sqlite3
from datetime import datetime

app = Flask(__name__)

# Configuration
DB_PATH = "netflix_titles.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/countries')
def get_countries():
    conn = get_db_connection()
    df = pd.read_sql_query("SELECT DISTINCT country FROM netflix_titles WHERE country IS NOT NULL", conn)
    countries = []
    for country_list in df['country'].unique():
        countries.extend([c.strip() for c in country_list.split(',')])
    countries = sorted(list(set(countries)))
    conn.close()
    return jsonify(countries)

@app.route('/api/country/<country>')
def get_country_data(country):
    with open('dashboards/country_preferences.json', 'r') as f:
        preferences = json.load(f)
    
    country_pref = next((p for p in preferences if p['country'] == country), None)
    
    conn = get_db_connection()
    df = pd.read_sql_query(f"""
        SELECT release_year, type, genre, awards, political_context_score
        FROM netflix_titles
        WHERE country LIKE '%{country}%'
    """, conn)
    conn.close()
    
    return jsonify({
        'preferences': country_pref,
        'yearly_data': df.to_dict(orient='records')
    })

@app.route('/api/covid-analysis')
def get_covid_analysis():
    conn = get_db_connection()
    df = pd.read_sql_query("""
        SELECT country, release_year, type, genre, awards
        FROM netflix_titles
        WHERE release_year BETWEEN 2020 AND 2022
    """, conn)
    conn.close()
    
    return jsonify(df.to_dict(orient='records'))

@app.route('/api/political-matrix')
def get_political_matrix():
    conn = get_db_connection()
    df = pd.read_sql_query("""
        SELECT country, release_year, genre, awards, political_context_score
        FROM netflix_titles
        WHERE political_context_score > 0
    """, conn)
    conn.close()
    
    # Group by country and year
    matrix_data = df.groupby(['country', 'release_year']).agg({
        'political_context_score': 'mean',
        'awards': 'mean',
        'genre': lambda x: x.value_counts().index[0] if len(x) > 0 else None
    }).reset_index()
    
    return jsonify(matrix_data.to_dict(orient='records'))

@app.route('/api/global-preferences')
def get_global_preferences():
    with open('dashboards/country_preferences.json', 'r') as f:
        preferences = json.load(f)
    return jsonify(preferences)

if __name__ == '__main__':
    app.run(debug=True) 