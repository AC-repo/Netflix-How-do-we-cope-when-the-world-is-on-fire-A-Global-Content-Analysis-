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
    initializeNavigation();
    initializeData();
});

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

// Create preference comparison visualization
function createPreferenceComparison() {
    const countries = getTopCountries(20);
    
    const data = [{
        type: 'bar',
        x: countries,
        y: countries.map(country => calculateEscapismScore(country)),
        name: 'Escapism Score',
        marker: {
            color: '#fb6a4a'
        }
    }, {
        type: 'bar',
        x: countries,
        y: countries.map(country => calculateRealityScore(country)),
        name: 'Reality Score',
        marker: {
            color: '#6baed6'
        }
    }];

    const layout = {
        title: 'Content Preference Comparison',
        barmode: 'group',
        xaxis: {
            title: 'Country',
            tickangle: -45
        },
        yaxis: {
            title: 'Score',
            range: [0, 1]
        },
        height: 500,
        margin: {
            b: 100
        }
    };

    Plotly.newPlot('preference-comparison', data, layout, {responsive: true});
}

// Create COVID analysis visualization
function createCovidAnalysis() {
    const covidData = netflixData.filter(item => {
        const date = new Date(item.date_added);
        return date >= new Date(PoliticalContext.covidTimeline.startDate) &&
               date <= new Date(PoliticalContext.covidTimeline.endDate);
    });

    const monthlyData = groupByMonth(covidData);
    
    const data = [{
        type: 'scatter',
        x: Object.keys(monthlyData),
        y: Object.values(monthlyData).map(d => d.count),
        mode: 'lines+markers',
        name: 'Content Additions'
    }];

    const layout = {
        title: 'Content Additions During COVID-19 Pandemic',
        xaxis: {
            title: 'Month',
            tickangle: -45
        },
        yaxis: {
            title: 'Number of Titles Added'
        },
        height: 400
    };

    Plotly.newPlot('covid-content-stats', data, layout);
}

// Create political context matrix
function createPoliticalMatrix() {
    const countries = getTopCountries(20);
    const years = [2020, 2021, 2022];
    
    const data = years.map(year => ({
        type: 'heatmap',
        z: countries.map(country => [
            PoliticalContext.getFreedomScore(country, year),
            PoliticalContext.getInternetScore(country, year),
            PoliticalContext.getPressScore(country, year)
        ]),
        x: ['Freedom', 'Internet', 'Press'],
        y: countries,
        name: year.toString()
    }));

    const layout = {
        title: 'Political Context Matrix',
        grid: {rows: 1, columns: 3, pattern: 'independent'},
        annotations: [{
            text: PoliticalContext.dataSourceNotice,
            showarrow: false,
            x: 0.5,
            y: -0.15,
            xref: 'paper',
            yref: 'paper',
            font: {
                size: 10,
                color: '#666'
            }
        }]
    };

    Plotly.newPlot('country-comparison-chart', data, layout);
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