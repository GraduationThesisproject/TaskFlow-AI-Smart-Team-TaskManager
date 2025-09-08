@echo off
REM TaskFlow Development Environment Startup Script for Windows
REM This script starts both the backend and mobile app for development

echo 🚀 Starting TaskFlow Development Environment...
echo ================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo 📦 Installing dependencies...
if not exist "node_modules" (
    echo Installing root dependencies...
    npm install
)

if not exist "apps\main\node_modules" (
    echo Installing backend dependencies...
    cd apps\main
    npm install
    cd ..\..
)

if not exist "apps\mobile\node_modules" (
    echo Installing mobile dependencies...
    cd apps\mobile
    npm install
    cd ..\..
)

echo 🔧 Setting up environment files...

REM Backend environment
if not exist "apps\main\.env" (
    echo Creating backend .env file...
    (
        echo NODE_ENV=development
        echo PORT=3000
        echo MONGODB_URI=mongodb://localhost:27017/taskflow-dev
        echo JWT_SECRET=your-jwt-secret-key-here
        echo CORS_ORIGIN=http://localhost:8081
    ) > apps\main\.env
)

REM Mobile environment
if not exist "apps\mobile\.env" (
    echo Creating mobile .env file...
    (
        echo EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
        echo EXPO_PUBLIC_SOCKET_URL=http://localhost:3000
        echo NODE_ENV=development
    ) > apps\mobile\.env
)

echo 🎯 Starting services...
echo ======================

REM Start backend in a new window
echo 🔧 Starting backend server...
start "TaskFlow Backend" cmd /k "cd apps\main && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start mobile app in a new window
echo 📱 Starting mobile app...
start "TaskFlow Mobile" cmd /k "cd apps\mobile && npm start"

echo.
echo 🎉 Development environment started!
echo ==================================
echo.
echo 📊 Services Status:
echo   • Backend API: http://localhost:3000
echo   • Mobile App: http://localhost:8081
echo   • Expo DevTools: http://localhost:19002
echo.
echo 🧪 Testing Your Implementation:
echo ===============================
echo.
echo 1. 📱 Mobile App Testing:
echo    • Open Expo Go app on your phone
echo    • Scan the QR code from the mobile terminal
echo    • Or press 'w' to open in web browser
echo.
echo 2. 🔍 Test Navigation:
echo    • Tap the hamburger menu (☰) in the top-left
echo    • Test all sidebar navigation items:
echo      - Home (Dashboard)
echo      - Analytics
echo      - Workspaces
echo      - Templates
echo      - Settings
echo.
echo 3. 📊 Test Dashboard Features:
echo    • Check if stats cards display correctly
echo    • Test pull-to-refresh functionality
echo    • Verify theming (dark/light mode)
echo.
echo 4. 🔗 Test Redux Integration:
echo    • Check if data loads from backend
echo    • Verify loading states
echo    • Test error handling
echo.
echo 5. 🎨 Test UI Components:
echo    • Verify all themed components work
echo    • Check responsive design
echo    • Test touch interactions
echo.
echo 📝 Debug Information:
echo ====================
echo • Backend logs: Check the "TaskFlow Backend" window
echo • Mobile logs: Check the "TaskFlow Mobile" window
echo • Network issues: Verify backend is running on port 3000
echo.
echo 🛑 To stop services: Close the terminal windows
echo.
pause
