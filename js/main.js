// Import dependencies
import PoliticalContext from './political_context.js';

// Global state
let netflixData = [];
let selectedCountries = [];

// Constants
const BASE_PATH = '/Netflix-How-do-we-cope-when-the-world-is-on-fire-A-Global-Content-Analysis-/';

// Mock data for initial load
const mockData = {
    countries: [
        { name: 'United States', escapism_score: 0.85, reality_score: 0.45 },
        { name: 'United Kingdom', escapism_score: 0.75, reality_score: 0.55 },
        { name: 'Japan', escapism_score: 0.90, reality_score: 0.35 },
        // Add more countries as needed
    ],
    covid_impact: {
        global_score: 0.72,
        trend: 'increasing',
        top_genres: ['Documentary', 'Drama', 'Comedy']
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadCountryList();
    initGlobalVisualizations();
});

// Load and display country list
async function loadCountryList() {
    try {
        const response = await fetch('data/netflix_titles.json');
        const data = await response.json();
        
        // Get unique countries and their content counts
        const countryStats = {};
        data.forEach(item => {
            const country = item.country;
            if (country && country.trim()) {
                const cleanCountry = country.trim();
                if (!countryStats[cleanCountry]) {
                    countryStats[cleanCountry] = {
                        total: 0,
                        movies: 0,
                        shows: 0,
                        genres: new Set(),
                        escapismScore: 0,
                        realityScore: 0
                    };
                }
                countryStats[cleanCountry].total++;
                if (item.type === 'Movie') {
                    countryStats[cleanCountry].movies++;
                } else {
                    countryStats[cleanCountry].shows++;
                }
                if (item.listed_in) {
                    countryStats[cleanCountry].genres.add(item.listed_in);
                }
            }
        });

        // Calculate escapism and reality scores
        Object.keys(countryStats).forEach(country => {
            const stats = countryStats[country];
            const escapistGenres = ['Animation', 'Fantasy', 'Science Fiction', 'Adventure'];
            const realityGenres = ['Documentary', 'Reality-TV', 'News'];
            
            stats.genres.forEach(genre => {
                if (escapistGenres.some(eg => genre.includes(eg))) {
                    stats.escapismScore++;
                }
                if (realityGenres.some(rg => genre.includes(rg))) {
                    stats.realityScore++;
                }
            });
            
            stats.escapismScore = (stats.escapismScore / stats.genres.size) * 100;
            stats.realityScore = (stats.realityScore / stats.genres.size) * 100;
        });

        // Sort countries by total content
        const sortedCountries = Object.entries(countryStats)
            .sort((a, b) => b[1].total - a[1].total);

        // Create country list HTML
        const countryList = document.getElementById('country-list');
        countryList.innerHTML = ''; // Clear existing content
        
        sortedCountries.forEach(([country, stats]) => {
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
                window.location.href = `templates/country_dashboard.html?country=${encodeURIComponent(country)}`;
            });
            countryList.appendChild(countryItem);
        });

        // Update global metrics
        updateGlobalMetrics(countryStats);
        
        // Initialize visualizations
        createGlobalHeatmap(data);
        createPreferenceComparison(countryStats);
        createCovidAnalysis(data);
        createPoliticalMatrix(data);

    } catch (error) {
        console.error('Error loading country data:', error);
        document.getElementById('country-list').innerHTML = 
            '<div class="error">Error loading country data. Please try again later.</div>';
    }
}

// Update global metrics
function updateGlobalMetrics(countryStats) {
    // Find most escapist country
    const mostEscapist = Object.entries(countryStats)
        .reduce((max, [country, stats]) => 
            stats.escapismScore > (max.score || 0) ? 
            { country, score: stats.escapismScore } : max
        , {});

    // Find most reality-based country
    const mostReality = Object.entries(countryStats)
        .reduce((max, [country, stats]) => 
            stats.realityScore > (max.score || 0) ? 
            { country, score: stats.realityScore } : max
        , {});

    // Update DOM
    document.getElementById('most-escapist-country').textContent = mostEscapist.country;
    document.getElementById('most-escapist-score').textContent = 
        `Score: ${mostEscapist.score.toFixed(1)}%`;
    
    document.getElementById('most-reality-country').textContent = mostReality.country;
    document.getElementById('most-reality-score').textContent = 
        `Score: ${mostReality.score.toFixed(1)}%`;
}

