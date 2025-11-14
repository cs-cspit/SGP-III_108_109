@echo off
echo ========================================
echo Starting SGP Development Servers
echo ========================================
echo.

REM Start backend server in a new window
echo Starting Backend Server (nodemon)...
start "Backend Server" cmd /k "cd backend && nodemon"

REM Wait for 2 seconds before starting frontend
timeout /t 2 /nobreak >nul

REM Start frontend server in a new window
echo Starting Frontend Server (npm run dev)...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Both servers are starting!
echo Backend: Running on nodemon
echo Frontend: Running on Vite dev server
echo ========================================
echo.
echo Press any key to close this window...
pause >nul
