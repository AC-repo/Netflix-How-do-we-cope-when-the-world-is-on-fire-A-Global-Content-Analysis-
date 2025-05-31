document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    loadCountryList();
    loadGlobalMetrics();

    // Set up event listeners
    setupNavigationHandlers();
});

function loadCountryList() {
    fetch('/api/countries')
        .then(response => response.json())
        .then(countries => {
            const countryList = document.getElementById('countryList');
            countries.forEach(country => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = '#';
                a.textContent = country;
                a.setAttribute('data-country', country);
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    loadCountryDashboard(country);
                });
                li.appendChild(a);
                countryList.appendChild(li);
            });
        });
}

function loadGlobalMetrics() {
    fetch('/api/global-preferences')
        .then(response => response.json())
        .then(data => {
            // Sort by escapism and reality scores
            const sortedByEscapism = [...data].sort((a, b) => b.escapism_score - a.escapism_score);
            const sortedByReality = [...data].sort((a, b) => b.reality_score - a.reality_score);

            // Update metrics cards
            document.getElementById('most-escapist').innerHTML = `
                <div class="metric-value">${sortedByEscapism[0].country}</div>
                <div class="metric-detail">Score: ${sortedByEscapism[0].escapism_score.toFixed(2)}</div>
            `;

            document.getElementById('most-reality').innerHTML = `
                <div class="metric-value">${sortedByReality[0].country}</div>
                <div class="metric-detail">Score: ${sortedByReality[0].reality_score.toFixed(2)}</div>
            `;

            // Calculate COVID impact
            const covidImpact = calculateCovidImpact(data);
            document.getElementById('covid-impact').innerHTML = `
                <div class="metric-value">${covidImpact.toFixed(2)}</div>
                <div class="metric-detail">Global Change in Content</div>
            `;
        });
}

function calculateCovidImpact(data) {
    // Calculate average change in content production during COVID years
    return data.reduce((acc, curr) => acc + curr.covid_impact_score, 0) / data.length;
}

function setupNavigationHandlers() {
    document.querySelectorAll('[data-view]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.target.getAttribute('data-view');
            loadView(view);
        });
    });
}

function loadView(view) {
    const container = document.getElementById('visualization-container');
    container.innerHTML = '<div class="loading"></div>';

    switch(view) {
        case 'global-heatmap':
            loadGlobalHeatmap();
            break;
        case 'preference-comparison':
            loadPreferenceComparison();
            break;
        case 'covid-analysis':
            loadCovidAnalysis();
            break;
        case 'political-matrix':
            loadPoliticalMatrix();
            break;
    }
}

function loadCountryDashboard(country) {
    const container = document.getElementById('visualization-container');
    container.innerHTML = '<div class="loading"></div>';

    fetch(`/api/country/${country}`)
        .then(response => response.json())
        .then(data => {
            createCountryDashboard(data, container);
        });
}

function createCountryDashboard(data, container) {
    // Clear loading indicator
    container.innerHTML = '';

    // Create dashboard sections
    const sections = [
        createContentTrendPlot(data),
        createGenreDistributionPlot(data),
        createEscapismTrendPlot(data),
        createAwardsPlot(data)
    ];

    // Add preference indicator
    const preferenceIndicator = document.createElement('div');
    preferenceIndicator.className = 'preference-indicator';
    preferenceIndicator.innerHTML = `
        <h2>${data.preferences.preference}</h2>
        <div class="score-comparison">
            <div class="score">
                <span>Escapism: ${data.preferences.escapism_score.toFixed(2)}</span>
            </div>
            <div class="score">
                <span>Reality: ${data.preferences.reality_score.toFixed(2)}</span>
            </div>
        </div>
    `;
    container.appendChild(preferenceIndicator);

    // Add visualization sections
    sections.forEach(section => container.appendChild(section));
}

// Plotting functions using Plotly.js
function createContentTrendPlot(data) {
    const yearlyData = processYearlyData(data.yearly_data);
    const div = document.createElement('div');
    div.className = 'plot-container';
    
    Plotly.newPlot(div, [{
        x: yearlyData.years,
        y: yearlyData.counts,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Content Volume'
    }], {
        title: 'Content Production Trend',
        template: 'plotly_dark'
    });

    return div;
}

function createGenreDistributionPlot(data) {
    const div = document.createElement('div');
    div.className = 'plot-container';
    
    Plotly.newPlot(div, [{
        values: data.genre_distribution.values,
        labels: data.genre_distribution.labels,
        type: 'pie',
        hole: 0.4,
        marker: {
            colors: generateColors(data.genre_distribution.values.length)
        }
    }], {
        title: 'Genre Distribution',
        template: 'plotly_dark'
    });

    return div;
}

