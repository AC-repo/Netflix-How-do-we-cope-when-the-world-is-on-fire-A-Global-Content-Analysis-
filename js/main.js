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
    loadInitialData();
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

// Data loading and visualization
async function loadInitialData() {
    try {
        updateMetricCards(mockData);
        populateCountryList(mockData.countries);
        // Load default view
        loadView('global-heatmap');
    } catch (error) {
        showError('Error loading initial data', error.message);
    }
}

function updateMetricCards(data) {
    // Most Escapist Country
    const escapistCard = document.getElementById('most-escapist');
    const escapistCountry = data.countries.reduce((prev, curr) => 
        prev.escapism_score > curr.escapism_score ? prev : curr
    );
    escapistCard.innerHTML = `
        <h3>Most Escapist Country</h3>
        <div class="metric-value">${escapistCountry.name}</div>
        <div class="metric-detail">Score: ${(escapistCountry.escapism_score * 100).toFixed(1)}%</div>
    `;

    // Most Reality-Based Country
    const realityCard = document.getElementById('most-reality');
    const realityCountry = data.countries.reduce((prev, curr) => 
        prev.reality_score > curr.reality_score ? prev : curr
    );
    realityCard.innerHTML = `
        <h3>Most Reality-Based Country</h3>
        <div class="metric-value">${realityCountry.name}</div>
        <div class="metric-detail">Score: ${(realityCountry.reality_score * 100).toFixed(1)}%</div>
    `;

    // COVID-19 Impact
    const covidCard = document.getElementById('covid-impact');
    covidCard.innerHTML = `
        <h3>COVID-19 Impact Score</h3>
        <div class="metric-value">${(data.covid_impact.global_score * 100).toFixed(1)}%</div>
        <div class="metric-detail">Trend: ${data.covid_impact.trend}</div>
    `;
}

function populateCountryList(countries) {
    const countryList = document.getElementById('countryList');
    countryList.innerHTML = countries.map(country => `
        <li>
            <a href="#" data-country="${country.name}">${country.name}</a>
        </li>
    `).join('');

    // Add click handlers for country selection
    countryList.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const country = e.target.dataset.country;
            loadCountryData(country);
        });
    });
}

async function loadView(view) {
    const container = document.getElementById('visualization-container');
    container.innerHTML = '<div class="loading"></div>';

    try {
        switch(view) {
            case 'global-heatmap':
                await createGlobalHeatmap(container);
                break;
            case 'preference-comparison':
                await createPreferenceComparison(container);
                break;
            case 'covid-analysis':
                await createCovidAnalysis(container);
                break;
            case 'political-matrix':
                await createPoliticalMatrix(container);
                break;
            default:
                container.innerHTML = '<div class="error-message">Invalid view selected</div>';
        }
    } catch (error) {
        showError('Error loading view', error.message);
    }
}

// Visualization functions
async function createGlobalHeatmap(container) {
    const data = {
        type: 'choropleth',
        locations: mockData.countries.map(c => c.name),
        z: mockData.countries.map(c => c.escapism_score),
        text: mockData.countries.map(c => c.name),
        colorscale: 'Reds',
        colorbar: {
            title: 'Escapism Score',
            thickness: 20
        }
    };

    const layout = {
        title: 'Global Content Preferences',
        geo: {
            showframe: false,
            showcoastlines: true,
            projection: {
                type: 'mercator'
            }
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: {
            color: '#ffffff'
        }
    };

    Plotly.newPlot(container, [data], layout);
}

// Error handling
function showError(title, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <h3>${title}</h3>
        <p>${message}</p>
    `;
    document.getElementById('visualization-container').appendChild(errorDiv);
}

// Helper functions for data processing
function normalizeScore(value, min, max) {
    return (value - min) / (max - min);
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        normalizeScore,
        updateMetricCards,
        loadView
    };
} 