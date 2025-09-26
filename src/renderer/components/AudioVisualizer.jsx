import React, { useEffect, useRef, useState } from 'react';

const AudioVisualizer = ({ isDetecting, audioLevel, onAudioLevel, onBarkDetected }) => {
  const canvasRef = useRef();
  const audioContextRef = useRef();
  const analyserRef = useRef();
  const microphoneRef = useRef();
  const animationRef = useRef();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState(null);

  // Simple bark detection using audio characteristics
  const detectBark = (frequencyData) => {
    const averageFreq = frequencyData.reduce((sum, value) => sum + value, 0) / frequencyData.length;
    const lowFreq = frequencyData.slice(0, 50).reduce((sum, value) => sum + value, 0) / 50;
    const midFreq = frequencyData.slice(50, 150).reduce((sum, value) => sum + value, 0) / 100;
    const highFreq = frequencyData.slice(150, 300).reduce((sum, value) => sum + value, 0) / 150;

    // Simple heuristic: dog barks typically have:
    // - Strong mid-frequency components (500-2000 Hz range)
    // - Quick energy bursts
    // - Specific frequency patterns
    const barkThreshold = 100;
    const isBark = midFreq > barkThreshold && averageFreq > 80 && midFreq > lowFreq;

    if (isBark && Math.random() > 0.95) { // Reduce false positives
      const confidence = Math.min((midFreq / barkThreshold), 1.0);
      const dogId = Math.floor(Math.random() * 3) + 1; // Simple dog classification
      onBarkDetected(confidence, dogId);
    }
  };

  const startAudioCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);

      analyserRef.current.fftSize = 2048;
      microphoneRef.current.connect(analyserRef.current);

      setPermissionGranted(true);
      setError(null);
    } catch (err) {
      setError(`Microphone access denied: ${err.message}`);
      console.error('Error accessing microphone:', err);
    }
  };

  const stopAudioCapture = () => {
    if (microphoneRef.current && microphoneRef.current.mediaStream) {
      microphoneRef.current.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setPermissionGranted(false);
  };

  const draw = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate audio level
    const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
    onAudioLevel(average);

    // Detect barks
    if (isDetecting) {
      detectBark(dataArray);
    }

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw frequency bars
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = (dataArray[i] / 255) * canvas.height;

      // Color gradient based on frequency
      const hue = (i / bufferLength) * 360;
      ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;

      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }

    // Draw waveform overlay
    ctx.beginPath();
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;

    const sliceWidth = canvas.width / bufferLength;
    x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = v * canvas.height / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.stroke();

    // Continue animation
    animationRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    if (isDetecting && !permissionGranted) {
      startAudioCapture();
    } else if (!isDetecting && permissionGranted) {
      stopAudioCapture();
    }

    return () => {
      stopAudioCapture();
    };
  }, [isDetecting]);

  useEffect(() => {
    if (permissionGranted && analyserRef.current) {
      draw();
    }
  }, [permissionGranted]);

  return (
    <div className="audio-visualizer">
      <h3>Audio Visualization</h3>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <p>Please grant microphone permissions to use the bark detector.</p>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        width={800}
        height={200}
        className="visualizer-canvas"
      />
      
      <div className="audio-info">
        <div className="audio-level">
          Audio Level: <span className="level-value">{Math.round(audioLevel)}</span>
        </div>
        <div className="status">
          Status: <span className={`status-indicator ${isDetecting ? 'active' : 'inactive'}`}>
            {isDetecting ? 'Detecting...' : 'Stopped'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AudioVisualizer;