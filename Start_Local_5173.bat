@echo off
title PROMPT HRMS — Local Dev Launcher (:5173 + API :5050)
setlocal

set "ROOT_DIR=%~dp0"
set "API_DIR=%ROOT_DIR%HRMS\backend\src\HRMS.API"
set "WEB_DIR=%ROOT_DIR%HRMS\frontend"
set "DOTNET_CLI_HOME=%ROOT_DIR%.dotnet-cli"
set "DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1"

echo ============================================================================
echo   PROMPT HRMS (UG Suite) — Starting Local Environment
echo   Frontend URL : http://127.0.0.1:5173/
echo   Backend API  : http://127.0.0.1:5050/swagger
echo ============================================================================
echo.

REM 1. Start .NET 8 Backend API on port 5050 if not already listening
netstat -ano | findstr /R /C:":5050 .*LISTENING" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [1/2] Starting .NET 8 Backend API on http://127.0.0.1:5050 ...
    if exist "C:\Program Files\dotnet\dotnet.exe" (
        start "PROMPT HRMS API (:5050)" /MIN cmd /k "cd /d "%API_DIR%" && set DOTNET_CLI_HOME=%DOTNET_CLI_HOME% && "C:\Program Files\dotnet\dotnet.exe" run --urls http://127.0.0.1:5050"
    ) else (
        start "PROMPT HRMS API (:5050)" /MIN cmd /k "cd /d "%API_DIR%" && dotnet run --urls http://127.0.0.1:5050"
    )
) else (
    echo [1/2] .NET 8 Backend API is already running on http://127.0.0.1:5050
)

REM 2. Start Vite Frontend Dev Server on port 5173 (or open browser if already running)
netstat -ano | findstr /R /C:":5173 .*LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [2/2] Frontend Dev Server is already running on http://127.0.0.1:5173/
    echo Opening browser...
    start "" "http://127.0.0.1:5173/"
    timeout /t 3 >nul
    exit /b 0
)

echo [2/2] Starting Vite Frontend Dev Server on http://127.0.0.1:5173/ ...
cd /d "%WEB_DIR%"
start "" cmd /c "timeout /t 2 >nul && start "" http://127.0.0.1:5173/"
call npm run dev -- --host 127.0.0.1 --port 5173
pause
