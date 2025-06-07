# Tavus Interactions Protocol POC

A React-based proof of concept application for testing real-time interactions with Tavus digital replicas using the Daily.co video infrastructure.

## Features

- Real-time video conversation with Tavus digital replicas
- Interactive chat interface
- Connection status monitoring
- Message logging and conversation history
- Responsive UI with modern design

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Tavus account with access to conversation URLs
- Daily.co integration (handled automatically)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Tavus_interaction_protocol_poc
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open in your browser at `http://localhost:3000`.

## Usage

1. **Configure Connection**: Enter your Tavus conversation URL and conversation ID in the configuration section
2. **Connect**: Click the "Connect" button to establish a connection with your digital replica
3. **Interact**: Use the chat interface to send messages and interact with your replica
4. **Monitor**: View connection status and conversation logs in real-time

## Technology Stack

- **React** - Frontend framework
- **TypeScript** - Type safety and development experience
- **Daily.co** - Video infrastructure and WebRTC handling
- **Lucide React** - Icon library
- **Tailwind CSS** - Styling framework

## Project Structure

```
src/
├── App.tsx              # Main application component
├── TavusPOC.tsx         # Core POC functionality
├── index.tsx            # React entry point
└── index.css            # Global styles
```

## Configuration

The application requires:
- **Conversation URL**: The Daily.co room URL provided by Tavus
- **Conversation ID**: Unique identifier for your conversation session

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Key Components

- **TavusPOC**: Main component handling video connection and chat interface
- **Daily Integration**: Manages WebRTC connections and video streaming
- **Message System**: Handles bidirectional communication with replicas

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues related to:
- **Tavus Platform**: Contact Tavus support
- **Daily.co Integration**: Check Daily.co documentation
- **This POC**: Create an issue in this repository