function createEscapismTrendPlot(data) {
    const div = document.createElement('div');
    div.className = 'plot-container';
    
    Plotly.newPlot(div, [{
        x: data.escapism_trend.dates,
        y: data.escapism_trend.scores,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Escapism Score',
        line: { color: '#e50914' }
    }], {
        title: 'Escapism Trend Over Time',
        xaxis: { title: 'Date' },
        yaxis: { title: 'Escapism Score' },
        template: 'plotly_dark'
    });

    return div;
}

function createAwardsPlot(data) {
    const div = document.createElement('div');
    div.className = 'plot-container';
    
    Plotly.newPlot(div, [{
        x: data.awards.categories,
        y: data.awards.counts,
        type: 'bar',
        marker: {
            color: generateColors(data.awards.categories.length)
        }
    }], {
        title: 'Awards Distribution',
        xaxis: { title: 'Award Category' },
        yaxis: { title: 'Number of Awards' },
        template: 'plotly_dark'
    });

    return div;
}

// Helper functions
function processYearlyData(data) {
    return {
        years: data.map(item => item.year),
        counts: data.map(item => item.content_count)
    };
}

function generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(`hsl(${(i * 360) / count}, 70%, 50%)`);
    }
    return colors;
}

function loadGlobalHeatmap() {
    fetch('/api/global-heatmap')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('visualization-container');
            container.innerHTML = '';
            
            const plot = document.createElement('div');
            plot.className = 'plot-container';
            
            Plotly.newPlot(plot, [{
                type: 'heatmap',
                z: data.values,
                x: data.countries,
                y: data.metrics,
                colorscale: 'RdBu'
            }], {
                title: 'Global Content Preference Heatmap',
                template: 'plotly_dark'
            });
            
            container.appendChild(plot);
        })
        .catch(error => handleError(error));
}

function loadPreferenceComparison() {
    fetch('/api/preference-comparison')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('visualization-container');
            container.innerHTML = '';
            
            const plot = document.createElement('div');
            plot.className = 'plot-container';
            
            Plotly.newPlot(plot, [{
                type: 'scatter',
                x: data.escapism_scores,
                y: data.reality_scores,
                mode: 'markers+text',
                text: data.countries,
                textposition: 'top center',
                marker: {
                    size: 12,
                    color: data.total_content,
                    colorscale: 'Viridis',
                    showscale: true
                }
            }], {
                title: 'Escapism vs Reality Content Preferences',
                xaxis: { title: 'Escapism Score' },
                yaxis: { title: 'Reality Score' },
                template: 'plotly_dark'
            });
            
            container.appendChild(plot);
        })
        .catch(error => handleError(error));
}

function loadCovidAnalysis() {
    fetch('/api/covid-analysis')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('visualization-container');
            container.innerHTML = '';
            
            const plot = document.createElement('div');
            plot.className = 'plot-container';
            
            Plotly.newPlot(plot, [{
                type: 'scatter',
                x: data.dates,
                y: data.content_change,
                name: 'Content Change',
                line: { color: '#e50914' }
            }, {
                type: 'scatter',
                x: data.dates,
                y: data.escapism_trend,
                name: 'Escapism Trend',
                line: { color: '#564d4d' }
            }], {
                title: 'COVID-19 Impact on Content (2020-2022)',
                xaxis: { title: 'Date' },
                yaxis: { title: 'Percentage Change' },
                template: 'plotly_dark'
            });
            
            container.appendChild(plot);
        })
        .catch(error => handleError(error));
}

function loadPoliticalMatrix() {
    fetch('/api/political-matrix')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('visualization-container');
            container.innerHTML = '';
            
            const plot = document.createElement('div');
            plot.className = 'plot-container';
            
            Plotly.newPlot(plot, [{
                type: 'scatter3d',
                x: data.political_stability,
                y: data.content_diversity,
                z: data.viewer_engagement,
                mode: 'markers+text',
                text: data.countries,
                marker: {
                    size: 8,
                    color: data.correlation_score,
                    colorscale: 'Viridis'
                }
            }], {
                title: 'Political Context Matrix',
                scene: {
                    xaxis: { title: 'Political Stability' },
                    yaxis: { title: 'Content Diversity' },
                    zaxis: { title: 'Viewer Engagement' }
                },
                template: 'plotly_dark'
            });
            
            container.appendChild(plot);
        })
        .catch(error => handleError(error));
}

function handleError(error) {
    const container = document.getElementById('visualization-container');
    container.innerHTML = `
        <div class="error-message">
            <h3>Error Loading Data</h3>
            <p>${error.message || 'An unexpected error occurred. Please try again later.'}</p>
        </div>
    `;
    console.error('Error:', error);
} 