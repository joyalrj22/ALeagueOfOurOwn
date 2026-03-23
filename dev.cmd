@echo off
setlocal

REM Always run from the directory where this script lives (repo root)
cd /d "%~dp0"

REM === Simple one-shot local dev runner for Windows ===
REM - Ensures UI deps are installed
REM - Ensures Python deps for Netlify functions are installed (in .venv)
REM - Starts `netlify dev` at the repo root

REM --- Helper: check for a command on PATH (no parentheses to avoid parsing issues) ---
where node >nul 2>&1
if errorlevel 1 goto NoNode

where npm >nul 2>&1
if errorlevel 1 goto NoNpm

where python >nul 2>&1
if errorlevel 1 goto NoPython

where pip >nul 2>&1
if errorlevel 1 goto NoPip

where netlify >nul 2>&1
if errorlevel 1 goto NoNetlify

echo.
echo [dev.cmd] Installing/updating UI dependencies...
set "DEV_ROOT=%~dp0"
set "DEV_UI=%DEV_ROOT%ui"
cmd /c "npm install --prefix %DEV_UI%"
if errorlevel 1 goto UIFail

echo.
echo [dev.cmd] Starting Netlify dev server (this may take a moment)...
echo [dev.cmd] When it is ready, open http://localhost:3001/ in your browser.
cd /d "%~dp0"
netlify dev --command "npm --prefix ui run dev" --target-port 3000 --port 3001
set EXIT_CODE=%ERRORLEVEL%
goto End

:NoNode
echo [dev.cmd] Node.js is not installed or not on PATH.
echo Install Node.js from https://nodejs.org/ and try again.
set EXIT_CODE=1
goto End

:NoNpm
echo [dev.cmd] npm is not installed or not on PATH.
echo Install Node.js (which includes npm) and try again.
set EXIT_CODE=1
goto End

:NoNetlify
echo [dev.cmd] Netlify CLI is not installed or not on PATH.
echo Install it with: npm install -g netlify-cli
set EXIT_CODE=1
goto End

:UIFail
echo [dev.cmd] Failed to install UI dependencies.
set EXIT_CODE=1
goto End

:End
endlocal & exit /b %EXIT_CODE%

