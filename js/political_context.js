// Political Context Analysis Module
const PoliticalContext = {
  // COVID-19 pandemic timeline
  covidTimeline: {
    startDate: '2020-01-30', // WHO Public Health Emergency declaration
    endDate: '2022-12-31',   // End of analysis period
  },

  // Data attribution notice
  dataSourceNotice: '* Information sourced from Human Rights Watch World Reports and United Nations public data',

  // Calculate political context scores based on HRW/UN data
  calculateScores: function(country, year) {
    return {
      freedomScore: this.getFreedomScore(country, year),
      internetScore: this.getInternetScore(country, year), 
      pressScore: this.getPressScore(country, year)
    };
  },

  // Show attribution when political dashboard is opened
  showDashboard: function() {
    const dashboard = document.getElementById('political-dashboard');
    if (dashboard) {
      const notice = document.createElement('div');
      notice.className = 'data-attribution';
      notice.innerHTML = this.dataSourceNotice;
      dashboard.appendChild(notice);
    }
  },

  // Filter Netflix content by COVID timeline
  filterContentByTimeline: function(content) {
    return content.filter(item => {
      const releaseDate = new Date(item.release_date);
      const startDate = new Date(this.covidTimeline.startDate);
      const endDate = new Date(this.covidTimeline.endDate);
      return releaseDate >= startDate && releaseDate <= endDate;
    });
  },

  // Get freedom score from HRW data
  getFreedomScore: function(country, year) {
    // Implementation using HRW World Report data
    // Score based on civil liberties, political rights
    return this.getScoreFromHRWData(country, year, 'freedom');
  },

  // Get internet freedom score from HRW/UN data  
  getInternetScore: function(country, year) {
    // Implementation using HRW/UN data on internet restrictions
    return this.getScoreFromHRWData(country, year, 'internet');
  },

  // Get press freedom score from HRW data
  getPressScore: function(country, year) {
    // Implementation using HRW World Report data on press freedom
    return this.getScoreFromHRWData(country, year, 'press');
  },

  // Helper to get scores from HRW data
  getScoreFromHRWData: function(country, year, metric) {
    // Implementation to parse HRW World Report data
    // Returns normalized score 0-100
    return this.normalizeScore(rawScore);
  },

  // Normalize scores to 0-100 scale
  normalizeScore: function(rawScore) {
    return Math.min(Math.max(rawScore * 100, 0), 100);
  }
};

// Add styles for attribution notice
const styles = `
.data-attribution {
  font-style: italic;
  font-size: 0.9em;
  color: #666;
  margin-top: 20px;
  padding: 10px;
  border-top: 1px solid #eee;
}
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default PoliticalContext; 