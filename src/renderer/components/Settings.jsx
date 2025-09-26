import React, { useState, useEffect } from 'react';

const Settings = ({ onClose, onSave }) => {
  const [settings, setSettings] = useState({
    microphone: '',
    sensitivity: 0.5,
    barkThreshold: 0.6,
    autoName: true,
    saveAudio: false,
    notifications: true,
    statisticsRetention: 30, // days
  });

  const [availableMicrophones, setAvailableMicrophones] = useState([]);

  useEffect(() => {
    // Get available microphones
    const getMicrophones = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        setAvailableMicrophones(audioInputs);
        
        // Set default microphone
        if (audioInputs.length > 0 && !settings.microphone) {
          setSettings(prev => ({ ...prev, microphone: audioInputs[0].deviceId }));
        }
      } catch (error) {
        console.error('Error getting microphones:', error);
      }
    };

    getMicrophones();
  }, []);

  const handleInputChange = (name, value) => {
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(settings);
  };

  const handleReset = () => {
    setSettings({
      microphone: availableMicrophones[0]?.deviceId || '',
      sensitivity: 0.5,
      barkThreshold: 0.6,
      autoName: true,
      saveAudio: false,
      notifications: true,
      statisticsRetention: 30,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="settings-modal">
        <div className="modal-header">
          <h2>⚙️ Settings</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          <div className="settings-section">
            <h3>🎤 Audio Settings</h3>
            
            <div className="setting-item">
              <label>Microphone:</label>
              <select
                value={settings.microphone}
                onChange={(e) => handleInputChange('microphone', e.target.value)}
              >
                <option value="">Select microphone...</option>
                {availableMicrophones.map(mic => (
                  <option key={mic.deviceId} value={mic.deviceId}>
                    {mic.label || `Microphone ${mic.deviceId.slice(0, 8)}...`}
                  </option>
                ))}
              </select>
            </div>

            <div className="setting-item">
              <label>Sensitivity:</label>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.sensitivity}
                  onChange={(e) => handleInputChange('sensitivity', parseFloat(e.target.value))}
                />
                <span className="slider-value">{Math.round(settings.sensitivity * 100)}%</span>
              </div>
              <small>How sensitive the bark detection should be</small>
            </div>

            <div className="setting-item">
              <label>Bark Threshold:</label>
              <div className="slider-container">
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={settings.barkThreshold}
                  onChange={(e) => handleInputChange('barkThreshold', parseFloat(e.target.value))}
                />
                <span className="slider-value">{Math.round(settings.barkThreshold * 100)}%</span>
              </div>
              <small>Minimum confidence level to register as a bark</small>
            </div>
          </div>

          <div className="settings-section">
            <h3>🐕 Detection Settings</h3>
            
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.autoName}
                  onChange={(e) => handleInputChange('autoName', e.target.checked)}
                />
                Auto-name detected dogs
              </label>
              <small>Automatically assign names to newly detected dogs</small>
            </div>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleInputChange('notifications', e.target.checked)}
                />
                Show notifications
              </label>
              <small>Display system notifications when barks are detected</small>
            </div>
          </div>

          <div className="settings-section">
            <h3>💾 Data Settings</h3>
            
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.saveAudio}
                  onChange={(e) => handleInputChange('saveAudio', e.target.checked)}
                />
                Save audio clips
              </label>
              <small>Save short audio clips when barks are detected (for training)</small>
            </div>

            <div className="setting-item">
              <label>Statistics retention (days):</label>
              <input
                type="number"
                min="1"
                max="365"
                value={settings.statisticsRetention}
                onChange={(e) => handleInputChange('statisticsRetention', parseInt(e.target.value))}
              />
              <small>How long to keep bark detection statistics</small>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleReset}>
            Reset to Defaults
          </button>
          <div className="button-group">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;