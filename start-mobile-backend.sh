#!/bin/bash

echo "Starting TaskFlow Mobile + Backend Development Environment..."
echo

echo "Starting Backend Server..."
cd apps/backend && npm run dev &
BACKEND_PID=$!

echo "Waiting 3 seconds for backend to start..."
sleep 3

echo "Starting Mobile App..."
cd ../mobile && npm start &
MOBILE_PID=$!

echo
echo "Both services are starting..."
echo "Backend: http://localhost:3001"
echo "Mobile: Expo DevTools (port 19000)"
echo
echo "Press Ctrl+C to stop both services..."

# Function to cleanup processes on exit
cleanup() {
    echo "Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $MOBILE_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
