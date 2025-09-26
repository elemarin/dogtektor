import React from 'react';

const DetectionControls = ({ isDetecting, onStart, onStop, barkCount }) => {
  return (
    <div className="detection-controls">
      <h3>Detection Control</h3>
      
      <div className="control-buttons">
        {!isDetecting ? (
          <button 
            className="btn btn-primary start-btn"
            onClick={onStart}
          >
            🎤 Start Detection
          </button>
        ) : (
          <button 
            className="btn btn-secondary stop-btn"
            onClick={onStop}
          >
            ⏹️ Stop Detection
          </button>
        )}
      </div>

      <div className="detection-stats">
        <div className="stat-item">
          <div className="stat-label">Total Barks Detected</div>
          <div className="stat-value">{barkCount}</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">Status</div>
          <div className={`stat-value status-${isDetecting ? 'active' : 'inactive'}`}>
            {isDetecting ? '🔴 Recording' : '⚪ Stopped'}
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">Session Duration</div>
          <div className="stat-value">
            <SessionTimer isRunning={isDetecting} />
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <button className="btn btn-small" onClick={() => window.location.reload()}>
          🔄 Reset
        </button>
        <button className="btn btn-small" onClick={() => {}}>
          📊 View Stats
        </button>
      </div>
    </div>
  );
};

const SessionTimer = ({ isRunning }) => {
  const [seconds, setSeconds] = React.useState(0);

  React.useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    } else if (!isRunning && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  React.useEffect(() => {
    if (!isRunning) {
      setSeconds(0);
    }
  }, [isRunning]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return <span>{formatTime(seconds)}</span>;
};

export default DetectionControls;