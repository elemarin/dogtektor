# 🐕 DogTektor

AI/ML powered web application for real-time dog bark detection and analysis. Built with Next.js 15, TypeScript, and shadcn/ui for modern web-based monitoring of canine activity.

## Features

- **Real-time Audio Detection**: Continuous monitoring using your browser's microphone
- **AI-Powered Bark Recognition**: Machine learning algorithms to distinguish dog barks from other sounds  
- **Dog Identification**: Segment and classify barks from different dogs
- **Statistics & Analytics**: Track barking frequency, patterns, and trends over time
- **Modern Web Interface**: Built with Next.js 15, TypeScript, and shadcn/ui components
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Visualization**: Live audio frequency spectrum display

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Audio Processing**: Web Audio API
- **State Management**: React hooks
- **Icons**: Lucide React

## Quick Start

### Prerequisites

- Node.js 18 or higher
- Modern web browser with microphone support
- Microphone permissions

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

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Usage

1. **Open the Application**: Navigate to the web app in your browser

2. **Grant Microphone Permissions**: Allow the app to access your microphone when prompted

3. **Start Detection**: Click "Start Detection" to begin monitoring

4. **Monitor Results**: 
   - View real-time audio visualization
   - See detected dogs and their bark counts
   - Analyze session statistics

5. **Track Statistics**:
   - Monitor total barks detected
   - View barks per hour
   - Identify different dogs in your environment

## Features in Detail

### Real-time Audio Processing
- Captures microphone input using Web Audio API
- Displays live frequency spectrum visualization
- Processes audio for bark detection patterns

### Bark Detection Algorithm
- Analyzes audio frequency characteristics
- Identifies patterns typical of dog barks
- Filters out false positives from other sounds

### Dog Classification
- Assigns unique identifiers to different dogs
- Tracks individual bark counts and patterns
- Shows confidence levels for each detection

### Statistics Dashboard
- Real-time session statistics
- Hourly activity tracking  
- Individual dog monitoring
- Session duration tracking

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

*Note: Requires browsers that support Web Audio API and getUserMedia*

## Development

### Project Structure
```
src/
├── app/
│   ├── layout.tsx       # Root layout with metadata
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles with shadcn/ui variables
├── components/
│   ├── ui/              # shadcn/ui components
│   │   ├── button.tsx   # Button component
│   │   └── card.tsx     # Card components
│   └── dogtektor-dashboard.tsx  # Main app component
└── lib/
    └── utils.ts         # Utility functions for cn()
```

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding shadcn/ui Components

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- [ ] **Enhanced ML Models**: Advanced bark detection algorithms using TensorFlow.js
- [ ] **Dog Voice Recognition**: Improved individual dog identification  
- [ ] **Data Export**: CSV/JSON export of statistics
- [ ] **Settings Panel**: Configurable detection parameters
- [ ] **Notifications**: Browser notifications for bark events
- [ ] **Historical Data**: Long-term bark pattern analysis
- [ ] **PWA Support**: Progressive Web App capabilities
- [ ] **Multi-language Support**: Internationalization

## Troubleshooting

### Common Issues

**Microphone not detected**
- Ensure browser has microphone permissions
- Check if microphone is being used by other applications
- Try refreshing the page

**No barks detected**
- Verify microphone is working with other applications
- Check if there are actual dog sounds in the environment
- Audio levels might be too low

**Performance issues**
- Close other resource-intensive browser tabs
- Use Chrome/Chromium for best performance
- Ensure sufficient system memory

## Privacy & Security

- All audio processing happens locally in your browser
- No audio data is transmitted to external servers
- No personal data is collected or stored
- Microphone access can be revoked at any time

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with ❤️ for dog lovers everywhere
- Powered by modern web technologies
- Thanks to the open-source community for amazing tools and libraries

## Support

- 📧 Email: [Your Email]
- 🐛 Issues: [GitHub Issues](https://github.com/elemarin/dogtektor/issues)
- 📖 Docs: [Project Wiki](https://github.com/elemarin/dogtektor/wiki)

---

*"Understanding our dogs, one bark at a time."* 🐕
