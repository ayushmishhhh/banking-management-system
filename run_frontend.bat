@echo off
title Bank of Bagru — React Vite Frontend (Port 5173)
set "PATH=C:\Program Files\nodejs;%PATH%"

echo ====================================================================
echo Starting Bank of Bagru — React Fintech Dashboard
echo Opening on: http://localhost:5173
echo API Proxy: http://localhost:8080
echo ====================================================================

cd /d "%~dp0frontend"
call npm run dev
pause
