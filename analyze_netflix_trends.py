import sqlite3
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import seaborn as sns
import matplotlib.pyplot as plt

# Configuration
DB_PATH = "netflix_titles.db"

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

def create_content_timeline(df):
    """Create content trend timeline visualization."""
    # Content volume by year
    fig = make_subplots(rows=2, cols=1,
                       subplot_titles=('Content Volume by Year and Type',
                                     'Genre Distribution Over Time'))
    
    # Content volume by type
    yearly_type = df.groupby(['release_year', 'type']).size().unstack(fill_value=0)
    
    # Plot content volume
    for content_type in yearly_type.columns:
        fig.add_trace(
            go.Scatter(x=yearly_type.index, y=yearly_type[content_type],
                      name=content_type, mode='lines+markers'),
            row=1, col=1
        )
    
    # Genre distribution
    yearly_genre = df.groupby(['release_year', 'genre']).size().unstack(fill_value=0)
    
    # Plot genre distribution
    for genre in yearly_genre.columns:
        fig.add_trace(
            go.Scatter(x=yearly_genre.index, y=yearly_genre[genre],
                      name=genre, mode='lines+markers'),
            row=2, col=1
        )
    
    fig.update_layout(height=800, title_text="Netflix Content Trends Over Time")
    fig.write_html("content_timeline.html")

def create_country_genre_matrix(df):
    """Create country x genre x awards matrix visualization."""
    # Calculate average awards per genre per country
    awards_matrix = df.groupby(['country', 'genre'])['awards'].mean().unstack()
    
    # Create heatmap
    plt.figure(figsize=(15, 10))
    sns.heatmap(awards_matrix, annot=True, cmap='YlOrRd', fmt='.1f')
    plt.title('Awards Distribution: Country vs Genre')
    plt.tight_layout()
    plt.savefig('country_genre_awards.png')
    plt.close()

def analyze_political_context(df):
    """Analyze content in political context."""
    # Filter for countries with significant data
    main_countries = df['country'].value_counts().nlargest(10).index
    
    # Create visualization
    fig = px.scatter(
        df[df['country'].isin(main_countries)],
        x='release_year',
        y='political_context_score',
        color='genre',
        size='awards',
        hover_data=['title', 'country'],
        title='Content Release vs Political Context'
    )
    
    fig.write_html("political_context.html")

def analyze_genre_performance(df):
    """Analyze genre performance and awards."""
    # Awards per genre
    genre_awards = df.groupby('genre')['awards'].agg(['mean', 'count']).reset_index()
    genre_awards = genre_awards[genre_awards['count'] >= 10]  # Filter for genres with enough data
    
    fig = px.bar(
        genre_awards,
        x='genre',
        y='mean',
        title='Average Awards per Genre',
        labels={'mean': 'Average Awards', 'genre': 'Genre'}
    )
    
    fig.write_html("genre_awards.html")

def main():
    # Load data
    df = load_data()
    
    # Clean data
    df['country'] = df['country'].fillna('Unknown')
    df['genre'] = df['genre'].fillna('Uncategorized')
    
    # Create visualizations
    create_content_timeline(df)
    create_country_genre_matrix(df)
    analyze_political_context(df)
    analyze_genre_performance(df)
    
    print("Analysis complete. Check the output files for visualizations.")

if __name__ == "__main__":
    main() 