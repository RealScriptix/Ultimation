#!/bin/bash

# Fins App Setup Script
# This script helps you set up the Fins short video sharing app

echo "🌊 Setting up Fins - Short Video Sharing App"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ is required. Current version: $(node --version)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) is installed${NC}"

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo -e "${YELLOW}⚠️ MongoDB is not installed. Please install MongoDB 5+ for the database.${NC}"
    echo -e "${BLUE}You can also use MongoDB Atlas (cloud) by updating the MONGODB_URI in backend/.env${NC}"
fi

# Check if React Native CLI is installed
if ! command -v react-native &> /dev/null; then
    echo -e "${YELLOW}⚠️ React Native CLI is not installed. Installing now...${NC}"
    npm install -g react-native-cli
fi

echo -e "${BLUE}📦 Installing dependencies...${NC}"

# Install backend dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
cd backend
npm install

# Create backend .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}📄 Creating backend .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Backend .env file created. Please update it with your configuration.${NC}"
fi

# Go back to root
cd ..

# Install frontend dependencies
echo -e "${BLUE}Installing frontend dependencies...${NC}"
cd frontend
npm install

# Create frontend .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}📄 Creating frontend .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Frontend .env file created. Please update it with your configuration.${NC}"
fi

# Install iOS dependencies (if on macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${BLUE}🍎 Installing iOS dependencies...${NC}"
    cd ios
    if command -v pod &> /dev/null; then
        pod install
    else
        echo -e "${YELLOW}⚠️ CocoaPods not found. Please install CocoaPods first:${NC}"
        echo -e "${BLUE}sudo gem install cocoapods${NC}"
    fi
    cd ..
fi

# Go back to root
cd ..

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}🚀 Quick Start Guide:${NC}"
echo ""
echo -e "${YELLOW}1. Configure your environment:${NC}"
echo "   • Update backend/.env with your database and API keys"
echo "   • Update frontend/.env with your API configuration"
echo ""
echo -e "${YELLOW}2. Start the backend server:${NC}"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo -e "${YELLOW}3. Start the React Native app:${NC}"
echo "   cd frontend"
echo "   npm run android    # For Android"
echo "   npm run ios        # For iOS"
echo ""
echo -e "${YELLOW}4. Optional - Start MongoDB (if local):${NC}"
echo "   mongod"
echo ""
echo -e "${BLUE}📱 App Features:${NC}"
echo "   • Swipe right to like videos"
echo "   • Swipe left to go to next video"
echo "   • Swipe down to view channel"
echo "   • Swipe up to go to previous video"
echo "   • Double tap to like"
echo "   • Single tap to pause/play"
echo ""
echo -e "${BLUE}🔧 Development Tools:${NC}"
echo "   • Backend API: http://localhost:3000"
echo "   • API Documentation: http://localhost:3000/api-docs"
echo "   • Health Check: http://localhost:3000/health"
echo ""
echo -e "${GREEN}🎉 Happy coding with Fins!${NC}"

# Create a quick start script
cat > start.sh << 'EOF'
#!/bin/bash
echo "🌊 Starting Fins App..."

# Start MongoDB (if installed locally)
if command -v mongod &> /dev/null; then
    echo "Starting MongoDB..."
    mongod --fork --logpath /var/log/mongod.log
fi

# Start backend in background
echo "Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start React Native
echo "Starting React Native app..."
cd ../frontend
npm run android

# Cleanup function
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Wait for processes
wait
EOF

chmod +x start.sh

echo -e "${GREEN}✅ Created start.sh script for quick startup${NC}"
echo -e "${BLUE}Run ./start.sh to start the entire application${NC}"