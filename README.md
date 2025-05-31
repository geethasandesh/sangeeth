# 🎵 Sangeeth - Your Free Music Player

Sangeeth is a modern music player application built with React Native and Firebase, offering a seamless music listening experience with mood-based song filtering and a beautiful user interface.

## ✨ Features

- 🎧 Music playback with background audio support
- 🎨 Beautiful dark theme UI
- 🎯 Mood-based song filtering
- 📱 Cross-platform (iOS & Android)
- 🔐 User authentication
- 📚 Library management
- ❤️ Like and favorite songs
- 📋 Playlist support
- 🔄 Recently played tracking

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/geethasandesh/sangeeth.git
cd sangeeth
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a Firebase project and add your configuration:
   - Create a new project in Firebase Console
   - Enable Authentication and Firestore
   - Add your Firebase configuration to `firebaseConfig.js`

4. Start the development server:
```bash
npm start
# or
yarn start
```

## 📱 App Structure

```
sangeeth/
├── assets/           # Images and static assets
├── components/       # Reusable UI components
├── context/         # React Context providers
├── navigation/      # Navigation configuration
├── screens/         # App screens
└── utils/           # Utility functions and helpers
```

## 🔧 Configuration

### Firebase Setup

1. Create a new Firebase project
2. Enable Email/Password authentication
3. Set up Firestore database
4. Add your Firebase configuration to `firebaseConfig.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

## 🎨 Features in Detail

### Mood-Based Filtering
- Filter songs by mood (Happy, Sad, Energetic, Relaxed, Romantic, Focused)
- Intuitive mood selection interface
- Real-time song filtering

### Music Player
- Background audio playback
- Playlist management
- Like/unlike songs
- Recently played tracking
- Shuffle and repeat modes

### User Features
- User authentication
- Profile management
- Library organization
- Playlist creation and management

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Geetha Sandesh** - *Initial work* - [geethasandesh](https://github.com/geethasandesh)

## 🙏 Acknowledgments

- React Native community
- Expo team
- Firebase team
- All contributors and supporters 