// Country Dashboard JavaScript

// Get country from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const country = urlParams.get('country');

// Update page title
document.getElementById('country-title').textContent = `${country} Analysis`;
document.title = `Netflix Analysis - ${country}`;

// Load country data
async function loadCountryData() {
    try {
        const response = await fetch('../data/netflix_titles.json');
        const data = await response.json();
        return data.filter(item => item.country === country);
    } catch (error) {
        console.error('Error loading data:', error);
        return [];
    }
}

// Calculate content volume by year
function createContentVolumeChart(data) {
    const years = [...new Set(data.map(item => item.release_year))].sort();
    const movies = years.map(year => 
        data.filter(item => item.release_year === year && item.type === 'Movie').length
    );
    const shows = years.map(year => 
        data.filter(item => item.release_year === year && item.type === 'TV Show').length
    );

    const trace1 = {
        x: years,
        y: movies,
        name: 'Movies',
        type: 'bar'
    };

    const trace2 = {
        x: years,
        y: shows,
        name: 'TV Shows',
        type: 'bar'
    };

    const layout = {
        title: 'Content Volume by Year',
        barmode: 'group',
        xaxis: { title: 'Year' },
        yaxis: { title: 'Number of Titles' }
    };

    Plotly.newPlot('content-volume-chart', [trace1, trace2], layout);
}

// Create genre breakdown chart
function createGenreBreakdownChart(data) {
    const genres = [...new Set(data.map(item => item.listed_in))];
    const genreCounts = genres.map(genre => ({
        genre,
        count: data.filter(item => item.listed_in === genre).length
    }));

    genreCounts.sort((a, b) => b.count - a.count);

    const trace = {
        x: genreCounts.map(g => g.genre),
        y: genreCounts.map(g => g.count),
        type: 'bar',
        marker: {
            color: '#E50914'
        }
    };

    const layout = {
        title: 'Genre Distribution',
        xaxis: { 
            title: 'Genre',
            tickangle: 45
        },
        yaxis: { title: 'Number of Titles' }
    };

    Plotly.newPlot('genre-breakdown-chart', [trace], layout);
}

// Create awards by genre chart
function createAwardsGenreChart(data) {
    const genres = [...new Set(data.map(item => item.listed_in))];
    const awardsByGenre = genres.map(genre => ({
        genre,
        awards: data
            .filter(item => item.listed_in === genre)
            .reduce((sum, item) => sum + (item.awards || 0), 0)
    }));

    awardsByGenre.sort((a, b) => b.awards - a.awards);

    const trace = {
        x: awardsByGenre.map(g => g.genre),
        y: awardsByGenre.map(g => g.awards),
        type: 'bar',
        marker: {
            color: '#564D4D'
        }
    };

    const layout = {
        title: 'Awards by Genre',
        xaxis: { 
            title: 'Genre',
            tickangle: 45
        },
        yaxis: { title: 'Number of Awards' }
    };

    Plotly.newPlot('awards-by-genre-chart', [trace], layout);
}

// Calculate and display escapism index
function calculateEscapismIndex(data) {
    const years = [...new Set(data.map(item => item.release_year))];
    const escapismScores = years.map(year => {
        const yearData = data.filter(item => item.release_year === year);
        const escapistGenres = ['Animation', 'Fantasy', 'Science Fiction', 'Adventure'];
        const escapistContent = yearData.filter(item => 
            escapistGenres.some(genre => item.listed_in.includes(genre))
        ).length;
        return {
            year,
            score: (escapistContent / yearData.length) * 100
        };
    });

    const mostEscapist = escapismScores.reduce((max, current) => 
        current.score > max.score ? current : max
    );

    document.getElementById('escapist-year').textContent = mostEscapist.year;
    document.getElementById('escapist-explanation').textContent = 
        `In ${mostEscapist.year}, ${mostEscapist.score.toFixed(1)}% of content was escapist in nature.`;

    // Create escapism trend chart
    const trace = {
        x: escapismScores.map(s => s.year),
        y: escapismScores.map(s => s.score),
        type: 'scatter',
        mode: 'lines+markers',
        line: {
            color: '#E50914'
        }
    };

    const layout = {
        title: 'Escapism Index Over Time',
        xaxis: { title: 'Year' },
        yaxis: { 
            title: 'Escapism Score (%)',
            range: [0, 100]
        }
    };

    Plotly.newPlot('escapism-trend-chart', [trace], layout);
}

// Create political context visualization
function createPoliticalContextChart(data) {
    const years = [...new Set(data.map(item => item.release_year))];
    const contentVolume = years.map(year => 
        data.filter(item => item.release_year === year).length
    );
    const politicalScores = years.map(year => {
        const yearData = data.filter(item => item.release_year === year);
        return yearData.reduce((sum, item) => sum + (item.political_context_score || 0), 0) / yearData.length;
    });

    const trace1 = {
        x: years,
        y: contentVolume,
        name: 'Content Volume',
        type: 'scatter',
        mode: 'lines+markers'
    };

    const trace2 = {
        x: years,
        y: politicalScores,
        name: 'Political Context Score',
        type: 'scatter',
        mode: 'lines+markers',
        yaxis: 'y2'
    };

    const layout = {
        title: 'Content Volume vs Political Context',
        xaxis: { title: 'Year' },
        yaxis: { title: 'Number of Titles' },
        yaxis2: {
            title: 'Political Context Score',
            overlaying: 'y',
            side: 'right'
        }
    };

    Plotly.newPlot('conflict-content-chart', [trace1, trace2], layout);
}

// Initialize all visualizations
async function initDashboard() {
    const data = await loadCountryData();
    if (data.length === 0) {
        document.body.innerHTML = '<h1>No data available for this country</h1>';
        return;
    }

    createContentVolumeChart(data);
    createGenreBreakdownChart(data);
    createAwardsGenreChart(data);
    calculateEscapismIndex(data);
    createPoliticalContextChart(data);
}

// Start dashboard initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard); 