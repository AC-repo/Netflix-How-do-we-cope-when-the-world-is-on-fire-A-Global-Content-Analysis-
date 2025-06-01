// Visualization Manager
class NetflixVisualizations {
    constructor() {
        this.data = null;
        this.countryStats = null;
        this.BASE_PATH = '/Netflix-How-do-we-cope-when-the-world-is-on-fire-A-Global-Content-Analysis-/';
    }

    async initialize() {
        try {
            const response = await fetch(`${this.BASE_PATH}data/netflix_titles.json`);
            this.data = await response.json();
            this.processData();
            this.renderAllVisualizations();
        } catch (error) {
            console.error('Failed to initialize visualizations:', error);
            this.showError('Failed to load Netflix data. Please try again later.');
        }
    }

    processData() {
        // Process country statistics
        this.countryStats = {};
        this.data.forEach(item => {
            if (!item.country) return;
            
            const countries = item.country.split(',').map(c => c.trim()).filter(Boolean);
            countries.forEach(country => {
                if (!this.countryStats[country]) {
                    this.countryStats[country] = {
                        total: 0,
                        movies: 0,
                        shows: 0,
                        genres: new Set(),
                        escapismScore: 0,
                        realityScore: 0,
                        covidContent: 0
                    };
                }

                this.countryStats[country].total++;
                if (item.type === 'Movie') {
                    this.countryStats[country].movies++;
                } else {
                    this.countryStats[country].shows++;
                }

                if (item.listed_in) {
                    const genres = item.listed_in.split(',').map(g => g.trim());
                    genres.forEach(g => this.countryStats[country].genres.add(g));
                }

                // Calculate COVID impact
                if (item.date_added && new Date(item.date_added) >= new Date('2020-01-01')) {
                    this.countryStats[country].covidContent++;
                }
            });
        });

        // Calculate scores
        Object.keys(this.countryStats).forEach(country => {
            const stats = this.countryStats[country];
            const escapistGenres = ['Animation', 'Fantasy', 'Science Fiction', 'Adventure'];
            const realityGenres = ['Documentary', 'Reality-TV', 'News'];

            let escapistCount = 0;
            let realityCount = 0;

            stats.genres.forEach(genre => {
                if (escapistGenres.some(eg => genre.includes(eg))) escapistCount++;
                if (realityGenres.some(rg => genre.includes(rg))) realityCount++;
            });

            stats.escapismScore = (escapistCount / stats.genres.size) * 100;
            stats.realityScore = (realityCount / stats.genres.size) * 100;
        });
    }

    renderAllVisualizations() {
        this.updateMetricCards();
        this.renderGlobalHeatmap();
        this.renderPreferenceComparison();
        this.renderCovidImpact();
        this.renderCountryList();
    }

    updateMetricCards() {
        const mostEscapist = Object.entries(this.countryStats)
            .reduce((max, [country, stats]) => 
                stats.escapismScore > (max.score || 0) ? 
                { country, score: stats.escapismScore } : max
            , {});

        const mostReality = Object.entries(this.countryStats)
            .reduce((max, [country, stats]) => 
                stats.realityScore > (max.score || 0) ? 
                { country, score: stats.realityScore } : max
            , {});

        document.getElementById('most-escapist-country').textContent = mostEscapist.country;
        document.getElementById('most-escapist-score').textContent = 
            `Score: ${mostEscapist.score.toFixed(1)}%`;

        document.getElementById('most-reality-country').textContent = mostReality.country;
        document.getElementById('most-reality-score').textContent = 
            `Score: ${mostReality.score.toFixed(1)}%`;
    }

    renderGlobalHeatmap() {
        const countries = Object.keys(this.countryStats);
        const allGenres = [...new Set(this.data.flatMap(item => 
            item.listed_in ? item.listed_in.split(',').map(g => g.trim()) : []
        ))];

        const values = countries.map(country => 
            allGenres.map(genre => 
                [...this.countryStats[country].genres].filter(g => g === genre).length
            )
        );

        const trace = {
            z: values,
            x: allGenres,
            y: countries,
            type: 'heatmap',
            colorscale: 'Reds'
        };

        const layout = {
            title: 'Global Content Distribution by Genre',
            xaxis: { title: 'Genre', tickangle: 45 },
            yaxis: { title: 'Country' },
            height: Math.max(600, countries.length * 20)
        };

        Plotly.newPlot('global-heatmap', [trace], layout);
    }

    renderPreferenceComparison() {
        const countries = Object.keys(this.countryStats);
        const escapismScores = countries.map(c => this.countryStats[c].escapismScore);
        const realityScores = countries.map(c => this.countryStats[c].realityScore);

        const trace1 = {
            x: countries,
            y: escapismScores,
            name: 'Escapism Score',
            type: 'bar',
            marker: { color: '#E50914' }
        };

        const trace2 = {
            x: countries,
            y: realityScores,
            name: 'Reality Score',
            type: 'bar',
            marker: { color: '#564D4D' }
        };

        const layout = {
            title: 'Content Preference Comparison',
            barmode: 'group',
            xaxis: { title: 'Country', tickangle: 45 },
            yaxis: { title: 'Score (%)', range: [0, 100] },
            height: 600,
            margin: { b: 150 }
        };

        Plotly.newPlot('preference-comparison', [trace1, trace2], layout);
    }

    renderCovidImpact() {
        const covidData = Object.entries(this.countryStats)
            .map(([country, stats]) => ({
                country,
                percentage: (stats.covidContent / stats.total) * 100
            }))
            .sort((a, b) => b.percentage - a.percentage);

        const trace = {
            x: covidData.map(d => d.country),
            y: covidData.map(d => d.percentage),
            type: 'bar',
            marker: { color: '#E50914' }
        };

        const layout = {
            title: 'COVID-19 Impact on Content (2020-2022)',
            xaxis: { title: 'Country', tickangle: 45 },
            yaxis: { title: 'Percentage of Content During COVID-19' },
            height: 500,
            margin: { b: 150 }
        };

        Plotly.newPlot('covid-content-stats', [trace], layout);
    }

    renderCountryList() {
        const countryList = document.getElementById('country-list');
        if (!countryList) return;

        countryList.innerHTML = '';
        
        Object.entries(this.countryStats)
            .sort((a, b) => b[1].total - a[1].total)
            .forEach(([country, stats]) => {
                const countryItem = document.createElement('div');
                countryItem.className = 'country-item';
                countryItem.innerHTML = `
                    <div class="country-name">${country}</div>
                    <div class="country-stats">
                        <span class="total">${stats.total} titles</span>
                        <span class="movies">${stats.movies} movies</span>
                        <span class="shows">${stats.shows} shows</span>
                    </div>
                `;
                countryItem.addEventListener('click', () => {
                    window.location.href = `${this.BASE_PATH}templates/country_dashboard.html?country=${encodeURIComponent(country)}`;
                });
                countryList.appendChild(countryItem);
            });
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
    }
}

// Export the visualization manager
export default NetflixVisualizations; 