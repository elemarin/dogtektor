"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Settings, Volume2, Dog, BarChart3 } from "lucide-react";

interface DetectedDog {
  id: number;
  name: string;
  barkCount: number;
  lastDetected: Date;
  confidence: number;
}

export function DogTektorDashboard() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [barkCount, setBarkCount] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [detectedDogs, setDetectedDogs] = useState<DetectedDog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sessionTime, setSessionTime] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Temporal analysis for better detection
  const recentDetections = useRef<Array<{ time: number; energy: number; spectral: number }>>([]);
  const lastBarkTime = useRef<number>(0);

  // Session timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isDetecting) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    } else {
      setSessionTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isDetecting]);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Enhanced bark detection algorithm with temporal analysis
  const detectBark = (frequencyData: Uint8Array) => {
    const currentTime = Date.now();
    const averageFreq = frequencyData.reduce((sum, value) => sum + value, 0) / frequencyData.length;
    const lowFreq = frequencyData.slice(0, 50).reduce((sum, value) => sum + value, 0) / 50;
    const midFreq = frequencyData.slice(50, 150).reduce((sum, value) => sum + value, 0) / 100;
    const highFreq = frequencyData.slice(150, 300).reduce((sum, value) => sum + value, 0) / 150;
    
    // Calculate energy and spectral characteristics
    const totalEnergy = frequencyData.reduce((sum, value) => sum + (value * value), 0);
    const spectralCentroid = frequencyData.reduce((sum, value, index) => sum + (value * index), 0) / frequencyData.reduce((sum, value) => sum + value, 0) || 0;
    
    // Clean up old detections (older than 2 seconds)
    recentDetections.current = recentDetections.current.filter(d => currentTime - d.time < 2000);
    
    // Enhanced bark detection using multiple criteria
    const energyThreshold = 40000; // Adjusted for better sensitivity
    const barkThreshold = 75; // Further lowered for playback audio
    const minAverageFreq = 50; // More sensitive threshold
    
    // Bark characteristics: strong mid frequencies, decent energy, proper spectral balance
    const hasStrongMidFreq = midFreq > barkThreshold;
    const hasGoodEnergy = totalEnergy > energyThreshold;
    const hasProperBalance = midFreq > lowFreq && midFreq > highFreq * 0.7;
    const hasGoodAverage = averageFreq > minAverageFreq;
    const hasReasonableSpectrum = spectralCentroid > 20 && spectralCentroid < 250;
    
    // Temporal filtering: prevent too frequent detections (debouncing)
    const timeSinceLastBark = currentTime - lastBarkTime.current;
    const minBarkInterval = 200; // Minimum 200ms between barks
    
    // Combined detection criteria
    const isBark = hasStrongMidFreq && hasGoodEnergy && hasProperBalance && hasGoodAverage && hasReasonableSpectrum && timeSinceLastBark > minBarkInterval;
    
    // Add current detection data for pattern analysis
    recentDetections.current.push({
      time: currentTime,
      energy: totalEnergy,
      spectral: spectralCentroid
    });
    
    if (isBark) {
      // Calculate confidence based on multiple factors
      const energyConfidence = Math.min(totalEnergy / (energyThreshold * 4), 1.0);
      const freqConfidence = Math.min(midFreq / (barkThreshold * 1.8), 1.0);
      const balanceConfidence = Math.min(midFreq / Math.max(lowFreq, highFreq, 1), 1.0);
      
      // Temporal confidence: consider recent detection patterns
      const recentHighEnergy = recentDetections.current.filter(d => d.energy > energyThreshold * 0.7).length;
      const temporalConfidence = Math.min(recentHighEnergy / 3, 1.0);
      
      const confidence = (energyConfidence + freqConfidence + balanceConfidence + temporalConfidence) / 4;
      
      // Enhanced dog identification based on spectral and temporal characteristics
      const spectralRange = Math.floor((spectralCentroid - 20) / 40) % 3;
      const energyRange = Math.floor(totalEnergy / 100000) % 3;
      const dogId = ((spectralRange + energyRange) % 3) + 1;
      
      lastBarkTime.current = currentTime;
      handleBarkDetected(confidence, dogId);
    }
  };

  const handleBarkDetected = (confidence: number, dogId: number) => {
    setBarkCount(prev => prev + 1);
    
    setDetectedDogs(prev => {
      const existing = prev.find(dog => dog.id === dogId);
      if (existing) {
        return prev.map(dog => 
          dog.id === dogId 
            ? { ...dog, barkCount: dog.barkCount + 1, lastDetected: new Date(), confidence }
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

  // Audio visualization
  const draw = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate audio level
    const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
    setAudioLevel(average);

    // Detect barks
    if (isDetecting) {
      detectBark(dataArray);
    }

    // Clear canvas
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw frequency bars
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = (dataArray[i] / 255) * canvas.height;

      // Color gradient
      const hue = (i / bufferLength) * 360;
      ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;

      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }

    // Continue animation
    animationRef.current = requestAnimationFrame(draw);
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

      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);

      analyserRef.current.fftSize = 2048;
      microphoneRef.current.connect(analyserRef.current);

      setError(null);
      draw();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Microphone access denied: ${errorMessage}`);
      console.error('Error accessing microphone:', err);
    }
  };

  const stopAudioCapture = () => {
    if (microphoneRef.current) {
      const source = microphoneRef.current as MediaStreamAudioSourceNode & { mediaStream?: MediaStream };
      if (source.mediaStream) {
        source.mediaStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setAudioLevel(0);
  };

  const handleStartDetection = () => {
    setIsDetecting(true);
    startAudioCapture();
  };

  const handleStopDetection = () => {
    setIsDetecting(false);
    stopAudioCapture();
  };

  const handleReset = () => {
    setBarkCount(0);
    setDetectedDogs([]);
    setSessionTime(0);
    setError(null);
  };

  // Calculate hourly stats
  const currentHour = new Date().getHours();
  const currentHourBarks = detectedDogs.reduce((sum, dog) => {
    return dog.lastDetected.getHours() === currentHour ? sum + dog.barkCount : sum;
  }, 0);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🐕 DogTektor
          </h1>
          <p className="text-blue-200 text-lg">
            AI-powered dog bark detection and analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Detection Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Start/Stop Button */}
                  <Button
                    onClick={isDetecting ? handleStopDetection : handleStartDetection}
                    variant={isDetecting ? "destructive" : "default"}
                    size="lg"
                    className="w-full"
                  >
                    {isDetecting ? (
                      <>
                        <MicOff className="h-4 w-4 mr-2" />
                        Stop Detection
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        Start Detection
                      </>
                    )}
                  </Button>

                  {/* Stats */}
                  <div className="space-y-3">
                    <div className="bg-slate-700/50 p-3 rounded-lg">
                      <div className="text-sm text-slate-300">Total Barks</div>
                      <div className="text-2xl font-bold text-green-400">{barkCount}</div>
                    </div>
                    
                    <div className="bg-slate-700/50 p-3 rounded-lg">
                      <div className="text-sm text-slate-300">Status</div>
                      <div className={`text-lg font-semibold ${isDetecting ? 'text-red-400' : 'text-slate-400'}`}>
                        {isDetecting ? '🔴 Recording' : '⚪ Stopped'}
                      </div>
                    </div>

                    <div className="bg-slate-700/50 p-3 rounded-lg">
                      <div className="text-sm text-slate-300">Session Duration</div>
                      <div className="text-lg font-semibold text-blue-400">{formatTime(sessionTime)}</div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleReset} className="flex-1">
                      🔄 Reset
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-4 w-4 mr-1" />
                      Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visualization Panel */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Audio Visualization
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-4">
                    <p className="text-red-200 font-medium">{error}</p>
                    <p className="text-red-300 text-sm mt-1">
                      Please grant microphone permissions to use the bark detector.
                    </p>
                  </div>
                )}
                
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={200}
                  className="w-full h-48 bg-slate-900 rounded-lg border border-slate-600"
                />
                
                <div className="flex justify-between items-center mt-4 text-sm">
                  <div className="text-slate-300">
                    Audio Level: <span className="text-green-400 font-semibold">{Math.round(audioLevel)}</span>
                  </div>
                  <div className="text-slate-300">
                    Status: <span className={`font-semibold ${isDetecting ? 'text-red-400' : 'text-slate-400'}`}>
                      {isDetecting ? 'Detecting...' : 'Stopped'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Panel */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur mt-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Dog className="h-5 w-5" />
                  Bark Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-700/50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-400">{barkCount}</div>
                    <div className="text-sm text-slate-300">Total Barks</div>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-400">{currentHourBarks}</div>
                    <div className="text-sm text-slate-300">This Hour</div>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-400">{detectedDogs.length}</div>
                    <div className="text-sm text-slate-300">Dogs Detected</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-3">Detected Dogs</h4>
                  {detectedDogs.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">
                      No dogs detected yet. Start detection to see results.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {detectedDogs.map(dog => (
                        <div key={dog.id} className="bg-slate-700/50 p-3 rounded-lg flex justify-between items-center">
                          <div>
                            <div className="text-white font-medium">{dog.name}</div>
                            <div className="text-sm text-slate-300">
                              <span className="text-green-400">{dog.barkCount} barks</span> • 
                              <span className="text-blue-400 ml-1">{Math.round(dog.confidence * 100)}% confidence</span>
                            </div>
                            <div className="text-xs text-slate-400">
                              Last: {dog.lastDetected.toLocaleTimeString()}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">✏️</Button>
                            <Button variant="ghost" size="sm">🗑️</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}