import React from 'react';

const BarkStats = ({ detectedDogs, totalBarks }) => {
  const currentHour = new Date().getHours();
  
  // Calculate hourly stats
  const calculateHourlyStats = () => {
    const hourlyData = {};
    const now = new Date();
    
    // Initialize last 24 hours
    for (let i = 0; i < 24; i++) {
      const hour = (currentHour - i + 24) % 24;
      hourlyData[hour] = 0;
    }
    
    // Count barks by hour (simplified - would need real timestamp data)
    detectedDogs.forEach(dog => {
      const lastHour = dog.lastDetected.getHours();
      hourlyData[lastHour] += dog.barkCount;
    });
    
    return hourlyData;
  };

  const hourlyStats = calculateHourlyStats();
  const currentHourBarks = hourlyStats[currentHour] || 0;
  
  return (
    <div className="bark-stats">
      <h3>🐕 Bark Statistics</h3>
      
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-number">{totalBarks}</div>
          <div className="stat-label">Total Barks</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{currentHourBarks}</div>
          <div className="stat-label">This Hour</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{detectedDogs.length}</div>
          <div className="stat-label">Dogs Detected</div>
        </div>
      </div>

      <div className="detected-dogs">
        <h4>Detected Dogs</h4>
        {detectedDogs.length === 0 ? (
          <p className="no-data">No dogs detected yet. Start detection to see results.</p>
        ) : (
          <div className="dogs-list">
            {detectedDogs.map(dog => (
              <div key={dog.id} className="dog-item">
                <div className="dog-info">
                  <div className="dog-name">{dog.name}</div>
                  <div className="dog-stats">
                    <span className="bark-count">{dog.barkCount} barks</span>
                    <span className="confidence">
                      {Math.round(dog.confidence * 100)}% confidence
                    </span>
                  </div>
                  <div className="last-detected">
                    Last: {dog.lastDetected.toLocaleTimeString()}
                  </div>
                </div>
                <div className="dog-actions">
                  <button className="btn-small rename-btn" title="Rename dog">
                    ✏️
                  </button>
                  <button className="btn-small remove-btn" title="Remove dog">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="hourly-chart">
        <h4>Hourly Activity</h4>
        <div className="chart-container">
          {Object.entries(hourlyStats)
            .sort(([a], [b]) => a - b)
            .map(([hour, count]) => (
              <div key={hour} className="bar-container">
                <div 
                  className={`bar ${hour == currentHour ? 'current' : ''}`}
                  style={{ height: `${Math.max(count * 10, 4)}px` }}
                  title={`${hour}:00 - ${count} barks`}
                />
                <div className="bar-label">{hour}</div>
              </div>
            ))}
        </div>
      </div>

      <div className="stats-actions">
        <button className="btn btn-small export-btn">
          📤 Export Data
        </button>
        <button className="btn btn-small clear-btn">
          🗑️ Clear Stats
        </button>
      </div>
    </div>
  );
};

export default BarkStats;