// Create global heatmap visualization
function createGlobalHeatmap(data) {
    const countryGenres = {};
    data.forEach(item => {
        if (item.country && item.listed_in) {
            if (!countryGenres[item.country]) {
                countryGenres[item.country] = {};
            }
            const genre = item.listed_in;
            countryGenres[item.country][genre] = (countryGenres[item.country][genre] || 0) + 1;
        }
    });

    const countries = Object.keys(countryGenres);
    const allGenres = [...new Set(data.map(item => item.listed_in))].filter(Boolean);
    
    const values = countries.map(country => 
        allGenres.map(genre => countryGenres[country][genre] || 0)
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
        xaxis: {
            title: 'Genre',
            tickangle: 45
        },
        yaxis: {
            title: 'Country'
        },
        height: Math.max(600, countries.length * 20)
    };

    Plotly.newPlot('global-heatmap', [trace], layout);
}

// Create preference comparison visualization
function createPreferenceComparison(countryStats) {
    const countries = Object.keys(countryStats);
    const escapismScores = countries.map(c => countryStats[c].escapismScore);
    const realityScores = countries.map(c => countryStats[c].realityScore);

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
        xaxis: {
            title: 'Country',
            tickangle: 45
        },
        yaxis: {
            title: 'Score (%)',
            range: [0, 100]
        },
        height: 600,
        margin: { b: 150 }
    };

    Plotly.newPlot('preference-comparison', [trace1, trace2], layout);
}

// Create COVID-19 impact analysis
function createCovidAnalysis(data) {
    const covidPeriod = data.filter(item => {
        const date = new Date(item.date_added);
        return date >= new Date('2020-01-01') && date <= new Date('2022-12-31');
    });

    const monthlyData = {};
    covidPeriod.forEach(item => {
        const date = new Date(item.date_added);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { total: 0, movies: 0, shows: 0 };
        }
        
        monthlyData[monthKey].total++;
        if (item.type === 'Movie') {
            monthlyData[monthKey].movies++;
        } else {
            monthlyData[monthKey].shows++;
        }
    });

    const months = Object.keys(monthlyData).sort();
    
    const trace1 = {
        x: months,
        y: months.map(m => monthlyData[m].movies),
        name: 'Movies',
        type: 'scatter',
        mode: 'lines+markers'
    };

    const trace2 = {
        x: months,
        y: months.map(m => monthlyData[m].shows),
        name: 'TV Shows',
        type: 'scatter',
        mode: 'lines+markers'
    };

    const layout = {
        title: 'Content Additions During COVID-19 (2020-2022)',
        xaxis: {
            title: 'Month',
            tickangle: 45
        },
        yaxis: {
            title: 'Number of Titles'
        },
        height: 500
    };

    Plotly.newPlot('covid-content-stats', [trace1, trace2], layout);
}

// Create political context matrix
function createPoliticalMatrix(data) {
    const countryScores = {};
    data.forEach(item => {
        if (item.country && item.political_context_score) {
            if (!countryScores[item.country]) {
                countryScores[item.country] = {
                    scores: [],
                    content: 0
                };
            }
            countryScores[item.country].scores.push(item.political_context_score);
            countryScores[item.country].content++;
        }
    });

    const countries = Object.keys(countryScores);
    const avgScores = countries.map(c => ({
        country: c,
        score: countryScores[c].scores.reduce((a, b) => a + b, 0) / countryScores[c].scores.length,
        content: countryScores[c].content
    }));

    avgScores.sort((a, b) => b.content - a.content);
    const top20 = avgScores.slice(0, 20);

    const trace = {
        x: top20.map(c => c.country),
        y: top20.map(c => c.score),
        type: 'bar',
        marker: {
            color: top20.map(c => c.score),
            colorscale: 'Reds'
        }
    };

    const layout = {
        title: 'Political Context Score by Country (Top 20)',
        xaxis: {
            title: 'Country',
            tickangle: 45
        },
        yaxis: {
            title: 'Political Context Score'
        },
        height: 500,
        margin: { b: 150 }
    };

    Plotly.newPlot('political-matrix', [trace], layout);
}

// Navigation handling
function initializeNavigation() {
    const links = document.querySelectorAll('.sidebar a');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.target.dataset.view;
            updateActiveLink(e.target);
            loadView(view);
        });
    });
}

