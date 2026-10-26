@echo off
title Bank of Bagru — Spring Boot Backend (Port 8080)
set "JAVA_HOME=C:\Program Files\Java\jdk-21.0.12"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo ====================================================================
echo Starting Bank of Bagru — Spring Boot Core Banking Backend
echo Listening on: http://localhost:8080
echo Connected to: MySQL (localhost:3306/bank_of_bagru_db)
echo ====================================================================

cd /d "%~dp0backend"
call "..\tools\apache-maven-3.9.9\bin\mvn.cmd" spring-boot:run
pause
