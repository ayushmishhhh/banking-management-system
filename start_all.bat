@echo off
title Bank of Bagru — Full Stack Launcher
echo ====================================================================
echo Starting Bank of Bagru Full-Stack System
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:5173
echo ====================================================================

start "Bank of Bagru - Backend" "%~dp0run_backend.bat"
timeout /t 5 /nobreak >nul
start "Bank of Bagru - Frontend" "%~dp0run_frontend.bat"

echo.
echo Both services have been launched in separate command windows.
echo Access the application in your browser at: http://localhost:5173
echo.
pause
