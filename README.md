# Fins - Short Video Sharing App

A modern YouTube Shorts-like mobile application built with React Native and Node.js.

## 🌊 Features

### Core Features
- **Swipe Gestures**: 
  - Swipe right to like videos
  - Swipe left to go to next video  
  - Swipe down to view channel
- **User Authentication**: Complete signup/login system
- **Video Upload & Management**: Upload, edit, and manage your videos
- **Privacy Controls**: Set videos as public or private
- **Comments System**: Real-time commenting with replies
- **Subscriptions**: Follow your favorite creators
- **User Profiles**: Customizable profiles with bio, avatar, and stats

### Advanced Features
- **Interest-Based Algorithm**: Videos categorized by interests (Gaming, Music, Sports, Comedy, etc.)
- **Real-time Notifications**: Push notifications for likes, comments, and new followers
- **Search & Discovery**: Advanced search with filters
- **Video Editor**: Basic video editing tools
- **Analytics Dashboard**: Creator analytics and insights
- **Live Streaming**: Real-time video streaming capability

## 🏗️ Architecture

### Frontend (React Native)
- **Components**: Reusable UI components
- **Screens**: Main app screens (Home, Profile, Upload, etc.)
- **Navigation**: React Navigation for smooth transitions
- **State Management**: Redux Toolkit for state management
- **Animations**: Lottie and React Native Reanimated

### Backend (Node.js + Express)
- **API Routes**: RESTful API endpoints
- **Authentication**: JWT-based authentication
- **Database**: MongoDB with Mongoose ODM
- **File Storage**: AWS S3 for video and image storage
- **Real-time**: Socket.io for real-time features
- **Background Jobs**: Bull Queue for video processing

### Database (MongoDB)
- **Users**: User profiles and authentication
- **Videos**: Video metadata and engagement data
- **Comments**: Hierarchical comment system
- **Subscriptions**: User subscription relationships
- **Analytics**: User engagement and video performance data

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (v5+)
- React Native CLI
- Android Studio / Xcode
- AWS Account (for S3 storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fins-app.git
   cd fins-app
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend environment
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   
   # Frontend environment
   cd ../frontend
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the application**
   ```bash
   # Start backend server
   cd backend
   npm run dev
   
   # Start React Native app (in new terminal)
   cd frontend
   npm run android  # or npm run ios
   ```

## 📱 App Structure

```
Fins/
├── frontend/                 # React Native app
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── screens/          # App screens
│   │   ├── navigation/       # Navigation setup
│   │   ├── services/         # API services
│   │   ├── store/            # Redux store
│   │   └── utils/            # Utility functions
│   ├── android/              # Android specific code
│   ├── ios/                  # iOS specific code
│   └── package.json
├── backend/                  # Node.js server
│   ├── src/
│   │   ├── controllers/      # Route controllers
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Custom middleware
│   │   ├── services/         # Business logic
│   │   └── utils/            # Helper functions
│   ├── uploads/              # Temporary file storage
│   └── package.json
├── database/                 # Database scripts and migrations
├── docs/                     # Documentation
└── assets/                   # Static assets
```

## 🎯 Key Swipe Gestures

- **Right Swipe**: Like/Unlike video
- **Left Swipe**: Next video
- **Down Swipe**: View channel profile
- **Up Swipe**: Go back to previous video
- **Double Tap**: Like video
- **Long Press**: Save video

## 🔧 Configuration

### Backend Configuration (.env)
```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/fins
JWT_SECRET=your-jwt-secret
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_BUCKET_NAME=fins-videos
```

### Frontend Configuration (.env)
```
API_BASE_URL=http://localhost:3000/api
SOCKET_URL=http://localhost:3000
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚢 Deployment

### Backend (Heroku/AWS)
```bash
cd backend
npm run build
npm start
```

### Frontend (App Store/Play Store)
```bash
cd frontend
npm run build:android
npm run build:ios
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React Native community for the amazing framework
- MongoDB for the flexible database solution
- AWS for reliable cloud storage
- Socket.io for real-time functionality

## 📞 Support

For support, email support@fins-app.com or join our Discord community.

---

Made with ❤️ by the Fins Team