@echo off
echo.
echo ========================================
echo   Notification System Test Runner
echo ========================================
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

echo Checking if dependencies are installed...
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 🚀 Starting notification system test...
echo.

echo Before running the test, make sure:
echo 1. Your backend server is running on port 3001
echo 2. You have valid user credentials
echo 3. You've updated the TEST_USER in test-notification-simple.js
echo.

set /p choice="Do you want to continue? (y/n): "
if /i "%choice%"=="y" (
    echo.
    echo Running test...
    npm test
    echo.
    echo Test completed!
) else (
    echo Test cancelled.
)

echo.
pause
