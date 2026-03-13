@echo off
setlocal ENABLEDELAYEDEXPANSION

REM === Config / arguments ===
if "%~1"=="" (
    set "STAGING_BRANCH=staging"
) else (
    set "STAGING_BRANCH=%~1"
)

REM === Ensure we're in a git repo and get current branch ===
for /f "delims=" %%B in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "CURRENT_BRANCH=%%B"

if "%CURRENT_BRANCH%"=="" (
    echo Not inside a git repository or unable to detect current branch.
    exit /b 1
)

echo Current branch: %CURRENT_BRANCH%
echo Staging branch: %STAGING_BRANCH%
echo.

REM === 1. Make sure staging branch is up to date ===
echo Fetching latest refs...
git fetch --all --prune
if errorlevel 1 (
    echo git fetch failed.
    exit /b 1
)

echo Checking out %STAGING_BRANCH%...
git checkout "%STAGING_BRANCH%"
if errorlevel 1 (
    echo Failed to checkout staging branch "%STAGING_BRANCH%".
    exit /b 1
)

echo Pulling latest on %STAGING_BRANCH%...
git pull --ff-only
if errorlevel 1 (
    echo Failed to update staging branch from remote.
    exit /b 1
)

REM === 2. Merge the current branch into staging ===
echo Merging "%CURRENT_BRANCH%" into "%STAGING_BRANCH%"...
git merge --no-ff "%CURRENT_BRANCH%"
if errorlevel 1 (
    echo.
    echo MERGE CONFLICTS DETECTED.
    echo Resolve conflicts on "%STAGING_BRANCH%" then commit/push manually.
    echo Staying on "%STAGING_BRANCH%" so you can fix them.
    exit /b 1
)

REM === 3. If no conflicts, push the staging branch ===
echo.
echo Merge successful. Pushing "%STAGING_BRANCH%"...
git push origin "%STAGING_BRANCH%"
if errorlevel 1 (
    echo Failed to push staging branch. Check the error above.
    REM We still switch back to the original branch.
)

REM === 4. Switch back to the original branch ===
echo.
echo Switching back to "%CURRENT_BRANCH%"...
git checkout "%CURRENT_BRANCH%"
if errorlevel 1 (
    echo WARNING: Failed to switch back to "%CURRENT_BRANCH%".
    exit /b 1
)

echo.
echo Done.
endlocal
exit /b 0

