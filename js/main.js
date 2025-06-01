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
            if (item.country) {
                if (!countryStats[item.country]) {
                    countryStats[item.country] = {
                        total: 0,
                        movies: 0,
                        shows: 0
                    };
                }
                countryStats[item.country].total++;
                if (item.type === 'Movie') {
                    countryStats[item.country].movies++;
                } else {
                    countryStats[item.country].shows++;
                }
            }
        });

        // Sort countries by total content
        const sortedCountries = Object.entries(countryStats)
            .sort((a, b) => b[1].total - a[1].total);

        // Create country list HTML
        const countryList = document.getElementById('country-list');
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
    } catch (error) {
        console.error('Error loading country data:', error);
    }
}

// Initialize global visualizations
async function initGlobalVisualizations() {
    try {
        const response = await fetch('data/netflix_titles.json');
        const data = await response.json();

        // Create global heatmap
        createGlobalHeatmap(data);
        
        // Create preference comparison
        createPreferenceComparison(data);
        
        // Create COVID-19 impact analysis
        createCovidAnalysis(data);
        
        // Create political context matrix
        createPoliticalMatrix(data);
    } catch (error) {
        console.error('Error initializing visualizations:', error);
    }
}

// Create global heatmap visualization
function createGlobalHeatmap(data) {
    const countryGenres = {};
    data.forEach(item => {
        if (item.country && item.listed_in) {
            if (!countryGenres[item.country]) {
                countryGenres[item.country] = {};
            }
            if (!countryGenres[item.country][item.listed_in]) {
                countryGenres[item.country][item.listed_in] = 0;
            }
            countryGenres[item.country][item.listed_in]++;
        }
    });

    // Convert to Plotly format
    const countries = Object.keys(countryGenres);
    const genres = [...new Set(data.map(item => item.listed_in))];
    const values = countries.map(country => 
        genres.map(genre => countryGenres[country][genre] || 0)
    );

    const trace = {
        z: values,
        x: genres,
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
        }
    };

    Plotly.newPlot('global-heatmap', [trace], layout);
}

// Create preference comparison visualization
function createPreferenceComparison(data) {
    // Implementation for preference comparison
    // This will show how different countries prefer different types of content
}

// Create COVID-19 impact analysis
function createCovidAnalysis(data) {
    // Implementation for COVID-19 impact analysis
    // This will show content trends during the pandemic period
}

// Create political context matrix
function createPoliticalMatrix(data) {
    // Implementation for political context matrix
    // This will show relationship between content and political context
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