# 🐕 DogTektor

AI/ML powered desktop application for real-time dog bark detection and analysis. Perfect for monitoring barking patterns, identifying different dogs, and generating insights about canine activity in your area.

## Features

- **Real-time Audio Detection**: Continuous monitoring using your microphone
- **AI-Powered Bark Recognition**: Machine learning algorithms to distinguish dog barks from other sounds
- **Dog Identification**: Segment and classify barks from different dogs
- **Statistics & Analytics**: Track barking frequency, patterns, and trends over time
- **Cross-platform Desktop App**: Built with Electron for Windows, macOS, and Linux
- **Raspberry Pi Ready**: Optimized for deployment on embedded devices
- **User-Friendly Interface**: Modern React-based UI with real-time visualizations

## Screenshots

*Coming soon - app screenshots will be added here*

## Technology Stack

- **Desktop Framework**: Electron
- **Frontend**: React with modern JavaScript
- **Audio Processing**: Web Audio API
- **Machine Learning**: TensorFlow.js (future integration)
- **Build Tool**: Vite
- **Styling**: Modern CSS with gradient themes

## Quick Start

### Prerequisites

- Node.js 16 or higher
- npm or yarn package manager
- Microphone access permissions

### Installation

1. Clone the repository:
```bash
git clone https://github.com/elemarin/dogtektor.git
cd dogtektor
```

2. Install dependencies:
```bash
npm install
```

3. Start in development mode:
```bash
npm run dev
```

4. In a new terminal, start the Electron app:
```bash
npm start
```

### Building for Production

```bash
# Build the renderer
npm run build:renderer

# Package the app
npm run dist
```

## Usage

1. **Launch the Application**: Start DogTektor from your applications folder or run `npm start`

2. **Grant Microphone Permissions**: Allow the app to access your microphone when prompted

3. **Configure Settings**: 
   - Click the settings menu (File → Settings or Cmd/Ctrl+,)
   - Select your preferred microphone
   - Adjust sensitivity and detection thresholds
   - Configure notification preferences

4. **Start Detection**: Click "Start Detection" or use Cmd/Ctrl+Space

5. **Monitor Results**: 
   - View real-time audio visualization
   - See detected dogs and their bark counts
   - Analyze hourly activity patterns

## Configuration

### Audio Settings
- **Microphone Selection**: Choose from available audio input devices
- **Sensitivity**: Adjust detection sensitivity (0-100%)
- **Bark Threshold**: Minimum confidence level for bark detection

### Detection Settings
- **Auto-naming**: Automatically assign names to detected dogs
- **Notifications**: System notifications for bark detection
- **Statistics Retention**: How long to keep historical data

## Development

### Project Structure
```
src/
├── main.js              # Electron main process
├── preload.js           # Electron preload script
├── index.html           # Main HTML template
└── renderer/
    ├── App.jsx          # Main React application
    ├── components/      # React components
    │   ├── AudioVisualizer.jsx
    │   ├── BarkStats.jsx
    │   ├── DetectionControls.jsx
    │   └── Settings.jsx
    └── styles/          # CSS stylesheets
        └── App.css
```

### Available Scripts

- `npm start` - Start Electron app
- `npm run dev` - Start Electron in development mode
- `npm run dev:renderer` - Start Vite dev server
- `npm run build:renderer` - Build React app
- `npm run build` - Build complete application
- `npm run dist` - Package for distribution
- `npm run lint` - Run ESLint
- `npm test` - Run tests

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- [ ] **Enhanced ML Models**: Integrate TensorFlow.js for improved bark detection
- [ ] **Dog Voice Recognition**: Advanced algorithms to identify individual dogs
- [ ] **Cloud Sync**: Optional cloud storage for statistics and settings
- [ ] **Mobile Companion**: React Native app for remote monitoring
- [ ] **Smart Notifications**: Intelligent alerts based on patterns
- [ ] **Audio Export**: Save and analyze audio clips
- [ ] **Multiple Microphones**: Support for multiple input sources
- [ ] **API Integration**: Connect with smart home systems
- [ ] **Advanced Analytics**: Machine learning insights on bark patterns

## Hardware Requirements

### Minimum Requirements
- 2GB RAM
- 1GB available disk space
- Microphone input
- Audio output (speakers/headphones)

### Recommended for Raspberry Pi
- Raspberry Pi 4 (4GB RAM recommended)
- External USB microphone for better audio quality
- Class 10 microSD card (32GB+)

## Troubleshooting

### Common Issues

**Microphone not detected**
- Check system permissions for microphone access
- Ensure microphone is properly connected
- Restart the application

**No barks detected**
- Adjust sensitivity settings
- Check microphone levels
- Verify microphone is working with other applications

**Performance issues**
- Close other resource-intensive applications
- Lower the detection sensitivity
- Check available system memory

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with ❤️ for dog lovers everywhere
- Inspired by the need to understand our furry friends better
- Thanks to the open-source community for amazing tools and libraries

## Support

- 📧 Email: [Your Email]
- 🐛 Issues: [GitHub Issues](https://github.com/elemarin/dogtektor/issues)
- 📖 Wiki: [Project Wiki](https://github.com/elemarin/dogtektor/wiki)

---

*"Understanding our dogs, one bark at a time."* 🐕