function updateActiveLink(activeLink) {
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

// Fetch and initialize data
async function initializeData() {
    try {
        const response = await fetch('data/netflix_titles.json');
        netflixData = await response.json();
        
        // Initialize all views
        createGlobalMap();
        updateCountryList();
        createPreferenceComparison();
        createCovidAnalysis();
        createPoliticalMatrix();
    } catch (error) {
        console.error('Error initializing data:', error);
        showError('Failed to load Netflix data');
    }
}

// Create global map visualization
function createGlobalMap() {
    // Get unique countries from the countries array
    const allCountries = new Set();
    netflixData.forEach(item => {
        if (item.countries && Array.isArray(item.countries)) {
            item.countries.forEach(country => {
                if (country) allCountries.add(country);
            });
        }
    });
    const countries = Array.from(allCountries);
    
    const data = [{
        type: 'choropleth',
        locationmode: 'country names',
        locations: countries,
        z: countries.map(country => calculateEscapismScore(country)),
        text: countries.map(country => {
            const score = calculateEscapismScore(country);
            const contentCount = getCountryContentCount(country);
            return `${country}<br>Escapism Score: ${score.toFixed(2)}<br>Total Content: ${contentCount}`;
        }),
        colorscale: [
            [0, '#fff5f0'],
            [0.2, '#fee0d2'],
            [0.4, '#fcbba1'],
            [0.6, '#fc9272'],
            [0.8, '#fb6a4a'],
            [1, '#de2d26']
        ],
        colorbar: {
            title: 'Escapism Score',
            tickformat: '.2f'
        },
        hoverinfo: 'text'
    }];

    const layout = {
        title: 'Global Content Preferences',
        geo: {
            showframe: false,
            showcoastlines: true,
            projection: {
                type: 'equirectangular'
            }
        },
        width: window.innerWidth * 0.8,
        height: window.innerHeight * 0.7,
        margin: {
            l: 0,
            r: 0,
            t: 50,
            b: 0
        }
    };

    Plotly.newPlot('map', data, layout, {responsive: true});
}

// Update country list in sidebar
function updateCountryList() {
    const countries = getTopCountries();
    const countryList = document.getElementById('country-list');
    
    if (countryList) {
        countryList.innerHTML = countries
            .map(country => {
                const escapismScore = calculateEscapismScore(country);
                const realityScore = calculateRealityScore(country);
                const contentCount = getCountryContentCount(country);
                
                return `
                    <div class="country-item">
                        <span class="country-name">${country}</span>
                        <div class="score-indicators">
                            <span class="score escapism" title="Escapism Score">${escapismScore.toFixed(2)}</span>
                            <span class="score reality" title="Reality Score">${realityScore.toFixed(2)}</span>
                            <span class="count" title="Total Content">${contentCount}</span>
                        </div>
                    </div>
                `;
            })
            .join('');
    }
}

// Helper functions
function getTopCountries(limit = null) {
    const countryCount = {};
    netflixData.forEach(item => {
        if (item.countries && Array.isArray(item.countries)) {
            item.countries.forEach(country => {
                if (country) {
                    countryCount[country] = (countryCount[country] || 0) + 1;
                }
            });
        }
    });
    
    const sorted = Object.entries(countryCount)
        .sort(([,a], [,b]) => b - a)
        .map(([country]) => country);
        
    return limit ? sorted.slice(0, limit) : sorted;
}

function calculateEscapismScore(country) {
    const countryContent = netflixData.filter(item => 
        item.countries && item.countries.includes(country)
    );
    
    if (countryContent.length === 0) return 0;
    
    const escapistGenres = ['Fantasy', 'Sci-Fi', 'Animation', 'Adventure', 'Family'];
    
    return countryContent.reduce((score, item) => {
        if (!item.genres || !Array.isArray(item.genres)) return score;
        
        const escapismFactor = item.genres.filter(g => 
            escapistGenres.some(eg => g.toLowerCase().includes(eg.toLowerCase()))
        ).length / item.genres.length;
        
        return score + escapismFactor;
    }, 0) / countryContent.length;
}

function calculateRealityScore(country) {
    const countryContent = netflixData.filter(item => 
        item.countries && item.countries.includes(country)
    );
    
    if (countryContent.length === 0) return 0;
    
    const realityGenres = ['Documentary', 'Reality', 'News'];
    
    return countryContent.reduce((score, item) => {
        if (!item.genres || !Array.isArray(item.genres)) return score;
        
        const realityFactor = item.genres.filter(g => 
            realityGenres.some(rg => g.toLowerCase().includes(rg.toLowerCase()))
        ).length / item.genres.length;
        
        return score + realityFactor;
    }, 0) / countryContent.length;
}

function getCountryContentCount(country) {
    return netflixData.filter(item => 
        item.countries && item.countries.includes(country)
    ).length;
}

function groupByMonth(data) {
    const monthly = {};
    data.forEach(item => {
        const date = new Date(item.date_added);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthly[monthKey] = monthly[monthKey] || { count: 0 };
        monthly[monthKey].count++;
    });
    return monthly;
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
}

// Helper functions for data processing
function normalizeScore(value, min, max) {
    return (value - min) / (max - min);
}

// Window resize handler
window.addEventListener('resize', () => {
    createGlobalMap();
});

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        normalizeScore,
        updateMetricCards,
        loadView
    };
} 