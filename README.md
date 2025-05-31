# 🎬 Netflix & The World: How Politics, Awards, and Genre Shape Global Viewing Habits

## 📌 Overview

This project explores what Netflix's catalog reveals about global content trends — and how our viewing patterns reflect or reject the political realities of the time.

## 🔍 Key Research Questions

1. **Political Impact**: How do major national events influence content creation and consumption?
2. **Cultural Coping**: During national trauma or political turmoil, what stories do people gravitate toward?
3. **Award Patterns**: Do politically charged times produce more critically acclaimed content?
4. **Genre Shifts**: Do we see more escapism during crisis, or do we confront reality through our media choices?

## 🛠 Setup & Installation

1. Install required packages:
```bash
python -m pip install -r requirements.txt
```

2. Ensure you have the Netflix titles database (`netflix_titles.db`) in the project directory.

3. Set up the database structure:
```bash
python setup_database.py
```

## 📊 Running the Analysis

1. First, enrich the database with political context and awards data:
```bash
python enrich_netflix_data.py
```

2. Generate the initial visualizations:
```bash
python country_dashboards.py
```

3. Start the web interface:
```bash
python app.py
```

Visit `http://localhost:5000` in your browser to access the interactive dashboard.

## 📈 Dashboard Features

### 1. Country-Specific Analysis
- Content evolution timeline
- Genre distribution
- Escapism vs. Reality preference indicator
- Awards distribution
- Political context correlation

### 2. COVID-19 Impact (2020-2022)
- Content volume changes
- Genre preference shifts
- Country-specific coping mechanisms
- Award-winning content distribution

### 3. Political Context Matrix
The political context analysis maps content against real-world events using:
- Political Intensity Score: Calculated from major events database
- Genre Evolution: Tracks genre changes during political events
- Award Correlation: Maps critical acclaim against political backdrop
- Content Response Time: How quickly content adapts to events

### 4. Global Comparisons
- Interactive heatmap of content preferences
- Most escapist vs. most reality-focused countries
- Regional content strategy comparisons
- Crisis response patterns

## 🎯 Political Analysis Methodology

The project tracks political context through multiple layers:

1. **Event Database**
   - Major political events by country
   - Event intensity scoring
   - Duration of impact
   - Global ripple effects

2. **Content Response Tracking**
   - Genre shifts following events
   - Production volume changes
   - Theme evolution
   - Award patterns during turbulent times

3. **Cultural Coping Indicators**
   - Escapism score calculation
   - Reality-engagement metrics
   - Genre preference shifts
   - Content consumption patterns

## 📊 Visualization Structure

The dashboard is built with:
- Flask backend serving data
- Interactive Plotly.js visualizations
- Dynamic content loading
- Netflix-inspired UI design

## 🔄 Project Structure

```
netflix-analysis/
├── app.py                 # Flask web application
├── country_dashboards.py  # Dashboard generation script
├── enrich_netflix_data.py # Data enrichment script
├── setup_database.py      # Database setup script
├── static/               
│   └── css/              # Stylesheets
│       └── style.css     
├── templates/            
│   └── index.html        # Main dashboard template
└── dashboards/           # Generated visualization files
```

## 📝 Research Notes

- Political context scores factor in event intensity and frequency
- Award metrics include both nominations and wins
- Genre analysis considers both primary and secondary categorizations
- All visualizations are interactive for deeper exploration

## 🎯 Key Findings Focus

- How content strategies shift during political upheaval
- Regional differences in cultural coping through media
- The relationship between political tension and content quality
- Global patterns in escapist vs. confrontational content choices

This research provides unique insights into how global societies process and respond to political events through their media consumption patterns, offering a window into cultural coping mechanisms across different societies and time periods. 