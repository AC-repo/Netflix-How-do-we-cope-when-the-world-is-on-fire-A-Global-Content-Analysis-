# 🎬 Netflix & The World: How We Escape Through Stories in Times of Global Crisis

## 📌 Overview

In moments of political unrest, global pandemics, or national trauma, we often turn to stories — not just to be entertained, but to cope, reflect, or escape. This project explores **how streaming content mirrors our social reality** — and at times, offers us a temporary sanctuary from it.

Using Netflix’s global catalog, enriched with genre, award, and political context data, this project examines:

- What kind of content performs best across different countries and time periods?
- How do national events like protests, uprisings, elections, or war shape the stories that are told — or streamed?
- What genres become our collective therapy during global or national crisis?

---

## 🔍 Key Questions

- 📈 **What content performs better globally?**
  - Do certain **genres** or **countries** produce more critically acclaimed work?
  - What trends emerge when comparing **award-winning content** by genre or region?

- 🧠 **How do political crises and social unrest influence content production and consumption?**
  - Are there genre shifts during times of trauma (e.g., more escapist or more political)?
  - Do countries in conflict produce more patriotic, documentary, or fantastical stories?

- 💭 **What stories helped us cope during COVID-19?**
  - How did different nations respond culturally to a shared crisis?

---

## 🗺️ Data Sources

- **Netflix Titles Dataset** (Original)
- **OMDb / TMDb API** – for genre, ratings, awards metadata
- **World Bank / ACLED / GDELT** – for political conflict indicators by country & year
- **Curated Global Event Dataset (2016–2024)** – includes:
  - George Floyd protests and their international resonance
  - COVID-19 pandemic (2020–2022)
  - National events per country (war, protest, election, revolution)

---

## 🧮 Methodology

We enhanced and cross-referenced datasets to form a multidimensional view of streaming content over time.

### ➕ Data Enrichment
- Genre classification from OMDb/TMDb API
- Award count and critical acclaim tags (Oscars, BAFTAs, etc.)
- Conflict classification by country/year (low, moderate, high)

### 🧠 Feature Engineering
- `conflict_intensity` (based on political events)
- `escapist_genre` flag (romance, comedy, fantasy, sci-fi)
- `patriotic_theme` flag (war, military, nationalistic content)

---

## 📊 Key Visualizations & Dashboards

| Visualization | Purpose |
|---------------|---------|
| **Genre vs Awards Heatmap** | See what genres win awards globally |
| **Country vs Awards Map** | Track critical acclaim by region |
| **Conflict vs Content Volume** | Are people producing more — or consuming differently — in crisis? |
| **Escapism Index by Year** | What was the "most escapist" year in each country? |
| **Word Clouds** | Common themes and tropes during high-conflict years |
| **Streamlit Dashboards** | Interactive filters by country and year |

---

## 📁 Repository Structure

netflix-eyes-of-the-world/
├── data/
│ ├── raw/ # Original Netflix + Event data
│ └── processed/ # Enriched + Merged datasets
├── notebooks/ # Exploratory + visualization notebooks
├── app/
│ └── streamlit_app.py # Interactive dashboard
├── utils/
│ ├── genre_api.py
│ ├── awards_scraper.py
│ └── conflict_joiner.py
├── README.md
├── requirements.txt
└── LICENSE


---

## 🌍 Country Focus (2016–2024)

This project includes at least 3 major moments per country — from election years to uprisings to pandemic response — with focused insights on:

- 🇳🇬 Nigeria
- 🇧🇷 Brazil
- 🇮🇳 India
- 🇺🇸 United States
- 🇬🇧 United Kingdom
- 🇫🇷 France
- + more to come

Special attention is given to how countries responded to:
- COVID-19 (2020–2022)
- The George Floyd protests (global echoes in 2020)
- National reckonings with race, colonial legacy, and power dynamics

---

## ⚙️ Tech Stack

- **Python** (Pandas, Plotly, Seaborn, Requests)
- **SQLite** for storing enriched data
- **Streamlit** for dashboards
- **APIs**: OMDb, TMDb
- **Visualization**: Matplotlib, WordCloud, Plotly Express

---

## ❤️ Motivation

This is more than a data project — it’s a sociocultural exploration. As someone who has worked in content analysis and technological deployment, I wanted to fuse my skills to understand how **stories serve as mirrors and medicine** during times of turmoil.

This project is for the cultural critics, the coders, the storytellers, and the everyday people who find refuge in a good show when the world feels overwhelming.

---

## 📬 Contact

Have ideas or want to collaborate?  
Reach out via [GitHub Issues](https://github.com/AC-repo
or email me at `______[fill in later]`.

