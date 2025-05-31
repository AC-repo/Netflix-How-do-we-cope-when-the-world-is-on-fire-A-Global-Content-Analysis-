import sqlite3
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import json
import numpy as np

# Configuration
DB_PATH = "netflix_titles.db"

# Define content type categories
ESCAPIST_GENRES = [
    'Fantasy', 'Animation', 'Musical', 'Romance', 'Comedy',
    'Science Fiction', 'Adventure', 'Family'
]

REALITY_GENRES = [
    'Documentary', 'Crime', 'War', 'Political', 'Biography',
    'History', 'News'
]

def load_data():
    """Load data from SQLite database into a pandas DataFrame."""
    conn = sqlite3.connect(DB_PATH)
    query = """
    SELECT 
        show_id, type, title, country, date_added, release_year,
        rating, duration, listed_in, description, awards,
        political_context_score, genre
    FROM netflix_titles
    """
    df = pd.read_sql_query(query, conn)
    conn.close()
    return df

def calculate_content_preference_scores(row):
    """Calculate both escapism and reality scores for content."""
    escapism_score = 0
    reality_score = 0
    
    if pd.notna(row['listed_in']):
        # Check for escapist genres
        for genre in ESCAPIST_GENRES:
            if genre.lower() in row['listed_in'].lower():
                escapism_score += 1
        
        # Check for reality-based genres
        for genre in REALITY_GENRES:
            if genre.lower() in row['listed_in'].lower():
                reality_score += 1
    
    # Check description for keywords
    if pd.notna(row['description']):
        # Reality keywords
        reality_keywords = ['war', 'politics', 'crisis', 'conflict', 'documentary', 'true story', 'based on']
        for keyword in reality_keywords:
            if keyword in row['description'].lower():
                reality_score += 0.5
        
        # Escapist keywords
        escapist_keywords = ['magical', 'fantasy', 'adventure', 'dream', 'imagination', 'fairy tale']
        for keyword in escapist_keywords:
            if keyword in row['description'].lower():
                escapism_score += 0.5
    
    return pd.Series({
        'escapism_score': max(escapism_score, 0),
        'reality_score': max(reality_score, 0)
    })

def determine_content_preference(df):
    """Calculate overall content preference for all countries."""
    # Calculate scores for each title
    scores = df.apply(calculate_content_preference_scores, axis=1)
    df = pd.concat([df, scores], axis=1)
    
    # Calculate country preferences
    country_preferences = df.groupby('country').agg({
        'escapism_score': 'mean',
        'reality_score': 'mean'
    }).reset_index()
    
    # Calculate preference ratio and label
    country_preferences['preference_ratio'] = country_preferences['escapism_score'] / country_preferences['reality_score']
    country_preferences['preference'] = country_preferences.apply(
        lambda x: 'Preference for Escapism' if x['preference_ratio'] > 1.2 
        else 'Preference for Reality' if x['preference_ratio'] < 0.8
        else 'Balanced Content Preference',
        axis=1
    )
    
    return country_preferences

def create_global_preference_heatmap(country_preferences):
    """Create a heatmap of content preferences globally."""
    fig = go.Figure()
    
    # Create heatmap data
    heatmap_data = country_preferences.pivot_table(
        values='preference_ratio',
        index='country',
        aggfunc='first'
    ).sort_values(ascending=False)
    
    # Create heatmap
    fig.add_trace(go.Heatmap(
        z=[heatmap_data.values],
        x=heatmap_data.index,
        y=['Content Preference'],
        colorscale='RdBu',
        text=[[f'{val:.2f}' for val in heatmap_data.values]],
        texttemplate='%{text}',
        textfont={"size": 10},
        showscale=True,
        colorbar_title='Escapism vs Reality Ratio'
    ))
    
    fig.update_layout(
        title='Global Content Preference Heatmap',
        height=200,
        yaxis_visible=False,
        xaxis_tickangle=45
    )
    
    return fig

