#!/bin/bash

# TaskFlow Development Environment Startup Script
# This script starts both the backend and mobile app for development

echo "🚀 Starting TaskFlow Development Environment..."
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    else
        echo "✅ Port $1 is available"
        return 0
    fi
}

# Check required ports
echo "🔍 Checking required ports..."
check_port 3000  # Backend port
check_port 8081  # Expo dev server port

# Install dependencies if needed
echo "📦 Installing dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing root dependencies..."
    npm install
fi

if [ ! -d "apps/main/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd apps/main && npm install && cd ../..
fi

if [ ! -d "apps/mobile/node_modules" ]; then
    echo "Installing mobile dependencies..."
    cd apps/mobile && npm install && cd ../..
fi

# Create environment files if they don't exist
echo "🔧 Setting up environment files..."

# Backend environment
if [ ! -f "apps/main/.env" ]; then
    echo "Creating backend .env file..."
    cat > apps/main/.env << EOF
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/taskflow-dev
JWT_SECRET=your-jwt-secret-key-here
CORS_ORIGIN=http://localhost:8081
EOF
fi

# Mobile environment
if [ ! -f "apps/mobile/.env" ]; then
    echo "Creating mobile .env file..."
    cat > apps/mobile/.env << EOF
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:3000
NODE_ENV=development
EOF
fi

echo "🎯 Starting services..."
echo "======================"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID 2>/dev/null
    kill $MOBILE_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend
echo "🔧 Starting backend server..."
cd apps/main
npm run dev &
BACKEND_PID=$!
cd ../..

# Wait a moment for backend to start
sleep 3

# Start mobile app
echo "📱 Starting mobile app..."
cd apps/mobile
npm start &
MOBILE_PID=$!
cd ../..

echo ""
echo "🎉 Development environment started!"
echo "=================================="
echo ""
echo "📊 Services Status:"
echo "  • Backend API: http://localhost:3000"
echo "  • Mobile App: http://localhost:8081"
echo "  • Expo DevTools: http://localhost:19002"
echo ""
echo "🧪 Testing Your Implementation:"
echo "==============================="
echo ""
echo "1. 📱 Mobile App Testing:"
echo "   • Open Expo Go app on your phone"
echo "   • Scan the QR code from the terminal"
echo "   • Or press 'w' to open in web browser"
echo ""
echo "2. 🔍 Test Navigation:"
echo "   • Tap the hamburger menu (☰) in the top-left"
echo "   • Test all sidebar navigation items:"
echo "     - Home (Dashboard)"
echo "     - Analytics"
echo "     - Workspaces"
echo "     - Templates"
echo "     - Settings"
echo ""
echo "3. 📊 Test Dashboard Features:"
echo "   • Check if stats cards display correctly"
echo "   • Test pull-to-refresh functionality"
echo "   • Verify theming (dark/light mode)"
echo ""
echo "4. 🔗 Test Redux Integration:"
echo "   • Check if data loads from backend"
echo "   • Verify loading states"
echo "   • Test error handling"
echo ""
echo "5. 🎨 Test UI Components:"
echo "   • Verify all themed components work"
echo "   • Check responsive design"
echo "   • Test touch interactions"
echo ""
echo "📝 Debug Information:"
echo "===================="
echo "• Backend logs: Check terminal for API requests"
echo "• Mobile logs: Check Expo DevTools or terminal"
echo "• Network issues: Verify backend is running on port 3000"
echo ""
echo "🛑 To stop all services: Press Ctrl+C"
echo ""

# Wait for processes
wait $BACKEND_PID $MOBILE_PID
