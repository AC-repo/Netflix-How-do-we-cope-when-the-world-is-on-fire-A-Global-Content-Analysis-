# 🎬 Netflix & The World: How We Cope Through Stories in Times of Global Crisis

## 📌 Overview

In moments of political unrest, global pandemics, or national trauma, we often turn to stories — not just to be entertained, but to cope, reflect, or escape. This project explores **how streaming content mirrors our social reality** — and at times, offers us a temporary sanctuary from it.

Using Netflix's global catalog, enriched with genre, award, and political context data, this project examines:

* What kind of content performs best across different countries and time periods?
* How do national events like protests, uprisings, elections, or war shape the stories that are told — or streamed?
* What genres become our collective therapy during global or national crisis?

## 🌐 Live Demo
Visit the live demo at [Netflix Analysis Dashboard](https://ac-repo.github.io/Netflix-How-do-we-cope-when-the-world-is-on-fire-A-Global-Content-Analysis-/)

## 📱 Mobile App
Download the PWA version by visiting the website on your mobile device and adding it to your home screen.

## 🔍 Key Features

* Interactive dashboards showing global content trends
* COVID-19 impact analysis (2020-2022)
* Political context correlation with content preferences
* Country-specific analysis and comparisons
* Mobile-responsive design with PWA support
* Netflix-inspired UI/UX

## 🛠️ Technical Stack

* **Frontend**: HTML5, CSS3, JavaScript
* **Visualization**: Plotly.js
* **Backend**: Python/Flask
* **Data Processing**: Pandas, NumPy
* **Database**: SQLite
* **APIs**: OMDb, TMDb
* **PWA Features**: Service Workers, Web App Manifest

## 📊 Key Visualizations & Dashboards

| Visualization | Purpose |
|--------------|---------|
| **Genre vs Awards Heatmap** | See what genres win awards globally |
| **Country vs Awards Map** | Track critical acclaim by region |
| **Conflict vs Content Volume** | Are people producing more — or consuming differently — in crisis? |
| **Escapism Index by Year** | What was the "most escapist" year in each country? |
| **Word Clouds** | Common themes and tropes during high-conflict years |

## 📁 Project Structure

```
netflix-analysis/
├── app/
│   ├── static/
│   │   ├── css/
│   │   ├── js/
│   │   └── icons/
│   └── templates/
├── data/
│   ├── raw/
│   └── processed/
├── notebooks/
├── utils/
└── README.md
```

## 🌍 Country Focus (2016–2024)

Special attention is given to how countries responded to:
* COVID-19 (2020–2022)
* The George Floyd protests (global echoes in 2020)
* National reckonings with race, colonial legacy, and power dynamics

## 📬 Contact & Contributions

Have ideas or want to collaborate?
Reach out via [GitHub Issues](https://github.com/AC-repo) or email me at `[contact info]`.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

# Netflix Content Analysis

A web application that analyzes global Netflix content trends and their relationship with political and social contexts.

## Features

- Global content distribution visualization
- Content preference analysis by country
- COVID-19 impact timeline analysis
- Political context matrix
- Mobile-friendly responsive design
- Progressive Web App (PWA) support

## Data Processing

The application processes Netflix content data with the following features:
- 8,807 titles across 90 unique countries
- Standardized date formats (YYYY-MM-DD)
- Single country per title (primary country only)
- Primary genre categorization
- Political context scoring

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Netflix-How-do-we-cope-when-the-world-is-on-fire-A-Global-Content-Analysis-.git
cd Netflix-How-do-we-cope-when-the-world-is-on-fire-A-Global-Content-Analysis-
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Process the data:
```bash
cd scripts
python clean_data.py
```

4. Serve the application:
```bash
python app.py
```

5. Open http://localhost:5000 in your browser

## Deployment

The application is configured for GitHub Pages deployment:

1. Base path is set to `/Netflix-How-do-we-cope-when-the-world-is-on-fire-A-Global-Content-Analysis-/`
2. All resource paths are relative to the base path
3. Service Worker is configured for offline support
4. CORS headers are set for JSON data access

## Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome for Android)

## Data Sources

- Netflix Titles Database
- Political Context Data
- COVID-19 Timeline Data

## License

MIT License 

## 🗂️ Irrelevant Old Stuff

Legacy scripts, system files, and database GUI project files that are not part of the current dashboard pipeline have been moved to the `irrelevant_old_stuff/` folder for repository hygiene. You can safely ignore this folder for all development and deployment purposes. 