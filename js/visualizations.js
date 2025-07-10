// Visualization Manager
export default class NetflixVisualizations {
    constructor() {
        this.data = null;
        this.countryData = {};
        this.retryAttempts = 3;
        this.retryDelay = 2000; // 2 seconds
        this.isInitialized = false;
        this.errorHandlers = [];
        this.loadingHandlers = [];
    }

    onError(handler) {
        this.errorHandlers.push(handler);
    }

    onLoadingChange(handler) {
        this.loadingHandlers.push(handler);
    }

    setLoading(isLoading) {
        this.loadingHandlers.forEach(handler => handler(isLoading));
    }

    handleError(error, context) {
        console.error(`Error in ${context}:`, error);
        this.errorHandlers.forEach(handler => handler(error, context));
    }

    async fetchWithRetry(url, attempt = 1) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            if (attempt < this.retryAttempts) {
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.fetchWithRetry(url, attempt + 1);
            }
            throw error;
        }
    }

    async initialize() {
        if (this.isInitialized) return;
        
        try {
            this.setLoading(true);
            this.data = await this.fetchWithRetry('/data/netflix_titles.json');
            
            if (!Array.isArray(this.data) || this.data.length === 0) {
                throw new Error('Invalid data format received');
            }

            await this.processData();
            await this.createHeatmap();
            await this.createOtherVisualizations();
            
            this.isInitialized = true;
            this.setLoading(false);
        } catch (error) {
            this.handleError(error, 'initialization');
            this.setLoading(false);
            throw error;
        }
    }

    async processData() {
        try {
            this.countryData = {};
            
            // Validate data structure
            if (!this.data || !Array.isArray(this.data)) {
                throw new Error('Invalid data format');
            }

            this.data.forEach((item, index) => {
                try {
                    if (!item) return;
                    
                    const countries = item.country ? 
                        item.country.split(',')
                            .map(c => c.trim())
                            .filter(c => c && c.length > 0) : 
                        [];

                    countries.forEach(country => {
                        if (!this.countryData[country]) {
                            this.countryData[country] = {
                                titles: [],
                                genres: {},
                                total: 0,
                                escapismScore: 0,
                                yearData: {},
                                typeDistribution: {},
                                awards: []
                            };
                        }
                        
                        this.countryData[country].titles.push(item);
                        this.countryData[country].total++;
                        
                        // Process genres
                        if (item.listed_in) {
                            const genres = item.listed_in.split(',')
                                .map(g => g.trim())
                                .filter(g => g && g.length > 0);
                            
                            genres.forEach(genre => {
                                this.countryData[country].genres[genre] = 
                                    (this.countryData[country].genres[genre] || 0) + 1;
                            });
                        }

                        // Process year data
                        if (item.release_year) {
                            const year = parseInt(item.release_year);
                            if (!isNaN(year)) {
                                if (!this.countryData[country].yearData[year]) {
                                    this.countryData[country].yearData[year] = {
                                        total: 0,
                                        types: {},
                                        genres: {}
                                    };
                                }
                                this.countryData[country].yearData[year].total++;
                            }
                        }

                        // Process type distribution
                        if (item.type) {
                            this.countryData[country].typeDistribution[item.type] = 
                                (this.countryData[country].typeDistribution[item.type] || 0) + 1;
                        }

                        // Process awards
                        if (item.awards) {
                            this.countryData[country].awards.push(item.awards);
                        }
                    });
                } catch (itemError) {
                    console.warn(`Error processing item at index ${index}:`, itemError);
                }
            });

            // Calculate additional metrics
            Object.keys(this.countryData).forEach(country => {
                const data = this.countryData[country];
                
                // Most popular genre
                data.mostPopularGenre = Object.entries(data.genres)
                    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
                
                // Average awards
                data.averageAwards = data.awards.length > 0 ? 
                    data.awards.reduce((sum, val) => sum + val, 0) / data.awards.length : 0;
                
                // Content growth rate
                const years = Object.keys(data.yearData).map(Number).sort();
                if (years.length > 1) {
                    const firstYear = years[0];
                    const lastYear = years[years.length - 1];
                    data.growthRate = (data.yearData[lastYear].total - data.yearData[firstYear].total) / 
                        (lastYear - firstYear);
                }
            });
        } catch (error) {
            this.handleError(error, 'data processing');
            throw error;
        }
    }

    createHeatmap() {
        const container = document.querySelector('#global-heatmap .chart-container');
        if (!container) return;

        // Clear existing content
        container.innerHTML = '';

        // Prepare data for the heatmap
        const locations = Object.keys(this.countryData);
        const z = locations.map(country => this.countryData[country].total);
        const text = locations.map(country => {
            const data = this.countryData[country];
            const genres = Object.entries(data.genres)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([genre, count]) => `${genre}: ${count}`)
                .join('<br>');
            
            return `<b>${country}</b><br>` +
                   `Total Titles: ${data.total}<br>` +
                   `Top Genres:<br>${genres}`;
        });

        const data = [{
            type: 'choropleth',
            locationmode: 'country names',
            locations: locations,
            z: z,
            text: text,
            hoverinfo: 'text',
            colorscale: [
                [0, '#141414'],
                [0.2, '#2d0507'],
                [0.4, '#4a0a0f'],
                [0.6, '#800f17'],
                [0.8, '#b31317'],
                [1, '#e50914']
            ],
            colorbar: {
                title: 'Number of Titles',
                thickness: 20,
                len: 0.9,
                tickfont: {
                    color: '#ffffff'
                },
                title: {
                    font: {
                        color: '#ffffff'
                    }
                }
            },
            marker: {
                line: {
                    color: '#ffffff',
                    width: 0.5
                }
            }
        }];

        const layout = {
            title: {
                text: 'Global Netflix Content Distribution',
                font: {
                    color: '#ffffff',
                    size: 24
                }
            },
            geo: {
                showframe: false,
                showcoastlines: true,
                projection: {
                    type: 'mercator'
                },
                bgcolor: 'rgba(20,20,20,0)',
                coastlinecolor: '#666666',
                countrycolor: '#666666'
            },
            paper_bgcolor: 'rgba(20,20,20,0)',
            plot_bgcolor: 'rgba(20,20,20,0)',
            width: window.innerWidth * 0.95,  // Use most of the window width
            height: window.innerHeight * 0.8,  // Use most of the window height
            margin: {
                l: 0,
                r: 0,
                b: 0,
                t: 50,
                pad: 4
            },
            hoverlabel: {
                bgcolor: '#141414',
                bordercolor: '#e50914',
                font: {
                    family: 'Helvetica Neue',
                    size: 14,
                    color: '#ffffff'
                }
            }
        };

        const config = {
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
            displaylogo: false,
            scrollZoom: true
        };

        Plotly.newPlot(container, data, layout, config);

        // Add click handler for countries
        container.on('plotly_click', (data) => {
            const country = data.points[0].location;
            if (country && this.countryData[country]) {
                window.location.href = `/country/${encodeURIComponent(country)}`;
            }
        });

        // Add resize handler
        window.addEventListener('resize', () => {
            const update = {
                width: window.innerWidth * 0.95,
                height: window.innerHeight * 0.8
            };
            Plotly.relayout(container, update);
        });
    }

    createOtherVisualizations() {
        // Implementation for other visualizations will go here
        // We'll add these as needed
    }

    renderAllVisualizations() {
        this.updateMetricCards();
        this.renderGlobalHeatmap();
        this.renderPreferenceComparison();
        this.renderCovidImpact();
        this.renderCountryList();
    }

    updateMetricCards() {
        const mostEscapist = Object.entries(this.countryData)
            .reduce((max, [country, stats]) => 
                stats.escapismScore > (max.score || 0) ? 
                { country, score: stats.escapismScore } : max
            , {});

        const mostReality = Object.entries(this.countryData)
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
        const countries = Object.keys(this.countryData);
        const allGenres = [...new Set(this.data.flatMap(item => 
            item.listed_in ? item.listed_in.split(',').map(g => g.trim()) : []
        ))];

        const values = countries.map(country => 
            allGenres.map(genre => 
                [...this.countryData[country].genres].filter(g => g === genre).length
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
        const countries = Object.keys(this.countryData);
        const escapismScores = countries.map(c => this.countryData[c].escapismScore);
        const realityScores = countries.map(c => this.countryData[c].realityScore);

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
        const covidData = Object.entries(this.countryData)
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
        
        Object.entries(this.countryData)
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