def create_country_dashboard(df, country, country_preferences):
    """Create a dashboard for a specific country."""
    # Filter for the specific country
    country_data = df[df['country'].str.contains(country, na=False)]
    
    # Get country's preference
    country_pref = country_preferences[country_preferences['country'] == country].iloc[0]
    preference_label = country_pref['preference']
    
    # Create subplots
    fig = make_subplots(
        rows=3, cols=2,
        subplot_titles=(
            f'Content Trends in {country}',
            'Genre Distribution',
            'Content Preference Over Time',
            'Awards by Genre',
            'Escapism vs Reality Score Trend',
            'Global Preference Ranking'
        ),
        specs=[[{}, {}],
               [{}, {}],
               [{"colspan": 2}, None]],
        vertical_spacing=0.12
    )
    
    # 1. Content volume trend
    yearly_content = country_data.groupby(['release_year', 'type']).size().unstack(fill_value=0)
    for content_type in yearly_content.columns:
        fig.add_trace(
            go.Scatter(x=yearly_content.index, y=yearly_content[content_type],
                      name=content_type),
            row=1, col=1
        )
    
    # 2. Genre distribution
    genre_counts = country_data['genre'].value_counts()
    fig.add_trace(
        go.Bar(x=genre_counts.index, y=genre_counts.values, name='Genres'),
        row=1, col=2
    )
    
    # 3. Content preference over time
    yearly_scores = country_data.groupby('release_year').agg({
        'escapism_score': 'mean',
        'reality_score': 'mean'
    })
    
    fig.add_trace(
        go.Scatter(x=yearly_scores.index, y=yearly_scores['escapism_score'],
                  name='Escapism Score', line=dict(color='blue')),
        row=2, col=1
    )
    fig.add_trace(
        go.Scatter(x=yearly_scores.index, y=yearly_scores['reality_score'],
                  name='Reality Score', line=dict(color='red')),
        row=2, col=1
    )
    
    # 4. Awards by genre
    genre_awards = country_data.groupby('genre')['awards'].mean()
    fig.add_trace(
        go.Bar(x=genre_awards.index, y=genre_awards.values, name='Average Awards'),
        row=2, col=2
    )
    
    # 5. Global comparison heatmap
    fig.add_trace(
        go.Bar(
            x=['Escapism Score', 'Reality Score'],
            y=[country_pref['escapism_score'], country_pref['reality_score']],
            name='Content Scores',
            marker_color=['blue', 'red']
        ),
        row=3, col=1
    )
    
    # Update layout
    fig.update_layout(
        height=1200,
        title_text=f"Netflix Content Dashboard: {country}<br><sup>{preference_label}</sup>",
        showlegend=True
    )
    
    # Save dashboard
    fig.write_html(f"dashboards/{country.lower().replace(' ', '_')}_dashboard.html")
    
    return country_pref['preference_ratio']

def create_preference_comparison_dashboard(country_preferences):
    """Create a dashboard comparing most escapist vs most reality-focused countries."""
    # Sort countries by preference ratio
    most_escapist = country_preferences.nlargest(5, 'preference_ratio')
    most_reality = country_preferences.nsmallest(5, 'preference_ratio')
    
    fig = make_subplots(
        rows=2, cols=1,
        subplot_titles=('Top 5 Escapist-Preferring Countries', 'Top 5 Reality-Preferring Countries')
    )
    
    # Plot escapist countries
    fig.add_trace(
        go.Bar(x=most_escapist['country'], 
               y=most_escapist['preference_ratio'],
               name='Escapism Preference',
               marker_color='blue'),
        row=1, col=1
    )
    
    # Plot reality countries
    fig.add_trace(
        go.Bar(x=most_reality['country'], 
               y=most_reality['preference_ratio'],
               name='Reality Preference',
               marker_color='red'),
        row=2, col=1
    )
    
    fig.update_layout(
        height=800,
        title_text="Global Content Preference Extremes",
        showlegend=True
    )
    
    fig.write_html("dashboards/global_preference_comparison.html")

def main():
    # Load data
    df = load_data()
    
    # Create dashboards directory if it doesn't exist
    import os
    if not os.path.exists('dashboards'):
        os.makedirs('dashboards')
    
    # Calculate content preferences for all countries
    country_preferences = determine_content_preference(df)
    
    # Create global preference heatmap
    heatmap = create_global_preference_heatmap(country_preferences)
    heatmap.write_html("dashboards/global_preference_heatmap.html")
    
    # Get unique countries
    countries = []
    for country_list in df['country'].dropna().unique():
        countries.extend([c.strip() for c in country_list.split(',')])
    countries = list(set(countries))
    
    # Create dashboard for each country
    for country in countries:
        create_country_dashboard(df, country, country_preferences)
    
    # Create preference comparison dashboard
    create_preference_comparison_dashboard(country_preferences)
    
    # Save preference data
    country_preferences.to_json('dashboards/country_preferences.json', orient='records')
    
    print("Dashboards generated successfully!")
    print("\nContent preference analysis available in:")
    print("- Individual country dashboards")
    print("- global_preference_heatmap.html")
    print("- global_preference_comparison.html")
    print("- country_preferences.json")

if __name__ == "__main__":
    main() 