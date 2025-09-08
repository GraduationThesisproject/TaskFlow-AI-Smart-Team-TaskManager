@echo off
echo Starting TaskFlow Mobile + Backend Development Environment...
echo.

echo Starting Backend Server...
start "TaskFlow Backend" cmd /k "cd apps\backend && npm run dev"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Mobile App...
start "TaskFlow Mobile" cmd /k "cd apps\mobile && npm start"

echo.
echo Both services are starting...
echo Backend: http://localhost:3001
echo Mobile: Expo DevTools (port 19000)
echo.
echo Press any key to exit...
pause > nul
