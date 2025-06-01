const MOCK_DATA = {
    countries: [
        { name: 'United States', escapism_score: 0.85, reality_score: 0.45, covid_impact: 0.72 },
        { name: 'United Kingdom', escapism_score: 0.75, reality_score: 0.55, covid_impact: 0.68 },
        { name: 'Japan', escapism_score: 0.90, reality_score: 0.35, covid_impact: 0.81 },
        { name: 'Germany', escapism_score: 0.65, reality_score: 0.70, covid_impact: 0.65 },
        { name: 'France', escapism_score: 0.70, reality_score: 0.65, covid_impact: 0.70 },
        { name: 'Italy', escapism_score: 0.78, reality_score: 0.50, covid_impact: 0.75 },
        { name: 'Spain', escapism_score: 0.82, reality_score: 0.48, covid_impact: 0.73 },
        { name: 'Canada', escapism_score: 0.76, reality_score: 0.52, covid_impact: 0.69 },
        { name: 'Australia', escapism_score: 0.79, reality_score: 0.49, covid_impact: 0.71 },
        { name: 'Brazil', escapism_score: 0.88, reality_score: 0.38, covid_impact: 0.78 },
        { name: 'Mexico', escapism_score: 0.86, reality_score: 0.41, covid_impact: 0.76 },
        { name: 'Argentina', escapism_score: 0.83, reality_score: 0.44, covid_impact: 0.74 },
        { name: 'South Korea', escapism_score: 0.87, reality_score: 0.39, covid_impact: 0.77 },
        { name: 'India', escapism_score: 0.89, reality_score: 0.37, covid_impact: 0.79 },
        { name: 'China', escapism_score: 0.84, reality_score: 0.43, covid_impact: 0.75 },
        { name: 'Russia', escapism_score: 0.81, reality_score: 0.46, covid_impact: 0.72 },
        { name: 'South Africa', escapism_score: 0.80, reality_score: 0.47, covid_impact: 0.71 },
        { name: 'Nigeria', escapism_score: 0.85, reality_score: 0.42, covid_impact: 0.74 },
        { name: 'Egypt', escapism_score: 0.82, reality_score: 0.45, covid_impact: 0.73 },
        { name: 'Saudi Arabia', escapism_score: 0.88, reality_score: 0.36, covid_impact: 0.78 }
    ],
    
    political_context: {
        'United States': { freedom_score: 83, press_freedom: 76, internet_freedom: 75 },
        'United Kingdom': { freedom_score: 93, press_freedom: 82, internet_freedom: 78 },
        'Japan': { freedom_score: 96, press_freedom: 79, internet_freedom: 76 },
        'Germany': { freedom_score: 94, press_freedom: 85, internet_freedom: 80 },
        'France': { freedom_score: 90, press_freedom: 78, internet_freedom: 77 },
        'Italy': { freedom_score: 89, press_freedom: 77, internet_freedom: 76 },
        'Spain': { freedom_score: 92, press_freedom: 82, internet_freedom: 77 },
        'Canada': { freedom_score: 98, press_freedom: 87, internet_freedom: 87 },
        'Australia': { freedom_score: 97, press_freedom: 84, internet_freedom: 83 },
        'Brazil': { freedom_score: 75, press_freedom: 69, internet_freedom: 64 },
        'Mexico': { freedom_score: 62, press_freedom: 46, internet_freedom: 60 },
        'Argentina': { freedom_score: 85, press_freedom: 71, internet_freedom: 71 },
        'South Korea': { freedom_score: 83, press_freedom: 73, internet_freedom: 70 },
        'India': { freedom_score: 67, press_freedom: 55, internet_freedom: 51 },
        'China': { freedom_score: 9, press_freedom: 7, internet_freedom: 10 },
        'Russia': { freedom_score: 19, press_freedom: 30, internet_freedom: 30 },
        'South Africa': { freedom_score: 79, press_freedom: 73, internet_freedom: 70 },
        'Nigeria': { freedom_score: 45, press_freedom: 39, internet_freedom: 42 },
        'Egypt': { freedom_score: 18, press_freedom: 26, internet_freedom: 27 },
        'Saudi Arabia': { freedom_score: 7, press_freedom: 10, internet_freedom: 24 }
    },

    covid_timeline: {
        dates: ['2020-01', '2020-06', '2020-12', '2021-06', '2021-12', '2022-06'],
        content_changes: [0, 0.3, 0.5, 0.65, 0.72, 0.68],
        escapism_trend: [0.5, 0.65, 0.78, 0.82, 0.75, 0.70]
    },

    genre_distribution: {
        pre_covid: {
            'Drama': 30,
            'Comedy': 25,
            'Action': 20,
            'Documentary': 10,
            'Horror': 8,
            'Romance': 7
        },
        post_covid: {
            'Drama': 25,
            'Comedy': 30,
            'Action': 15,
            'Documentary': 15,
            'Horror': 10,
            'Romance': 5
        }
    },

    content_metrics: {
        total_titles: 5832,
        avg_release_delay: 45,
        platform_growth: 0.23,
        genre_diversity: 0.85
    }
};

// Make the data available globally
if (typeof window !== 'undefined') {
    window.MOCK_DATA = MOCK_DATA;
}

// Make the data available for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MOCK_DATA;
} 