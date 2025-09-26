import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import AudioVisualizer from './components/AudioVisualizer';
import BarkStats from './components/BarkStats';
import Settings from './components/Settings';
import DetectionControls from './components/DetectionControls';
import './styles/App.css';

function App() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [barkCount, setBarkCount] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [detectedDogs, setDetectedDogs] = useState([]);

  useEffect(() => {
    // Listen for menu events from main process
    if (window.electronAPI) {
      window.electronAPI.onOpenSettings(() => {
        setShowSettings(true);
      });

      window.electronAPI.onToggleDetection(() => {
        setIsDetecting(!isDetecting);
      });

      window.electronAPI.onStopDetection(() => {
        setIsDetecting(false);
      });
    }

    return () => {
      // Cleanup listeners
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('open-settings');
        window.electronAPI.removeAllListeners('toggle-detection');
        window.electronAPI.removeAllListeners('stop-detection');
      }
    };
  }, [isDetecting]);

  const handleStartDetection = () => {
    setIsDetecting(true);
  };

  const handleStopDetection = () => {
    setIsDetecting(false);
  };

  const handleBarkDetected = (confidence, dogId) => {
    setBarkCount(prev => prev + 1);
    
    // Update detected dogs list
    setDetectedDogs(prev => {
      const existing = prev.find(dog => dog.id === dogId);
      if (existing) {
        return prev.map(dog => 
          dog.id === dogId 
            ? { ...dog, barkCount: dog.barkCount + 1, lastDetected: new Date() }
            : dog
        );
      } else {
        return [...prev, {
          id: dogId,
          name: `Dog ${dogId}`,
          barkCount: 1,
          lastDetected: new Date(),
          confidence
        }];
      }
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🐕 DogTektor</h1>
        <p>AI-powered dog bark detection and analysis</p>
      </header>

      <main className="app-main">
        <div className="control-panel">
          <DetectionControls
            isDetecting={isDetecting}
            onStart={handleStartDetection}
            onStop={handleStopDetection}
            barkCount={barkCount}
          />
        </div>

        <div className="visualization-panel">
          <AudioVisualizer
            isDetecting={isDetecting}
            audioLevel={audioLevel}
            onAudioLevel={setAudioLevel}
            onBarkDetected={handleBarkDetected}
          />
        </div>

        <div className="stats-panel">
          <BarkStats
            detectedDogs={detectedDogs}
            totalBarks={barkCount}
          />
        </div>
      </main>

      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          onSave={(settings) => {
            if (window.electronAPI) {
              window.electronAPI.saveSettings(settings);
            }
            setShowSettings(false);
          }}
        />
      )}
    </div>
  );
}

// Initialize the React app
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);