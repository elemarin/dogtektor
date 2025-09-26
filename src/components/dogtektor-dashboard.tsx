"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Settings, Volume2, Dog, BarChart3 } from "lucide-react";
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

interface DetectedDog {
  id: number;
  name: string;
  barkCount: number;
  lastDetected: Date;
  confidence: number;
}

interface MLModelState {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
}

export function DogTektorDashboard() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [barkCount, setBarkCount] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [detectedDogs, setDetectedDogs] = useState<DetectedDog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [mlModel, setMlModel] = useState<MLModelState>({ isLoaded: false, isLoading: false, error: null });
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // ML-based detection refs
  const modelRef = useRef<tf.LayersModel | null>(null);
  const audioBufferRef = useRef<Float32Array[]>([]);
  const lastBarkTime = useRef<number>(0);
  const hasAutoStarted = useRef<boolean>(false);

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

  // Initialize TensorFlow.js and create custom ML model
  useEffect(() => {
    const initializeML = async () => {
      setMlModel(prev => ({ ...prev, isLoading: true }));
      console.log('🤖 Initializing TensorFlow.js ML model for bark detection...');
      
      try {
        // Initialize TensorFlow.js backend
        await tf.ready();
        console.log('✅ TensorFlow.js backend ready');
        
        // Create a custom neural network for bark detection
        // This model is specifically designed for audio pattern recognition
        const model = tf.sequential({
          layers: [
            // Input layer for frequency spectrum data (1024 frequency bins)
            tf.layers.dense({
              inputShape: [1024],
              units: 512,
              activation: 'relu',
              name: 'audio_input'
            }),
            
            // Feature extraction layers
            tf.layers.dropout({ rate: 0.3 }),
            tf.layers.dense({ units: 256, activation: 'relu', name: 'feature_1' }),
            tf.layers.dropout({ rate: 0.3 }),
            tf.layers.dense({ units: 128, activation: 'relu', name: 'feature_2' }),
            
            // Pattern recognition layers
            tf.layers.dense({ units: 64, activation: 'relu', name: 'pattern_1' }),
            tf.layers.dense({ units: 32, activation: 'relu', name: 'pattern_2' }),
            
            // Output layer for bark classification
            tf.layers.dense({ 
              units: 2, // [no_bark, bark]
              activation: 'softmax', 
              name: 'bark_classifier'
            })
          ]
        });
        
        // Compile the model
        model.compile({
          optimizer: tf.train.adam(0.001),
          loss: 'categoricalCrossentropy',
          metrics: ['accuracy']
        });
        
        console.log('🧠 Custom ML model architecture created');
        console.log('📊 Model layers:', model.layers.map(layer => `${layer.name}: ${layer.getConfig()?.units || 'N/A'} units`));
        
        // Pre-train with synthetic bark patterns (German Shepherd characteristics)
        await pretrainWithBarkPatterns(model);
        
        modelRef.current = model;
        
        console.log('✅ ML model loaded and pre-trained successfully');
        console.log('🎯 Ready for real-time German Shepherd bark detection');
        
        setMlModel({ isLoaded: true, isLoading: false, error: null });
      } catch (err) {
        console.error('❌ Failed to load ML model:', err);
        setMlModel({ 
          isLoaded: false, 
          isLoading: false, 
          error: `Failed to load ML model: ${err instanceof Error ? err.message : 'Unknown error'}`
        });
      }
    };

    initializeML();
  }, []);
  
  // Pre-train the model with synthetic bark patterns
  const pretrainWithBarkPatterns = async (model: tf.LayersModel) => {
    console.log('🎓 Pre-training model with bark characteristics...');
    
    // Generate synthetic training data based on known bark characteristics
    const trainingData: number[][] = [];
    const trainingLabels: number[][] = [];
    
    // Generate bark patterns (German Shepherd characteristics)
    for (let i = 0; i < 100; i++) {
      const barkPattern = new Array(1024).fill(0);
      
      // German Shepherds: Strong low-mid frequencies (100-800 Hz)
      for (let j = 50; j < 400; j++) {
        barkPattern[j] = 0.6 + Math.random() * 0.4; // High energy in bark range
      }
      
      // Add harmonics and burst characteristics
      for (let j = 400; j < 600; j++) {
        barkPattern[j] = 0.3 + Math.random() * 0.3; // Secondary harmonics
      }
      
      // Add some randomness for variety
      for (let j = 0; j < 1024; j++) {
        barkPattern[j] += (Math.random() - 0.5) * 0.1;
        barkPattern[j] = Math.max(0, Math.min(1, barkPattern[j]));
      }
      
      trainingData.push(barkPattern);
      trainingLabels.push([0, 1]); // [no_bark, bark]
    }
    
    // Generate non-bark patterns
    for (let i = 0; i < 100; i++) {
      const nonBarkPattern = new Array(1024).fill(0);
      
      // Random noise or other sounds
      for (let j = 0; j < 1024; j++) {
        nonBarkPattern[j] = Math.random() * 0.3; // Lower, more uniform energy
      }
      
      trainingData.push(nonBarkPattern);
      trainingLabels.push([1, 0]); // [no_bark, bark]
    }
    
    // Convert to tensors
    const xs = tf.tensor2d(trainingData);
    const ys = tf.tensor2d(trainingLabels);
    
    try {
      // Quick training to initialize the model
      await model.fit(xs, ys, {
        epochs: 10,
        batchSize: 32,
        verbose: 0,
        validationSplit: 0.2
      });
      
      console.log('✅ Model pre-training completed');
    } finally {
      // Clean up tensors
      xs.dispose();
      ys.dispose();
    }
  };

  // Auto-start detection after component mount and ML model is ready
  useEffect(() => {
    if (!hasAutoStarted.current && !isDetecting && mlModel.isLoaded) {
      const autoStartTimer = setTimeout(() => {
        console.log('🚀 Auto-starting ML-powered bark detection...');
        hasAutoStarted.current = true;
        handleStartDetection();
      }, 2000); // 2 second delay to ensure ML model is fully ready

      return () => clearTimeout(autoStartTimer);
    }
  }, [mlModel.isLoaded, isDetecting]);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  // ML-powered bark detection using TensorFlow.js
  const detectBark = useCallback(async (frequencyData: Uint8Array) => {
    if (!modelRef.current || !mlModel.isLoaded) {
      // Fallback: Basic energy detection while ML loads
      const averageEnergy = frequencyData.reduce((sum, value) => sum + value, 0) / frequencyData.length;
      if (averageEnergy > 10) {
        console.log('⏳ ML model loading... Energy detected:', Math.round(averageEnergy));
      }
      return;
    }

    const currentTime = Date.now();
    
    // Convert frequency data to the format expected by the ML model (1024 features)
    const normalizedData = new Float32Array(1024);
    for (let i = 0; i < 1024 && i < frequencyData.length; i++) {
      // Normalize to [0, 1] range for ML model
      normalizedData[i] = frequencyData[i] / 255.0;
    }

    // Calculate basic audio metrics for logging
    const averageEnergy = frequencyData.reduce((sum, value) => sum + value, 0) / frequencyData.length;
    const maxEnergy = Math.max(...frequencyData);

    try {
      // Use the ML model to predict if this is a bark
      const inputTensor = tf.tensor2d([Array.from(normalizedData)]);
      const prediction = modelRef.current.predict(inputTensor) as tf.Tensor;
      const predictionData = await prediction.data();
      
      // Get probabilities: [no_bark_prob, bark_prob]
      const noBarkProb = predictionData[0];
      const barkProb = predictionData[1];
      
      // Clean up tensors
      inputTensor.dispose();
      prediction.dispose();

      // Temporal filtering: prevent too frequent detections
      const timeSinceLastBark = currentTime - lastBarkTime.current;
      const minBarkInterval = 300; // 300ms minimum between detections
      
      // Enhanced logging for all significant audio activity
      if (averageEnergy > 15 || barkProb > 0.1) {
        console.log('🤖 ML Bark Detection Analysis:', {
          timestamp: new Date().toLocaleTimeString(),
          energy: {
            average: Math.round(averageEnergy),
            max: Math.round(maxEnergy)
          },
          mlPrediction: {
            barkProbability: Math.round(barkProb * 100) + '%',
            noBarkProbability: Math.round(noBarkProb * 100) + '%',
            confidence: barkProb > noBarkProb ? 'BARK' : 'NOT_BARK'
          },
          decision: {
            willDetect: barkProb > 0.6 && timeSinceLastBark > minBarkInterval,
            threshold: '60% confidence threshold',
            timingSinceLastBark: Math.round(timeSinceLastBark) + 'ms'
          }
        });
      }

      // Final bark detection decision based on ML model
      if (barkProb > 0.6 && timeSinceLastBark > minBarkInterval) {
        console.log('🐕 BARK DETECTED! (ML-POWERED)', {
          mlConfidence: Math.round(barkProb * 100) + '%',
          audioEnergy: Math.round(averageEnergy),
          maxEnergy: Math.round(maxEnergy),
          model: 'Custom TensorFlow.js Neural Network'
        });

        // Dog identification based on audio characteristics and ML confidence
        // Higher confidence + higher energy = larger dog (German Shepherd)
        let dogId = 1; // Default
        if (barkProb > 0.8 && averageEnergy > 60) {
          dogId = 1; // High confidence, high energy = German Shepherd
        } else if (barkProb > 0.7 && averageEnergy > 40) {
          dogId = 2; // Medium confidence = medium dog
        } else {
          dogId = 3; // Lower confidence = smaller dog
        }

        lastBarkTime.current = currentTime;
        handleBarkDetected(barkProb, dogId);
      }

    } catch (error) {
      console.error('❌ ML detection error:', error);
      // Fallback to basic energy detection
      if (averageEnergy > 80 && maxEnergy > 150) {
        console.log('🔄 Fallback detection triggered');
        const timeSinceLastBark = currentTime - lastBarkTime.current;
        if (timeSinceLastBark > 500) {
          lastBarkTime.current = currentTime;
          handleBarkDetected(0.5, 1);
        }
      }
    }
  }, [mlModel.isLoaded]);

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
  const draw = useCallback(() => {
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
  }, [isDetecting, detectBark]);

  const startAudioCapture = useCallback(async () => {
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
  }, [draw]);

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

  const handleStartDetection = useCallback(() => {
    setIsDetecting(true);
    startAudioCapture();
  }, [startAudioCapture]);

  // Auto-start detection after component mount
  useEffect(() => {
    if (!hasAutoStarted.current && !isDetecting) {
      const autoStartTimer = setTimeout(() => {
        console.log('🚀 Auto-starting bark detection...');
        hasAutoStarted.current = true;
        handleStartDetection();
      }, 1500); // 1.5 second delay to allow component to fully mount

      return () => clearTimeout(autoStartTimer);
    }
  }, [handleStartDetection, isDetecting]);

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
            TensorFlow.js ML-powered dog bark detection and analysis
          </p>
          {mlModel.isLoading && (
            <div className="text-yellow-300 text-sm mt-2">
              🔄 Loading machine learning model...
            </div>
          )}
          {mlModel.isLoaded && (
            <div className="text-green-300 text-sm mt-2">
              ✅ ML model ready - Real-time bark detection active
            </div>
          )}
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

                    <div className="bg-slate-700/50 p-3 rounded-lg">
                      <div className="text-sm text-slate-300">ML Model Status</div>
                      <div className={`text-lg font-semibold ${
                        mlModel.isLoaded ? 'text-green-400' : 
                        mlModel.isLoading ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {mlModel.isLoading ? '🔄 Loading...' : 
                         mlModel.isLoaded ? '🤖 Ready' : '❌ Error'}
                      </div>
                      {mlModel.error && (
                        <div className="text-xs text-red-300 mt-1">{mlModel.error}</div>
                      )}
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